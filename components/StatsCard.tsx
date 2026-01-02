
import React from 'react';
import { ActionType } from '../types';
import { ACTION_CONFIG } from '../constants';

interface StatsCardProps {
  type: ActionType;
  count: number;
  todayCount: number;
}

export const StatsCard: React.FC<StatsCardProps> = ({ type, count, todayCount }) => {
  const config = ACTION_CONFIG[type];
  const labelText = type === ActionType.OREI ? 'Orações' : type === ActionType.CUIDEI ? 'Vidas' : 'Partilhas';
  const subText = type === ActionType.OREI ? 'Intercessão' : type === ActionType.CUIDEI ? 'Cuidado Real' : 'Missão Global';

  return (
    <div className="relative group w-full bg-white dark:bg-zinc-900 rounded-[32px] p-8 shadow-2xl border border-zinc-100 dark:border-white/5 overflow-hidden transition-all active:scale-[0.97] cursor-pointer">
      <div className={`absolute inset-0 bg-gradient-to-br from-zinc-500/5 to-transparent pointer-events-none`}></div>
      <div className={`absolute -right-10 -top-10 ${config.textColor} opacity-[0.05] dark:opacity-[0.1] transform rotate-12 transition-transform group-hover:rotate-0 duration-700`}>
        <span className="material-symbols-outlined text-[200px] leading-none select-none font-fill" style={{ fontVariationSettings: "'FILL' 1" }}>{config.icon}</span>
      </div>
      
      <div className="relative z-10 flex flex-col">
        <div className="flex items-center gap-4 mb-4">
          <div className={`size-12 rounded-[20px] ${config.lightBg} ${config.darkBg} flex items-center justify-center ${config.textColor} shadow-inner`}>
            <span className="material-symbols-outlined text-2xl">{config.icon}</span>
          </div>
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${config.textColor}`}>{subText}</span>
        </div>
        
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-[4rem] leading-none font-black tracking-tighter tabular-nums italic">
            {count.toLocaleString()}
          </span>
        </div>
        <span className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">{labelText}</span>
        
        <div className="mt-8 flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-5">
          <span className={`inline-flex items-center gap-2 text-[10px] font-black ${config.textColor} bg-white dark:bg-zinc-800 px-4 py-2 rounded-2xl border border-zinc-100 dark:border-white/10 shadow-lg uppercase tracking-tighter`}>
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            +{todayCount} Hoje
          </span>
          <span className="text-[8px] text-zinc-400 font-black uppercase tracking-[0.2em]">Movimento Orgânico</span>
        </div>
      </div>
    </div>
  );
};
