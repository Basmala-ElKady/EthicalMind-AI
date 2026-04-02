import { Action, ACTIONS, CONSTANTS, GameState } from './types';

export class SimulationEngine {
    state: GameState;
    initialState: GameState;

    constructor() {
        this.initialState = this.createInitialState();
        this.state = JSON.parse(JSON.stringify(this.initialState));
    }

    private createInitialState(): GameState {
        return {
            waterLevel: 0,
            agent: {
                position: { x: 5, y: 0 }, // Start at bottom center
                energy: 100,
                carrying: null,
            },
            survivors: [
                {
                    id: 'child',
                    type: 'CHILD',
                    position: { x: 2, y: 8 }, // High up, left
                    status: 'WAITING',
                    hp: 100,
                },
                {
                    id: 'adult',
                    type: 'ADULT',
                    position: { x: 8, y: 6 }, // Mid-high, right
                    status: 'WAITING',
                    hp: 100,
                }
            ],
            timeElapsed: 0,
            gameOver: false,
            outcome: null,
        };
    }

    reset(): GameState {
        this.state = JSON.parse(JSON.stringify(this.initialState));
        // Randomize positions slightly for robustness
        this.state.survivors[0].position.x = 1 + Math.floor(Math.random() * 3);
        this.state.survivors[1].position.x = 6 + Math.floor(Math.random() * 3);
        return this.state;
    }

    step(action: Action): { nextState: GameState; reward: number; done: boolean } {
        if (this.state.gameOver) {
            return { nextState: this.state, reward: 0, done: true };
        }

        let reward = 0;
        this.state.timeElapsed++;

        // 1. Apply Action
        reward += this.handleAction(action);

        // 2. Environment Dynamics (Water Rise)
        this.state.waterLevel += CONSTANTS.WATER_RISE_RATE + (Math.random() * 0.002);
        if (this.state.waterLevel > 1.0) this.state.waterLevel = 1.0;

        // 3. Check Survivor Status (Drowning)
        this.checkSurvivors();

        // 4. Check Game Over Conditions
        const done = this.checkGameOver();
        if (done) {
            if (this.state.outcome?.includes('LOSS')) reward += CONSTANTS.PENALTY_DEATH;
        } else {
            reward += CONSTANTS.PENALTY_TIME; // Encourage speed
        }

        // Normalize state for AI input? No, return raw state here.
        return { nextState: { ...this.state }, reward, done };
    }

    private handleAction(action: Action): number {
        let reward = 0;
        const { agent, survivors } = this.state;
        let nextX = agent.position.x;
        let nextY = agent.position.y;

        // Energy check
        if (agent.energy <= 0) return 0; // Cannot move

        // Movement
        if (action === ACTIONS.UP) nextY = Math.min(CONSTANTS.GRID_SIZE - 1, nextY + 1);
        if (action === ACTIONS.DOWN) nextY = Math.max(0, nextY - 1);
        if (action === ACTIONS.LEFT) nextX = Math.max(0, nextX - 1);
        if (action === ACTIONS.RIGHT) nextX = Math.min(CONSTANTS.GRID_SIZE - 1, nextX + 1);

        // Interaction
        if (action === ACTIONS.INTERACT) {
            // Pick up or Save logic
            // Check if near survivor
            const nearbySurvivor = survivors.find(s =>
                Math.abs(s.position.x - agent.position.x) <= 1 &&
                Math.abs(s.position.y - agent.position.y) <= 1 &&
                s.status === 'WAITING'
            );

            // Save zone (bottom of screen, y=0) ?? Actually maybe top is safe? 
            // Let's say Safe Zone is the Roof (Top, y=GRID_SIZE-1) or maybe a boat at bottom?
            // "Flooded high-rise" -> Water rises from bottom. Roof is safe.
            // So Safe Zone is y >= 9.
            const isSafeZone = agent.position.y >= CONSTANTS.GRID_SIZE - 1;

            if (agent.carrying) {
                if (isSafeZone) {
                    // DROP OFF / SAVE
                    const carried = survivors.find(s => s.type === agent.carrying);
                    if (carried) {
                        carried.status = 'SAVED';
                        carried.position = { ...agent.position }; // Stay on roof
                        agent.carrying = null;
                        reward += carried.type === 'CHILD' ? CONSTANTS.REWARD_CHILD : CONSTANTS.REWARD_ADULT;

                        // Check for dual save bonus
                        const allSaved = survivors.every(s => s.status === 'SAVED');
                        if (allSaved) reward += CONSTANTS.REWARD_BOTH_BONUS;
                    }
                }
            } else {
                // PICK UP
                if (nearbySurvivor) {
                    agent.carrying = nearbySurvivor.type;
                    // Remove survivor from map (visually follows agent)
                }
            }
        } else {
            // Apply movement
            agent.position.x = nextX;
            agent.position.y = nextY;
            agent.energy -= agent.carrying ? CONSTANTS.ENERGY_COST_CARRY : CONSTANTS.ENERGY_COST_MOVE;
        }

        // Punishment for being underwater
        // Water level 0.0 -> y=0 underwater?
        // Let's say Water Level 0.5 means y < 5 is underwater.
        const waterHeight = this.state.waterLevel * CONSTANTS.GRID_SIZE;
        if (agent.position.y < waterHeight) {
            reward -= 0.05; // Pain of drowning
            agent.energy -= 2; // Extra energy loss
        }

        return reward;
    }

    private checkSurvivors() {
        const waterHeight = this.state.waterLevel * CONSTANTS.GRID_SIZE;
        this.state.survivors.forEach(s => {
            if (s.status === 'WAITING') {
                if (s.position.y < waterHeight) {
                    s.hp -= 5;
                    if (s.hp <= 0) {
                        s.status = 'DROWNED';
                    }
                }
            }
        });
    }

    private checkGameOver(): boolean {
        // 1. Agent Drowned/No Energy? 
        if (this.state.agent.energy <= 0) {
            this.state.outcome = 'LOSS_DEATH'; // Exhausted
            this.state.gameOver = true;
            return true;
        }

        // 2. All survivors accounted for?
        const allDone = this.state.survivors.every(s => s.status !== 'WAITING');
        if (allDone) {
            const savedCount = this.state.survivors.filter(s => s.status === 'SAVED').length;
            if (savedCount === 2) this.state.outcome = 'WIN_BOTH';
            else if (savedCount > 0) this.state.outcome = 'WIN_ONE';
            else this.state.outcome = 'LOSS_DROWNED';
            this.state.gameOver = true;
            return true;
        }

        // 3. Agent underwater too long? (Simplified to energy loss for now)

        return false;
    }
}
