import React, { useRef, useEffect } from 'react';
import type { PendulumConfig, PendulumState } from '../types';

interface PendulumCanvasProps {
  config: PendulumConfig;
  state: PendulumState;
}

const PendulumCanvas: React.FC<PendulumCanvasProps> = ({ config, state }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathRef = useRef<{ x: number, y: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { L1, L2, m1, m2 } = config;
    const { theta1, theta2 } = state;

    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
      canvas.width = rect.width;
      canvas.height = rect.height;
      pathRef.current = [];
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 3;
    const scale = 100;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const b1x = centerX + L1 * scale * Math.sin(theta1);
    const b1y = centerY + L1 * scale * Math.cos(theta1);
    const b2x = b1x + L2 * scale * Math.sin(theta2);
    const b2y = b1y + L2 * scale * Math.cos(theta2);

    pathRef.current.push({ x: b2x, y: b2y });
    if (pathRef.current.length > 200) pathRef.current.shift();

    if (pathRef.current.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
      ctx.lineWidth = 1;
      ctx.moveTo(pathRef.current[0].x, pathRef.current[0].y);
      for (let i = 1; i < pathRef.current.length; i++) {
        ctx.lineTo(pathRef.current[i].x, pathRef.current[i].y);
      }
      ctx.stroke();
    }

    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(b1x, b1y);
    ctx.stroke();

    ctx.strokeStyle = '#64748b';
    ctx.beginPath();
    ctx.moveTo(b1x, b1y);
    ctx.lineTo(b2x, b2y);
    ctx.stroke();

    const grad1 = ctx.createRadialGradient(b1x - 5, b1y - 5, 2, b1x, b1y, Math.sqrt(m1) * 8);
    grad1.addColorStop(0, '#06b6d4');
    grad1.addColorStop(1, '#0891b2');
    ctx.fillStyle = grad1;
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(6, 182, 212, 0.4)';
    ctx.beginPath();
    ctx.arc(b1x, b1y, Math.sqrt(m1) * 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    const grad2 = ctx.createRadialGradient(b2x - 5, b2y - 5, 2, b2x, b2y, Math.sqrt(m2) * 8);
    grad2.addColorStop(0, '#8b5cf6');
    grad2.addColorStop(1, '#7c3aed');
    ctx.fillStyle = grad2;
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'rgba(139, 92, 246, 0.4)';
    ctx.beginPath();
    ctx.arc(b2x, b2y, Math.sqrt(m2) * 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

  }, [config, state]);

  return (
    <div className="relative flex-1 min-h-[400px] bg-slate-900/50 rounded-2xl border border-slate-800 backdrop-blur-sm overflow-hidden group">
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <span className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-full text-[10px] font-mono text-cyan-400 uppercase tracking-widest shadow-xl">
          Double Pendulum Simulation
        </span>
        <span className="px-3 py-1 bg-slate-900/50 border border-slate-700/50 rounded-full text-[9px] font-mono text-slate-500 uppercase tracking-tighter">
          RK4 Solving Lagrangian Equations
        </span>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
      />
    </div>
  );
};

export default PendulumCanvas;