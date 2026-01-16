import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Controls from './components/Controls.tsx';
import PendulumCanvas from './components/PendulumCanvas.tsx';
import type { PendulumConfig, PendulumState, HistoryPoint } from './types';
import { PhysicsEngine } from './services/physicsEngine';

const INITIAL_CONFIG: PendulumConfig = {
  L1: 1.2,
  L2: 1.0,
  m1: 1.5,
  m2: 1.0,
  g: 9.81,
  damping: 0.02,
};

const INITIAL_STATE: PendulumState = {
  theta1: Math.PI / 3, // 60 degrees
  omega1: 0,
  theta2: Math.PI / 4, // 45 degrees
  omega2: 0,
  time: 0,
};

const App: React.FC = () => {
  const [config, setConfig] = useState<PendulumConfig>(INITIAL_CONFIG);
  const [state, setState] = useState<PendulumState>(INITIAL_STATE);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  
  const lastTimeRef = useRef<number | null>(null);
  const requestRef = useRef<number | null>(null);

  const resetState = () => {
    setState(INITIAL_STATE);
    setHistory([]);
    lastTimeRef.current = null;
  };

  const energy = useMemo(() => {
    const { m1, m2, L1, L2, g } = config;
    const { theta1, theta2, omega1, omega2 } = state;

    const pe1 = -m1 * g * L1 * Math.cos(theta1);
    const pe2 = -m2 * g * (L1 * Math.cos(theta1) + L2 * Math.cos(theta2));
    const pe = pe1 + pe2;

    const ke1 = 0.5 * m1 * (L1 * omega1) ** 2;
    const ke2 = 0.5 * m2 * (
      (L1 * omega1) ** 2 + 
      (L2 * omega2) ** 2 + 
      2 * L1 * L2 * omega1 * omega2 * Math.cos(theta1 - theta2)
    );
    const ke = ke1 + ke2;

    return { pe, ke, total: pe + ke };
  }, [config, state]);

  const update = useCallback((time: number) => {
    if (lastTimeRef.current !== null && isRunning) {
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.032);
      const subSteps = 10;
      const subDt = dt / subSteps;
      
      setState(prevState => {
        let current = { ...prevState };
        for (let i = 0; i < subSteps; i++) {
          current = PhysicsEngine.rk4(current, config, subDt);
        }
        
        if (Math.floor(current.time * 20) > Math.floor(prevState.time * 20)) {
          setHistory(prev => {
            const newPoint = {
              time: Number(current.time.toFixed(2)),
              theta1: Number((current.theta1 * 180 / Math.PI).toFixed(1)),
              theta2: Number((current.theta2 * 180 / Math.PI).toFixed(1)),
            };
            const newHistory = [...prev, newPoint];
            return newHistory.slice(-100);
          });
        }
        
        return current;
      });
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(update);
  }, [isRunning, config]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current !== null) cancelAnimationFrame(requestRef.current);
    };
  }, [update]);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 font-sans selection:bg-cyan-500/30 overflow-hidden">
      <Controls 
        config={config} 
        setConfig={setConfig} 
        isRunning={isRunning}
        setIsRunning={setIsRunning}
        onReset={resetState}
      />

      <main className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto custom-scrollbar">
        <header className="flex justify-between items-end shrink-0">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Chaotic Dynamics Lab
            </h2>
            <p className="text-slate-500 text-sm mt-1">Numerical Integration: RK4 | Sub-steps: 10/frame</p>
          </div>
          <div className="flex gap-4">
            <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl flex flex-col items-center min-w-[100px] shadow-lg">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Elapsed Time</span>
              <span className="font-mono text-cyan-400 text-lg">{state.time.toFixed(2)}s</span>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
          <PendulumCanvas config={config} state={state} />
          
          <aside className="w-full lg:w-80 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col shadow-inner">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
              Real-time Telemetry
            </h3>
            
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-3">
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Upper Angle (θ1)</p>
                  <p className="text-2xl font-mono text-cyan-400">{(state.theta1 * 180 / Math.PI).toFixed(1)}°</p>
                </div>
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Lower Angle (θ2)</p>
                  <p className="text-2xl font-mono text-indigo-400">{(state.theta2 * 180 / Math.PI).toFixed(1)}°</p>
                </div>
              </div>

              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
                <div>
                  <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold mb-2">
                    <span>Potential (V)</span>
                    <span className="text-slate-400">{(energy.pe).toFixed(2)} J</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-150" 
                      style={{ width: `${Math.min(100, Math.abs(energy.pe) * 2)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold mb-2">
                    <span>Kinetic (T)</span>
                    <span className="text-slate-400">{energy.ke.toFixed(2)} J</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 transition-all duration-150" 
                      style={{ width: `${Math.min(100, Math.abs(energy.ke) * 2)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Total Energy (E)</span>
                  <span className="text-sm font-mono text-cyan-400 font-bold">{energy.total.toFixed(3)} J</span>
                </div>
              </div>

              <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                <h4 className="text-[10px] font-bold text-cyan-400 uppercase mb-2">Simulation Status</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed italic">
                  Runge-Kutta integration active. Adjust parameters in the sidebar to observe sensitivity to initial conditions.
                </p>
              </div>
            </div>
          </aside>
        </div>

        <section className="h-56 bg-slate-900/50 border border-slate-800 rounded-2xl p-5 shrink-0 shadow-lg">
          <div className="flex justify-between items-center mb-4 px-2">
             <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Phase Space History</h3>
             <div className="flex gap-4 text-[10px] font-mono">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-cyan-500" /> θ1</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500" /> θ2</span>
             </div>
          </div>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis domain={['auto', 'auto']} hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="theta1" 
                  stroke="#22d3ee" 
                  strokeWidth={2} 
                  dot={false} 
                  isAnimationActive={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="theta2" 
                  stroke="#6366f1" 
                  strokeWidth={2} 
                  dot={false} 
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;