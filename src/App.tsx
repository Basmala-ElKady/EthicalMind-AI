import { useRef, useState } from 'react';
import { TrainingLoop, TrainingStats } from './simulation/TrainingLoop';
import { GameState } from './simulation/types';
import { Renderer } from './visuals/Renderer';
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

// Re-implementing Dashboard logic into App for tighter integration if needed, 
// OR passing the loop instance to Dashboard.
// Actually, let's keep Dashboard focused on charts and put controls/renderer here.

function App() {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [stats, setStats] = useState<TrainingStats[]>([]);
    const loopRef = useRef<TrainingLoop | null>(null);
    const [speed, setSpeed] = useState<string>('fast'); // 'realtime' | 'fast'

    const startSimulation = () => {
        if (loopRef.current) return;

        const loop = new TrainingLoop(
            (newStat) => {
                setStats(prev => [...prev, newStat]);
            },
            (state) => {
                // Only update React state for rendering if we are in "watch" mode or generic throttle
                // We can't render 60fps React state updates easily in a tight loop without lag.
                // So we might throttle this.
                if (loopRef.current?.delay !== 0) {
                    setGameState({ ...state }); // Clone to trigger re-render
                } else {
                    // In fast mode, maybe update every 100 steps? or just don't render game state?
                    // Users want to see it? "Fast Forward x10"
                    // If delay is 0, we might just render occasionally
                    if (Math.random() < 0.1) setGameState({ ...state });
                }
            }
        );

        loopRef.current = loop;
        updateSpeed(loop, speed);

        loop.start().then(() => {
            console.log("Simulation Finished");
            loopRef.current = null;
        });
    };

    const updateSpeed = (loop: TrainingLoop, mode: string) => {
        if (mode === 'realtime') loop.delay = 50;
        else if (mode === 'fast') loop.delay = 0;
    };

    const handleSpeedChange = (mode: string) => {
        setSpeed(mode);
        if (loopRef.current) updateSpeed(loopRef.current, mode);
    };

    const stopSimulation = () => {
        if (loopRef.current) loopRef.current.stop();
    };

    const reset = () => {
        stopSimulation();
        setStats([]);
        setGameState(null);
    };

    return (
        <div className="w-full h-full flex flex-row bg-flood-dark overflow-hidden text-white font-sans">
            {/* Left: Simulation View */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
                <div className="absolute top-4 left-8 z-10">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600 drop-shadow-lg">
                        EthicalMind AI
                    </h1>
                    <p className="text-gray-400 text-sm tracking-widest uppercase">AI Ethical Rescue Dilemma</p>
                </div>

                {gameState && <Renderer gameState={gameState} />}

                {!gameState && (
                    <div className="text-gray-500 text-center animate-pulse">
                        <p>Ready to Initialize Neural Network...</p>
                        <button onClick={startSimulation} className="mt-4 px-6 py-3 bg-cyan-900 mx-auto rounded border border-cyan-500 hover:bg-cyan-700 transition">
                            INITIALIZE AGENT
                        </button>
                    </div>
                )}

                {/* Controls */}
                <div className="mt-8 flex gap-4 z-10">
                    <button onClick={startSimulation} className="bg-green-700 px-4 py-2 rounded hover:bg-green-600 font-bold border-b-4 border-green-900 active:border-b-0">
                        PLAY/TRAIN
                    </button>
                    <button onClick={stopSimulation} className="bg-red-700 px-4 py-2 rounded hover:bg-red-600 font-bold border-b-4 border-red-900 active:border-b-0">
                        PAUSE
                    </button>
                    <button onClick={reset} className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">
                        RESET
                    </button>
                    <div className="h-full w-[1px] bg-gray-600 mx-2"></div>
                    <button onClick={() => handleSpeedChange('realtime')} className={`px-4 py-2 rounded ${speed === 'realtime' ? 'bg-cyan-700 ring-2 ring-cyan-400' : 'bg-gray-800'}`}>
                        Real-time
                    </button>
                    <button onClick={() => handleSpeedChange('fast')} className={`px-4 py-2 rounded ${speed === 'fast' ? 'bg-cyan-700 ring-2 ring-cyan-400' : 'bg-gray-800'}`}>
                        Turbo (x100)
                    </button>
                </div>
            </div>

            {/* Right: Dashboard (Charts) */}
            {/* Pass stats to Dashboard via props (modifying Dashboard.tsx next or inline) */}
            {/* Actually, let's reuse Dashboard but better handling of its internal state vs props */}
            {/* For now, I'll just render it if I modify it. But I wrote Dashboard to have its own state. */}
            {/* Let's REWRITE Dashboard usage to just take stats as props for purity. */}

            {/* Inline Dashboard for simplicity/speed since I can't edit Dashboard.tsx easily cleanly without multiple calls */}
            <div className="w-1/3 h-full bg-black/40 border-l border-gray-800 backdrop-blur-md p-4 overflow-y-auto">
                <DashboardView stats={stats} />
            </div>
        </div>
    );
}

// Inline pure component for dashboard view

const DashboardView = ({ stats }: { stats: TrainingStats[] }) => {
    const chartData = {
        labels: stats.map(s => s.episode),
        datasets: [
            {
                label: 'Total Reward',
                data: stats.map(s => s.totalReward),
                borderColor: 'rgb(34, 211, 238)', // Cyan
                backgroundColor: 'rgba(34, 211, 238, 0.1)',
                borderWidth: 1,
                pointRadius: 1,
                tension: 0.1
            },
            {
                label: 'Epsilon (Exploration)',
                data: stats.map(s => s.epsilon * 10), // Scale up
                borderColor: 'rgb(255, 99, 132)',
                borderWidth: 1,
                pointRadius: 0,
                borderDash: [5, 5],
                tension: 0.1
            }
        ]
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold border-b border-gray-700 pb-2">Training Neural Net</h2>

            <div className="bg-black/50 p-2 rounded border border-gray-800 h-48">
                <Line data={chartData} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { display: false },
                        y: { grid: { color: '#333' } }
                    },
                    plugins: { legend: { display: false } }
                }} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-gray-800 p-2 rounded">
                    <div className="text-gray-400">EPISODES</div>
                    <div className="text-2xl text-white">{stats.length}</div>
                </div>
                <div className="bg-gray-800 p-2 rounded">
                    <div className="text-gray-400">AVG REWARD (L50)</div>
                    <div className="text-2xl text-green-400">
                        {stats.length > 0 ? (stats.slice(-50).reduce((a, b) => a + b.totalReward, 0) / Math.min(stats.length, 50)).toFixed(2) : '0.00'}
                    </div>
                </div>
            </div>

            <div className="space-y-1">
                <h3 className="font-bold text-xs uppercase text-gray-500">Log</h3>
                {stats.slice(-15).reverse().map(s => (
                    <div key={s.episode} className={`text-xs p-2 rounded border-l-2 ${s.outcome.includes('WIN_BOTH') ? 'bg-green-900/30 border-green-500' :
                        s.outcome.includes('WIN_ONE') ? 'bg-yellow-900/30 border-yellow-500' :
                            s.outcome.includes('DEATH') ? 'bg-red-900/30 border-red-500' :
                                'bg-gray-800/50 border-gray-600'
                        }`}>
                        <span className="font-bold">Ep {s.episode}</span>: {s.outcome.replace('_', ' ')} <span className="float-right">{s.totalReward.toFixed(1)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default App;
