import * as tf from '@tensorflow/tfjs';

export interface Experience {
    state: number[];
    action: number;
    reward: number;
    nextState: number[];
    done: boolean;
}

export class ReplayBuffer {
    buffer: Experience[];
    maxSize: number;
    ptr: number;

    constructor(maxSize: number = 100000) {
        this.maxSize = maxSize;
        this.buffer = [];
        this.ptr = 0;
    }

    add(experience: Experience) {
        if (this.buffer.length < this.maxSize) {
            this.buffer.push(experience);
        } else {
            this.buffer[this.ptr] = experience;
        }
        this.ptr = (this.ptr + 1) % this.maxSize;
    }

    sample(batchSize: number): Experience[] {
        const batch: Experience[] = [];
        if (this.buffer.length < batchSize) return this.buffer; // Not enough samples

        // Random sampling
        const indices = new Set<number>();
        while (indices.size < batchSize) {
            indices.add(Math.floor(Math.random() * this.buffer.length));
        }

        indices.forEach(i => batch.push(this.buffer[i]));
        return batch;
    }

    size(): number {
        return this.buffer.length;
    }
}
