import React, { useEffect, useRef, useState } from 'react';
import { GameState, CONSTANTS, Survivor } from '../simulation/types';
import { User, Baby, VenetianMask, Zap } from 'lucide-react';

interface RendererProps {
    gameState: GameState;
}

export const Renderer: React.FC<RendererProps> = ({ gameState }) => {
    const rainCanvasRef = useRef<HTMLCanvasElement>(null);

    // Rain Animation
    useEffect(() => {
        const canvas = rainCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let drops: { x: number, y: number, speed: number, len: number }[] = [];
        const width = canvas.width = canvas.parentElement?.clientWidth || 800;
        const height = canvas.height = canvas.parentElement?.clientHeight || 600;

        for (let i = 0; i < 100; i++) {
            drops.push({
                x: Math.random() * width,
                y: Math.random() * height,
                speed: 10 + Math.random() * 10,
                len: 10 + Math.random() * 20
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.strokeStyle = 'rgba(174, 194, 224, 0.5)';
            ctx.lineWidth = 1;
            ctx.beginPath();

            drops.forEach(d => {
                ctx.moveTo(d.x, d.y);
                ctx.lineTo(d.x, d.y + d.len);
                d.y += d.speed;
                d.x -= 1; // Wind
                if (d.y > height) {
                    d.y = -d.len;
                    d.x = Math.random() * width;
                }
            });

            ctx.stroke();
            requestAnimationFrame(animate);
        };

        const animId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animId);
    }, []);

    // Grid Calculation
    const getPositionStyle = (x: number, y: number) => {
        return {
            bottom: `${(y / CONSTANTS.GRID_SIZE) * 100}%`,
            left: `${(x / CONSTANTS.GRID_SIZE) * 100}%`,
            width: `${100 / CONSTANTS.GRID_SIZE}%`,
            height: `${100 / CONSTANTS.GRID_SIZE}%`,
        };
    };

    return (
        <div className="relative w-full max-w-2xl aspect-square bg-gray-900 border-4 border-gray-800 rounded-lg overflow-hidden shadow-2xl">
            {/* Background Storm */}
            <div className="absolute inset-0 bg-gradient-to-b from-black to-slate-900 opacity-90 z-0"></div>

            {/* Rain Layer */}
            <canvas ref={rainCanvasRef} className="absolute inset-0 z-10 pointer-events-none" />

            {/* Game Grid Layer */}
            <div className="absolute inset-0 z-20">
                {/* Agent */}
                <div
                    className="absolute transition-all duration-200 ease-in-out flex items-center justify-center"
                    style={getPositionStyle(gameState.agent.position.x, gameState.agent.position.y)}
                >
                    <div className={`relative p-2 rounded-full ${gameState.agent.energy < 20 ? 'animate-pulse bg-red-900/50' : 'bg-blue-900/50'}`}>
                        <User size={32} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                        {gameState.agent.carrying && (
                            <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-1">
                                <span className="text-[10px] text-black font-bold">CARRY</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Survivors */}
                {gameState.survivors.map(s => {
                    if (s.status !== 'WAITING') return null;
                    return (
                        <div
                            key={s.id}
                            className="absolute transition-all duration-200 ease-in-out flex items-center justify-center"
                            style={getPositionStyle(s.position.x, s.position.y)}
                        >
                            <div className="animate-bounce">
                                {s.type === 'CHILD' ? (
                                    <Baby size={28} className="text-yellow-400 drop-shadow-lg" />
                                ) : (
                                    <VenetianMask size={28} className="text-purple-400 drop-shadow-lg" />
                                )}
                                <span className="absolute -bottom-4 text-[10px] text-white w-full text-center bg-black/50 rounded">{s.hp}%</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Water Layer */}
            <div
                className="absolute bottom-0 left-0 w-full bg-blue-900/60 border-t-4 border-blue-400/50 transition-all duration-100 ease-linear z-30 pointer-events-none backdrop-blur-[2px]"
                style={{ height: `${gameState.waterLevel * 100}%` }}
            >
                <div className="w-full h-4 bg-white/20 animate-pulse"></div>

                {/* Floating Debris/Bubbles could go here */}
            </div>

            {/* HUD Overlay */}
            <div className="absolute top-2 left-2 z-40 text-xs font-mono text-cyan-500 bg-black/70 p-2 rounded border border-cyan-900">
                <div>ENERGY: {Math.floor(gameState.agent.energy)}%</div>
                <div>WATER: {Math.floor(gameState.waterLevel * 100)}%</div>
                <div>TIME: {gameState.timeElapsed}</div>
            </div>

            {/* Game Over Overlay */}
            {gameState.gameOver && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="text-center">
                        <h2 className={`text-4xl font-bold mb-2 ${gameState.outcome?.includes('WIN') ? 'text-green-500' : 'text-red-500'}`}>
                            {gameState.outcome?.replace('_', ' ')}
                        </h2>
                        <p className="text-gray-400">Simulation Stopped</p>
                    </div>
                </div>
            )}
        </div>
    );
};
