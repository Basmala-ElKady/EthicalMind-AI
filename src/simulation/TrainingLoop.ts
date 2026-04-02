import { SimulationEngine } from './Engine';
import { DQNAgent } from '../ai/DQNAgent';
import { ACTIONS, GameState } from './types';

export interface TrainingStats {
    episode: number;
    totalReward: number;
    epsilon: number;
    steps: number;
    outcome: string;
    loss?: number;
}

export class TrainingLoop {
    engine: SimulationEngine;
    agent: DQNAgent;
    stats: TrainingStats[] = [];
    onUpdate: (stats: TrainingStats) => void;
    onStep?: (state: GameState, stepCount: number) => void;
    stopRequested = false;
    isConverged = false;
    delay: number = 0; // ms delay between steps

    constructor(
        onUpdate: (stats: TrainingStats) => void,
        onStep?: (state: GameState, stepCount: number) => void
    ) {
        this.engine = new SimulationEngine();
        // Input size: 12 (from DQNAgent.encodeState)
        // Output size: 5 (ACTIONS)
        this.agent = new DQNAgent(12, 5);
        this.onUpdate = onUpdate;
        this.onStep = onStep;
    }

    async start() {
        let episode = 0;

        while (!this.stopRequested && !this.isConverged) {
            episode++;
            this.engine.reset();
            let totalReward = 0;
            let done = false;
            let steps = 0;

            while (!done && steps < 500) { // Max steps per episode safety
                if (this.stopRequested) break;

                const stateVec = DQNAgent.encodeState(this.engine.state);
                const action = this.agent.act(stateVec);

                const { nextState, reward, done: isDone } = this.engine.step(action);
                const nextStateVec = DQNAgent.encodeState(nextState);

                this.agent.buffer.add({
                    state: stateVec,
                    action,
                    reward,
                    nextState: nextStateVec,
                    done: isDone
                });

                // Train every 4 steps
                if (steps % 4 === 0) {
                    await this.agent.train();
                }

                totalReward += reward;
                done = isDone;
                steps++;

                this.onStep?.(this.engine.state, steps);

                if (this.delay > 0) {
                    await new Promise(r => setTimeout(r, this.delay));
                } else if (steps % 10 === 0) {
                    // Yield to event loop even in fast mode to prevent freeze
                    await new Promise(r => setTimeout(r, 0));
                }
            }

            this.agent.updateTargetModel();

            const episodeStats: TrainingStats = {
                episode,
                totalReward,
                epsilon: this.agent.epsilon,
                steps,
                outcome: this.engine.state.outcome || 'TIMEOUT'
            };

            this.stats.push(episodeStats);
            this.onUpdate(episodeStats);

            this.checkConvergence();

            // Yield to UI between episodes
            await new Promise(r => setTimeout(r, 10));
        }
    }

    stop() {
        this.stopRequested = true;
    }

    checkConvergence() {
        if (this.stats.length < 50) return;

        const last50 = this.stats.slice(-50);
        // const avgReward = last50.reduce((sum, s) => sum + s.totalReward, 0) / 50;
        const successRate = last50.filter(s => s.outcome.includes('WIN')).length / 50;

        // Convergence Criteria 1: Mastery
        // High success rate & stable high reward
        // This is a simplified check
        if (successRate > 0.92 && this.agent.epsilon < 0.05) {
            this.isConverged = true;
            console.log("CONVERGED: Mastery Achieved");
            this.stop();
        }
    }
}
