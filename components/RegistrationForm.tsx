
import React, { useState } from 'react';
import { ActionType } from '../types';
import { ACTION_CONFIG } from '../constants';

interface RegistrationFormProps {
  onRegister: (friendName: string, action: ActionType) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onRegister, onCancel, isSubmitting }) => {
  const [friendName, setFriendName] = useState('');
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAction) {
      onRegister(friendName || 'Alguém especial', selectedAction);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto p-4 animate-in slide-in-from-bottom-12 duration-700 pb-32 no-scrollbar overflow-y-auto">
      <div className="mt-6 mb-10 text-center">
        <h2 className="text-3xl font-black tracking-tighter leading-none uppercase mb-3 italic">Qual foi seu <span className="text-primary-dark dark:text-primary">Impacto?</span></h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-widest px-8 leading-relaxed italic">Cada pequena ação brilha no mural de todos.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-10">
        <div className="flex flex-col gap-3 px-2">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] ml-2 italic">
            Quem foi abençoado?
          </label>
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none material-symbols-outlined text-zinc-400 group-focus-within:text-primary transition-colors">person</span>
            <input
              type="text"
              value={friendName}
              onChange={(e) => setFriendName(e.target.value)}
              placeholder="Ex: Pedro, Maria..."
              className="w-full pl-14 pr-6 py-6 bg-white dark:bg-zinc-900 border-2 border-transparent ring-1 ring-zinc-100 dark:ring-white/5 rounded-[32px] focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-zinc-950 text-lg font-bold shadow-xl outline-none transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 px-2">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] ml-2 italic">Sua Ação de hoje</p>
          <div className="grid gap-4">
            {(Object.keys(ACTION_CONFIG) as ActionType[]).map((type) => {
              const config = ACTION_CONFIG[type];
              const isSelected = selectedAction === type;
              return (
                <label key={type} className="cursor-pointer group relative">
                  <input
                    type="radio"
                    name="action_type"
                    className="sr-only"
                    checked={isSelected}
                    onChange={() => setSelectedAction(type)}
                  />
                  <div className={`flex items-center p-6 bg-white dark:bg-zinc-900 border-2 rounded-[32px] shadow-xl transition-all duration-300 ${isSelected ? 'border-primary ring-8 ring-primary/10 scale-[1.03]' : 'border-transparent active:scale-95'}`}>
                    <div className={`flex-shrink-0 w-16 h-16 rounded-[24px] ${config.lightBg} ${config.darkBg} flex items-center justify-center ${config.textColor} mr-6 shadow-inner`}>
                      <span className="material-symbols-outlined text-4xl">{config.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-xl tracking-tight uppercase leading-none mb-1 italic">{config.label}</p>
                      <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">{config.description}</p>
                    </div>
                    <div className={`w-8 h-8 rounded-full bg-primary flex items-center justify-center transition-all shadow-lg ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                      <span className="material-symbols-outlined text-black text-sm font-black">check</span>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-6 z-[70] bg-gradient-to-t from-background-light dark:from-background-dark via-background-light dark:via-background-dark to-transparent pt-16">
          <div className="max-w-md mx-auto flex gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white font-black py-6 rounded-[24px] transition-all active:scale-95 uppercase text-[10px] tracking-[0.2em] shadow-lg italic"
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={!selectedAction || isSubmitting}
              className={`flex-[2] py-6 rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-95 italic ${
                !selectedAction || isSubmitting 
                  ? 'bg-zinc-300 dark:bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50' 
                  : 'bg-primary text-black hover:brightness-110 shadow-primary/30'
              }`}
            >
              <span>{isSubmitting ? 'Salvando...' : 'Registrar Ação'}</span>
              {!isSubmitting && <span className="material-symbols-outlined text-lg font-black">rocket_launch</span>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
