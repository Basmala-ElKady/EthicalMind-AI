import React, { useEffect, useRef, useState } from 'react';
import { TrainingLoop, TrainingStats } from '../simulation/TrainingLoop';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<TrainingStats[]>([]);
    const loopRef = useRef<TrainingLoop | null>(null);
    const [isRunning, setIsRunning] = useState(false);

    const startTraining = () => {
        if (loopRef.current) return;

        const loop = new TrainingLoop((newStat) => {
            setStats(prev => [...prev, newStat]);
        }, () => { }); // Empty onStep callback

        loopRef.current = loop;
        setIsRunning(true);
        loop.start().then(() => setIsRunning(true)); // Should remain true or handle completion? 
        // Based on start() return it might finish if converged. 
        // Let's keep it as is from original but fix the constructor.
    };

    const stopTraining = () => {
        if (loopRef.current) {
            loopRef.current.stop();
            loopRef.current = null;
            setIsRunning(false);
        }
    };

    const chartData = {
        labels: stats.map(s => s.episode),
        datasets: [
            {
                label: 'Total Reward',
                data: stats.map(s => s.totalReward),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            },
            {
                label: 'Epsilon',
                data: stats.map(s => s.epsilon * 10), // Scale up for visibility
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1
            }
        ]
    };

    return (
        <div className="absolute top-0 right-0 w-1/3 h-full bg-black/80 p-4 border-l border-gray-700 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Neural Network Training</h2>

            <div className="flex gap-2 mb-4">
                {!isRunning ? (
                    <button onClick={startTraining} className="bg-green-600 px-4 py-2 rounded hover:bg-green-500">START SIMULATION</button>
                ) : (
                    <button onClick={stopTraining} className="bg-red-600 px-4 py-2 rounded hover:bg-red-500">STOP</button>
                )}
            </div>

            <div className="bg-gray-900 p-2 rounded mb-4 h-64">
                {stats.length > 0 && <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />}
            </div>

            <div className="space-y-2">
                <h3 className="font-bold">Recent Episodes</h3>
                {stats.slice(-10).reverse().map(s => (
                    <div key={s.episode} className={`text-xs p-2 rounded ${s.outcome.includes('WIN') ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
                        Ep {s.episode}: {s.outcome.replace('_', ' ')} (Reward: {s.totalReward.toFixed(2)})
                    </div>
                ))}
            </div>
        </div>
    );
};
