import * as tf from '@tensorflow/tfjs';
import { ReplayBuffer } from './ReplayBuffer';
import { Action, CONSTANTS, GameState } from '../simulation/types';

export class DQNAgent {
    model: tf.Sequential;
    targetModel: tf.Sequential;
    buffer: ReplayBuffer;
    epsilon: number;
    epsilonMin: number = 0.05;
    epsilonDecay: number = 0.995;
    gamma: number = 0.99;
    learningRate: number = 0.001;
    batchSize: number = 64;
    inputShape: number;
    outputShape: number;

    constructor(inputShape: number, outputShape: number) {
        this.inputShape = inputShape;
        this.outputShape = outputShape;
        this.buffer = new ReplayBuffer(50000);
        this.epsilon = 1.0;

        this.model = this.createModel();
        this.targetModel = this.createModel();
        this.updateTargetModel();
    }

    createModel(): tf.Sequential {
        const model = tf.sequential();
        model.add(tf.layers.dense({
            units: 64,
            activation: 'relu',
            inputShape: [this.inputShape],
            kernelInitializer: 'heNormal'
        }));
        model.add(tf.layers.dense({
            units: 64,
            activation: 'relu',
            kernelInitializer: 'heNormal'
        }));
        model.add(tf.layers.dense({
            units: this.outputShape,
            activation: 'linear' // Q-values
        }));

        model.compile({
            optimizer: tf.train.adam(this.learningRate),
            loss: 'meanSquaredError'
        });

        return model;
    }

    updateTargetModel() {
        this.targetModel.setWeights(this.model.getWeights());
    }

    act(state: number[]): Action {
        if (Math.random() < this.epsilon) {
            return Math.floor(Math.random() * this.outputShape) as Action;
        }
        return tf.tidy(() => {
            const stateTensor = tf.tensor2d([state]);
            const prediction = this.model.predict(stateTensor) as tf.Tensor;
            return prediction.argMax(1).dataSync()[0] as Action;
        });
    }

    async train() {
        if (this.buffer.size() < this.batchSize) return;

        const batch = this.buffer.sample(this.batchSize);

        // Prepare tensors
        const states = tf.tensor2d(batch.map(e => e.state));
        const nextStates = tf.tensor2d(batch.map(e => e.nextState));

        // Calculate target Q-values
        const qNext = this.targetModel.predict(nextStates) as tf.Tensor;
        const qNextMax = qNext.max(1);

        const targets = batch.map((e, i) => {
            if (e.done) return e.reward;
            return e.reward + this.gamma * qNextMax.dataSync()[i];
        });

        // Create target batch for training
        // We only update the Q-value for the action taken
        const qCurrent = this.model.predict(states) as tf.Tensor;
        const qCurrentData = qCurrent.arraySync() as number[][];

        batch.forEach((e, i) => {
            qCurrentData[i][e.action] = targets[i];
        });

        const targetTensor = tf.tensor2d(qCurrentData);

        await this.model.fit(states, targetTensor, {
            epochs: 1,
            verbose: 0,
            batchSize: this.batchSize
        });

        // Clean up tensors
        states.dispose();
        nextStates.dispose();
        qNext.dispose();
        qCurrent.dispose();
        targetTensor.dispose();

        // Decay epsilon
        if (this.epsilon > this.epsilonMin) {
            this.epsilon *= this.epsilonDecay;
        }
    }

    // Preprocess game state into neural net input vector
    static encodeState(gameState: GameState): number[] {
        // Normalize values
        const s = gameState;
        const agentX = s.agent.position.x / CONSTANTS.GRID_SIZE;
        const agentY = s.agent.position.y / CONSTANTS.GRID_SIZE;
        const water = s.waterLevel;
        const energy = s.agent.energy / 100;

        // Survivors relative pos
        const child = s.survivors.find(su => su.type === 'CHILD');
        const adult = s.survivors.find(su => su.type === 'ADULT');

        const childX = child ? (child.position.x - s.agent.position.x) / CONSTANTS.GRID_SIZE : 0;
        const childY = child ? (child.position.y - s.agent.position.y) / CONSTANTS.GRID_SIZE : 0;
        const adultX = adult ? (adult.position.x - s.agent.position.x) / CONSTANTS.GRID_SIZE : 0;
        const adultY = adult ? (adult.position.y - s.agent.position.y) / CONSTANTS.GRID_SIZE : 0;

        // Status encodings
        const carryingChild = s.agent.carrying === 'CHILD' ? 1 : 0;
        const carryingAdult = s.agent.carrying === 'ADULT' ? 1 : 0;

        return [
            agentX, agentY,
            water, energy,
            childX, childY, (child?.status === 'SAVED' ? 1 : 0),
            adultX, adultY, (adult?.status === 'SAVED' ? 1 : 0),
            carryingChild, carryingAdult
        ];
    }
}
