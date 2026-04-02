export type Position = {
    x: number;
    y: number;
};

export type SurvivorType = 'CHILD' | 'ADULT';
export type SurvivorStatus = 'WAITING' | 'SAVED' | 'DROWNED' | 'SACRIFICED';

export interface Survivor {
    id: string;
    type: SurvivorType;
    position: Position;
    status: SurvivorStatus;
    hp: number; // 0-100
}

export interface AgentState {
    position: Position;
    energy: number; // 0-100
    carrying: SurvivorType | null;
}

export interface GameState {
    waterLevel: number; // 0.0 to 1.0 (1.0 = full flood)
    agent: AgentState;
    survivors: Survivor[];
    timeElapsed: number;
    gameOver: boolean;
    outcome: 'WIN_BOTH' | 'WIN_ONE' | 'LOSS_DEATH' | 'LOSS_DROWNED' | null;
}

export const ACTIONS = {
    UP: 0,
    DOWN: 1,
    LEFT: 2,
    RIGHT: 3,
    INTERACT: 4, // Pick up / Drop off / Save
} as const;

export type Action = (typeof ACTIONS)[keyof typeof ACTIONS];

export const CONSTANTS = {
    GRID_SIZE: 10,
    MAX_STEPS: 200,
    WATER_RISE_RATE: 0.005,
    ENERGY_COST_MOVE: 1,
    ENERGY_COST_CARRY: 2,
    REWARD_CHILD: 0.8,
    REWARD_ADULT: 0.5,
    REWARD_BOTH_BONUS: 0.4,
    PENALTY_DEATH: -1.0,
    PENALTY_TIME: -0.01,
    PENALTY_DROWNED: -0.5,
};
