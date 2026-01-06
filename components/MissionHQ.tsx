
import React, { useMemo, useState, useEffect } from 'react';
import { CauseAction, ActionType } from '../types.ts';
import { ACTION_CONFIG } from '../constants.tsx';

interface MissionHQProps {
  actions: CauseAction[];
  onClose: () => void;
}

const THEOLOGIAN_QUOTES = [
  "A oração não muda Deus, mas muda quem ora. - C.S. Lewis",
  "Um pouco de amor em ação vale mais do que toneladas de teoria. - Spurgeon",
  "Deus usa pessoas comuns para coisas extraordinárias. - D.L. Moody",
  "A igreja existe para levar os homens a Cristo. - C.S. Lewis",
  "Pregue o Evangelho, se necessário use palavras. - S. Francisco"
];

const VERSES = [
  "Vós sois a luz do mundo. - Mateus 5:14",
  "Orai uns pelos outros. - Tiago 5:16",
  "Nisto todos conhecerão que sois meus discípulos. - João 13:35",
  "Ide e pregai o evangelho. - Marcos 16:15"
];

export const MissionHQ: React.FC<MissionHQProps> = ({ actions, onClose }) => {
  const [tickerIndex, setTickerIndex] = useState(0);

  const stats = useMemo(() => ({
    orei: actions.filter(a => a.action === ActionType.OREI).length,
    cuidei: actions.filter(a => a.action === ActionType.CUIDEI).length,
    compartilhei: actions.filter(a => a.action === ActionType.COMPARTILHEI).length,
    total: actions.length
  }), [actions]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % [...THEOLOGIAN_QUOTES, ...VERSES].length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const combinedQuotes = [...THEOLOGIAN_QUOTES, ...VERSES];
  const pulseSpeed = Math.max(1, 4 - (stats.total / 50));

  return (
    <div className="fixed inset-0 z-[300] bg-[#050505] text-white overflow-hidden font-sans flex flex-col">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      </div>

      <header className="relative z-10 p-8 flex items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="size-16 rounded-2xl bg-primary flex items-center justify-center text-black shadow-[0_0_30px_rgba(249,245,6,0.3)]">
            <span className="material-symbols-outlined text-4xl font-black">terminal</span>
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tighter italic uppercase leading-none">MISSION CONTROL</h2>
            <p className="text-primary font-black uppercase tracking-[0.4em] text-[10px] mt-1">Status do Reino: Em Expansão</p>
          </div>
        </div>
        <button onClick={onClose} className="size-14 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-500 flex items-center justify-center transition-all border border-white/10">
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>
      </header>

      <main className="flex-1 relative z-10 grid grid-cols-12 gap-6 p-8 overflow-y-auto no-scrollbar">
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
          <StatBox label="Intercessão" value={stats.orei} icon="volunteer_activism" color="text-blue-400" />
          <StatBox label="Cuidado Real" value={stats.cuidei} icon="spa" color="text-green-400" />
          <StatBox label="Evangelismo" value={stats.compartilhei} icon="share" color="text-orange-400" />
        </div>

        <div className="col-span-12 lg:col-span-6 flex flex-col items-center justify-center relative min-h-[400px]">
          <div 
            className="size-80 rounded-full border-2 border-primary/20 flex items-center justify-center relative"
            style={{ animation: `pulse ${pulseSpeed}s infinite ease-in-out` }}
          >
            <div className="absolute inset-0 rounded-full bg-primary/5 blur-3xl"></div>
            <div className="size-64 rounded-full bg-primary/10 border-4 border-primary/30 flex flex-col items-center justify-center shadow-[0_0_100px_rgba(249,245,6,0.1)]">
              <span className="material-symbols-outlined text-[120px] text-primary leading-none select-none">all_inclusive</span>
              <p className="text-4xl font-black italic tracking-tighter uppercase mt-4">Vibe Pulse</p>
            </div>
          </div>
          <div className="mt-16 w-full max-w-md">
            <div className="flex justify-between items-end mb-2">
               <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Progresso Coletivo</p>
               <p className="text-2xl font-black italic text-primary">{Math.min(100, Math.round((stats.total / 100) * 100))}%</p>
            </div>
            <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
              <div 
                className="h-full bg-primary shadow-[0_0_20px_rgba(249,245,6,0.5)] transition-all duration-1000"
                style={{ width: `${Math.min(100, (stats.total / 100) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
           <div className="flex-1 bg-white/5 rounded-[40px] border border-white/10 p-8 flex flex-col">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                <span className="size-2 bg-primary rounded-full animate-ping"></span>
                Atividade Recente
              </h3>
              <div className="space-y-4">
                {actions.slice(0, 5).map((a, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className={`size-10 rounded-lg flex items-center justify-center ${ACTION_CONFIG[a.action].darkBg} ${ACTION_CONFIG[a.action].textColor}`}>
                      <span className="material-symbols-outlined text-xl">{ACTION_CONFIG[a.action].icon}</span>
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase italic leading-none">{a.userName}</p>
                      <p className="text-[9px] font-bold text-zinc-500 uppercase mt-1">{ACTION_CONFIG[a.action].label}</p>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </main>

      <footer className="relative z-10 h-24 border-t border-white/10 bg-black/80 flex items-center overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-black to-transparent z-20 flex items-center pl-8">
           <span className="text-primary font-black uppercase tracking-widest text-xs italic">Diretrizes:</span>
        </div>
        <div className="flex-1 whitespace-nowrap animate-marquee">
          <span className="text-2xl font-black italic uppercase tracking-tighter text-zinc-400 px-8">
            {combinedQuotes[tickerIndex]}
          </span>
          <span className="text-2xl font-black italic uppercase tracking-tighter text-zinc-400 px-8">
             {combinedQuotes[(tickerIndex + 1) % combinedQuotes.length]}
          </span>
        </div>
      </footer>

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { display: inline-block; animation: marquee 30s linear infinite; }
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.05); opacity: 1; } }
      `}</style>
    </div>
  );
};

const StatBox = ({ label, value, icon, color }: { label: string, value: number, icon: string, color: string }) => (
  <div className="bg-white/5 rounded-[40px] border border-white/10 p-8 flex flex-col items-center justify-center group transition-all hover:bg-white/10">
    <span className={`material-symbols-outlined text-5xl ${color} mb-4 transition-transform group-hover:scale-110`}>{icon}</span>
    <span className="text-6xl font-black italic tracking-tighter">{value}</span>
    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mt-2">{label}</span>
  </div>
);
