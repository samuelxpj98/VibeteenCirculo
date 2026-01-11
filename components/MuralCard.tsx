
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
  
  // As dimensões DEVEM bater com as definidas no algoritmo do App.tsx
  const width = 140;
  const height = 160; 
  
  const day = new Date(action.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

  // Polígono Hexagonal (Ponta para cima)
  // Ajuste sutil: 0.5px de inset visualmente evita linhas brancas (anti-aliasing) entre cards
  const hexClipPath = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';

  return (
    <div
      style={{
        ...style,
        width: `${width}px`,
        height: `${height}px`,
        willChange: 'transform',
        filter: 'drop-shadow(0px 0px 5px rgba(0,0,0,0.5))' // Sombra ajustada para o favo
      }}
      className="relative flex items-center justify-center group shrink-0 transition-transform duration-300 hover:scale-110 hover:z-50 cursor-pointer"
      onClick={() => onClick(action)}
    >
      {/* Camada da Borda (Fundo externo - Grout) */}
      <div 
        className="absolute inset-0 bg-white dark:bg-zinc-800"
        style={{ clipPath: hexClipPath }}
      ></div>

      {/* Camada de Conteúdo (Inset 3px para simular borda visível entre os favos) */}
      <div 
        className={`absolute inset-[3px] ${config.lightBg} ${config.darkBg} flex flex-col items-center justify-center p-3 text-center transition-colors`}
        style={{ clipPath: hexClipPath }}
      >
        {/* Efeito de brilho no hover */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

        {/* 1. ÍCONE */}
        <div className={`size-8 rounded-full flex-shrink-0 flex items-center justify-center ${config.textColor} bg-white/90 dark:bg-black/40 shadow-inner mb-1 group-hover:scale-110 transition-transform mt-1`}>
          <span className="material-symbols-outlined text-lg font-black">{config.icon}</span>
        </div>
        
        {/* 2. NOME (Aumentado e Ajustado) */}
        <p className="text-[17px] font-black uppercase tracking-tighter text-zinc-900 dark:text-zinc-100 truncate w-[95%] italic leading-none mb-0.5">
          {action.userName}
        </p>

        {/* 3. DATA */}
        <div className="text-[9px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest italic opacity-80 mb-2">
          {day}
        </div>

        {/* Indicador de Cor do Usuário */}
        {action.userColor && (
          <div className="absolute bottom-3 size-1.5 rounded-full shadow-sm ring-1 ring-black/20" style={{ backgroundColor: action.userColor }}></div>
        )}
      </div>
    </div>
  );
};

export default memo(MuralCard);
