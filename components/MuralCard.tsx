
import React, { memo } from 'react';
import { CauseAction } from '../types';
import { ACTION_CONFIG } from '../constants';

interface MuralCardProps {
  action: CauseAction;
  onClick: (action: CauseAction) => void;
  style?: React.CSSProperties;
}

export const MuralCard: React.FC<MuralCardProps> = ({ action, onClick, style }) => {
  const config = ACTION_CONFIG[action.action];
  
  const cardWidth = 160;
  const cardHeight = 150;
  
  const day = new Date(action.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

  return (
    <button 
      onClick={() => onClick(action)}
      style={{
        ...style,
        width: `${cardWidth}px`,
        height: `${cardHeight}px`,
        willChange: 'transform'
      }}
      className={`relative flex flex-col items-center justify-center rounded-[40px] border-2 border-white/50 dark:border-white/5 shadow-2xl ${config.lightBg} ${config.darkBg} transition-all active:scale-90 group shrink-0 overflow-hidden p-6`}
    >
      {/* 1. ÍCONE ACIMA */}
      <div className={`size-11 rounded-[16px] flex-shrink-0 flex items-center justify-center ${config.textColor} bg-white/90 dark:bg-black/40 shadow-inner mb-3 group-hover:scale-110 transition-transform`}>
        <span className="material-symbols-outlined text-2xl font-black">{config.icon}</span>
      </div>
      
      {/* 2. NOME NO MEIO (18px - Igual JESUS) */}
      <p className="text-[18px] font-black uppercase tracking-tighter text-zinc-900 dark:text-zinc-100 truncate w-full text-center italic leading-none mb-2">
        {action.userName}
      </p>

      {/* 3. DATA EMBAIXO */}
      <div className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest italic opacity-80">
        {day}
      </div>

      {/* Indicador de Cor do Usuário */}
      {action.userColor && (
        <div className="absolute top-4 right-4 size-2 rounded-full shadow-sm ring-2 ring-white/50" style={{ backgroundColor: action.userColor }}></div>
      )}

      {/* Overlay de Hover */}
      <div className={`absolute inset-0 rounded-[40px] ring-4 ring-inset ring-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}></div>
    </button>
  );
};

export default memo(MuralCard);
