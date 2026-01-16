import React from 'react';
import type { PendulumConfig } from '../types';

interface ControlsProps {
  config: PendulumConfig;
  setConfig: (config: PendulumConfig) => void;
  isRunning: boolean;
  setIsRunning: (isRunning: boolean) => void;
  onReset: () => void;
}

const Controls: React.FC<ControlsProps> = ({ config, setConfig, isRunning, setIsRunning, onReset }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig({
      ...config,
      [name]: parseFloat(value)
    });
  };

  const InputGroup = ({ label, name, min, max, step, value }: any) => (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
        <span className="text-xs font-mono text-cyan-400">{value}</span>
      </div>
      <input
        type="range"
        name={name}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
      />
    </div>
  );

  return (
    <div className="flex flex-col h-full p-6 bg-slate-900 border-r border-slate-800 w-80 shrink-0 shadow-2xl overflow-y-auto">
      <div className="flex items-center gap-2 mb-8">
        <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-500">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </div>
        <h1 className="text-xl font-bold tracking-tight">Double Pendulum</h1>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-bold text-slate-300 mb-4 border-b border-slate-800 pb-2">Arm Parameters</h2>
        <InputGroup label="Mass 1 (kg)" name="m1" min="0.1" max="10" step="0.1" value={config.m1} />
        <InputGroup label="Mass 2 (kg)" name="m2" min="0.1" max="10" step="0.1" value={config.m2} />
        <InputGroup label="Length 1 (m)" name="L1" min="0.5" max="3" step="0.1" value={config.L1} />
        <InputGroup label="Length 2 (m)" name="L2" min="0.5" max="3" step="0.1" value={config.L2} />
        
        <h2 className="text-sm font-bold text-slate-300 mt-6 mb-4 border-b border-slate-800 pb-2">Environment</h2>
        <InputGroup label="Damping (Friction)" name="damping" min="0" max="0.5" step="0.01" value={config.damping} />
        <InputGroup label="Gravity (m/s²)" name="g" min="0" max="20" step="0.1" value={config.g} />
      </div>

      <div className="mt-auto pt-8 space-y-3">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
            isRunning 
            ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' 
            : 'bg-cyan-500 text-white hover:bg-cyan-600 shadow-lg shadow-cyan-500/20'
          }`}
        >
          {isRunning ? (
            <><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg> Stop Chaos</>
          ) : (
            <><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg> Unleash Chaos</>
          )}
        </button>
        
        <button
          onClick={onReset}
          className="w-full py-3 rounded-xl font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all border border-slate-700"
        >
          Reset State
        </button>
      </div>
    </div>
  );
};

export default Controls;