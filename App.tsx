
import React, { useState, useEffect, useMemo, useRef, memo } from 'react';
import { GoogleGenAI } from "@google/genai";

// --- 1. CONFIGURAÇÕES E TIPOS ---

enum ActionType {
  OREI = 'orei',
  CUIDEI = 'cuidei',
  COMPARTILHEI = 'compartilhei'
}

type UserStatus = 'Líder' | 'Membro' | 'Visitante';

interface User {
  firstName: string;
  lastName: string;
  email: string;
  avatarColor: string;
  status?: UserStatus;
}

interface CauseAction {
  id: string;
  userName: string;
  friendName: string;
  action: ActionType;
  timestamp: string;
  userColor?: string;
}

const AVATAR_COLORS = [
  { name: 'Azul', hex: '#0084FF' },
  { name: 'Verde', hex: '#00F576' },
  { name: 'Laranja', hex: '#FF5E00' },
  { name: 'Roxo', hex: '#A855F7' },
  { name: 'Rosa', hex: '#EC4899' },
  { name: 'Amarelo', hex: '#f9f506' },
];

const ACTION_CONFIG = {
  [ActionType.OREI]: {
    label: 'Orei',
    description: 'Intercessão poderosa.',
    icon: 'volunteer_activism',
    lightBg: 'bg-vibrant-blue-soft',
    darkBg: 'dark:bg-blue-500/10',
    textColor: 'text-vibrant-blue',
    verse: "Orai sem cessar. (1 Tes 5:17)"
  },
  [ActionType.CUIDEI]: {
    label: 'Cuidei',
    description: 'Amor em movimento.',
    icon: 'spa',
    lightBg: 'bg-vibrant-green-soft',
    darkBg: 'dark:bg-green-500/10',
    textColor: 'text-vibrant-green',
    verse: "Ame o seu próximo como a si mesmo. (Mt 22:39)"
  },
  [ActionType.COMPARTILHEI]: {
    label: 'Compartilhei',
    description: 'Falei da Verdade.',
    icon: 'share',
    lightBg: 'bg-vibrant-orange-soft',
    darkBg: 'dark:bg-orange-500/10',
    textColor: 'text-vibrant-orange',
    verse: "Ide e pregai o evangelho. (Mc 16:15)"
  }
};

// --- 2. COMPONENTES INTERNOS ---

const MuralCard: React.FC<{ action: CauseAction, onClick: (a: CauseAction) => void, style: React.CSSProperties }> = ({ action, onClick, style }) => {
  const config = ACTION_CONFIG[action.action];
  const day = new Date(action.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

  return (
    <button 
      onClick={() => onClick(action)}
      style={style}
      className={`absolute w-36 h-36 flex flex-col items-center justify-center rounded-[32px] border-2 border-white/50 dark:border-white/5 shadow-xl ${config.lightBg} ${config.darkBg} transition-all active:scale-90 group p-4`}
    >
      <div className={`size-10 rounded-xl flex items-center justify-center ${config.textColor} bg-white/90 dark:bg-black/40 mb-2 shadow-inner`}>
        <span className="material-symbols-outlined text-2xl font-black">{config.icon}</span>
      </div>
      <p className="text-sm font-black uppercase tracking-tighter text-zinc-900 dark:text-zinc-100 truncate w-full text-center italic leading-none">
        {action.userName}
      </p>
      <div className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mt-1 italic">{day}</div>
      {action.userColor && (
        <div className="absolute top-3 right-3 size-2 rounded-full border border-white/20" style={{ backgroundColor: action.userColor }}></div>
      )}
    </button>
  );
};

const WelcomeScreen: React.FC<{ onComplete: (u: User) => void }> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0].hex);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      onComplete({
        firstName: name,
        lastName: '',
        email: email.toLowerCase(),
        avatarColor: selectedColor,
        status: 'Membro'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background-light dark:bg-background-dark flex flex-col items-center justify-center p-8 overflow-y-auto">
      <div className="w-full max-w-sm flex flex-col items-center animate-in zoom-in duration-500">
        <div className="size-24 bg-primary rounded-[32px] flex items-center justify-center text-black shadow-2xl mb-8 rotate-3 border-4 border-white dark:border-zinc-800">
          <span className="material-symbols-outlined text-5xl font-black">all_inclusive</span>
        </div>
        
        <h1 className="text-5xl font-black uppercase italic text-center mb-2 leading-none tracking-tighter">VIBE TEEN</h1>
        <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] mb-12 italic">O Círculo da Causa</p>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <input 
            type="text"
            placeholder="Seu nome" 
            className="w-full h-16 px-6 bg-white dark:bg-zinc-900 rounded-2xl border-0 ring-1 ring-zinc-200 dark:ring-white/10 font-bold text-lg outline-none focus:ring-2 focus:ring-primary shadow-sm"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <input 
            type="email"
            placeholder="Seu melhor e-mail" 
            className="w-full h-16 px-6 bg-white dark:bg-zinc-900 rounded-2xl border-0 ring-1 ring-zinc-200 dark:ring-white/10 font-bold text-lg outline-none focus:ring-2 focus:ring-primary shadow-sm"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          
          <div className="py-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 italic">Escolha sua cor</p>
            <div className="flex justify-between gap-2">
              {AVATAR_COLORS.map(c => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setSelectedColor(c.hex)}
                  className={`size-10 rounded-full border-4 transition-all ${selectedColor === c.hex ? 'border-white dark:border-zinc-700 scale-125 shadow-xl ring-2 ring-primary' : 'border-transparent opacity-40'}`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full h-18 bg-black dark:bg-primary text-white dark:text-black rounded-3xl font-black uppercase tracking-widest text-xs shadow-2xl active:scale-95 transition-all mt-4 py-5"
          >
            Começar Impacto
          </button>
        </form>
      </div>
    </div>
  );
};

const RegistrationForm: React.FC<{ onRegister: (f: string, a: ActionType) => void, onCancel: () => void }> = ({ onRegister, onCancel }) => {
  const [friend, setFriend] = useState('');
  const [selected, setSelected] = useState<ActionType | null>(null);

  return (
    <div className="flex flex-col h-full w-full p-6 animate-in slide-in-from-bottom-12">
      <div className="mt-4 mb-8 text-center">
        <h2 className="text-3xl font-black uppercase italic leading-none tracking-tighter">Novo <span className="text-primary-dark dark:text-primary">Impacto</span></h2>
      </div>
      
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic ml-1">Quem recebeu a ação?</label>
          <input 
            type="text" 
            placeholder="Nome da pessoa..." 
            className="w-full h-16 px-6 bg-white dark:bg-zinc-900 border-2 border-transparent ring-1 ring-zinc-200 dark:ring-white/10 rounded-2xl font-bold text-lg outline-none focus:ring-2 focus:ring-primary"
            value={friend}
            onChange={e => setFriend(e.target.value)}
          />
        </div>

        <div className="grid gap-3">
          {(Object.keys(ACTION_CONFIG) as ActionType[]).map(type => (
            <button 
              key={type}
              onClick={() => setSelected(type)}
              className={`flex items-center p-5 bg-white dark:bg-zinc-900 border-2 rounded-[28px] transition-all ${selected === type ? 'border-primary ring-4 ring-primary/10' : 'border-transparent'}`}
            >
              <div className={`size-12 rounded-xl ${ACTION_CONFIG[type].lightBg} ${ACTION_CONFIG[type].darkBg} flex items-center justify-center ${ACTION_CONFIG[type].textColor} mr-4`}>
                <span className="material-symbols-outlined">{ACTION_CONFIG[type].icon}</span>
              </div>
              <div className="flex-1 text-left">
                <p className="font-black uppercase italic leading-none">{ACTION_CONFIG[type].label}</p>
                <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-1 italic">{ACTION_CONFIG[type].description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto flex gap-4 pt-10">
        <button onClick={onCancel} className="flex-1 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-2xl font-black uppercase text-[10px] tracking-widest italic">Cancelar</button>
        <button 
          onClick={() => selected && onRegister(friend, selected)}
          disabled={!selected}
          className="flex-[2] h-14 bg-primary text-black rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl disabled:opacity-50 italic"
        >
          Registrar no Mural
        </button>
      </div>
    </div>
  );
};

// --- 3. COMPONENTE PRINCIPAL ---

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [actions, setActions] = useState<CauseAction[]>([]);
  const [currentTab, setCurrentTab] = useState<'mural' | 'rank' | 'profile' | 'register'>('mural');
  const [inspiration, setInspiration] = useState('Gerando impacto social...');
  const [selectedAction, setSelectedAction] = useState<CauseAction | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('vibe_user_v2');
    if (saved) {
      setUser(JSON.parse(saved));
    }
    
    // Dados iniciais para visualização
    setActions([
      { id: '1', userName: 'Vibe', friendName: 'Comunidade', action: ActionType.OREI, timestamp: new Date().toISOString(), userColor: '#f9f506' },
      { id: '2', userName: 'Teen', friendName: 'Escola', action: ActionType.CUIDEI, timestamp: new Date().toISOString(), userColor: '#00F576' }
    ]);
  }, []);

  useEffect(() => {
    if (user) {
      fetchInspiration();
    }
  }, [user]);

  const fetchInspiration = async () => {
    if (!process.env.API_KEY) return;
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'Crie uma missão urbana curta e impactante para um jovem cristão hoje. Máximo 10 palavras. Ex: "Doe um agasalho para alguém no sinal".',
      });
      setInspiration(response.text || 'O amor é a maior revolução que podemos viver.');
    } catch (e) {
      setInspiration('Deus quer usar sua vida para abençoar alguém hoje!');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleRegister = (friend: string, action: ActionType) => {
    if (!user) return;
    const newAction: CauseAction = {
      id: Math.random().toString(36).substr(2, 9),
      userName: user.firstName,
      friendName: friend || 'Alguém especial',
      action,
      timestamp: new Date().toISOString(),
      userColor: user.avatarColor
    };
    setActions([newAction, ...actions]);
    setCurrentTab('mural');
  };

  const getSpiralCoords = (n: number, cellSize: number) => {
    let x = 0, y = 0, dx = 0, dy = -1;
    const coords = [];
    for (let i = 0; i < n; i++) {
      coords.push({ x: x * cellSize, y: y * cellSize });
      if (x === y || (x < 0 && x === -y) || (x > 0 && x === 1 - y)) {
        [dx, dy] = [-dy, dx];
      }
      x += dx;
      y += dy;
    }
    return coords;
  };

  const spiralCoords = useMemo(() => getSpiralCoords(actions.length + 1, 160), [actions.length]);

  if (!user) return <WelcomeScreen onComplete={(u) => { setUser(u); localStorage.setItem('vibe_user_v2', JSON.stringify(u)); }} />;

  return (
    <div className="min-h-screen max-w-md mx-auto bg-background-light dark:bg-background-dark text-black dark:text-white flex flex-col overflow-hidden font-sans relative">
      <div className="fixed inset-0 opacity-10 pointer-events-none bg-dot-pattern"></div>

      {/* HEADER */}
      <header className="relative z-[60] p-6 flex items-center justify-between border-b border-black/5 dark:border-white/5 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-black font-black shadow-lg shadow-primary/20 rotate-3">
            <span className="material-symbols-outlined text-2xl">all_inclusive</span>
          </div>
          <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">VIBE TEEN</h1>
        </div>
        <button onClick={() => setCurrentTab('profile')} className="size-10 rounded-full border-2 border-primary overflow-hidden shadow-lg active:scale-90 transition-all" style={{ backgroundColor: user.avatarColor }}>
          <div className="w-full h-full flex items-center justify-center font-black text-white text-xs">
            {user.firstName[0]}
          </div>
        </button>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {currentTab === 'mural' && (
          <div className="flex-1 relative animate-in fade-in">
            {/* AI MISSION BAR */}
            <div className="absolute top-6 left-0 w-full px-6 z-50 text-center pointer-events-none">
              <h2 className="text-2xl font-black uppercase italic text-zinc-900 dark:text-white leading-none mb-2 tracking-tighter">Mural da Causa</h2>
              <div className="inline-block px-5 py-2.5 bg-white/90 dark:bg-zinc-900/90 border border-primary/30 rounded-full backdrop-blur-md shadow-2xl animate-in slide-in-from-top-4 duration-1000">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary-dark dark:text-primary flex items-center gap-2">
                  <span className={`material-symbols-outlined text-sm ${isAiLoading ? 'animate-spin' : 'animate-pulse'}`}>bolt</span>
                  MISSÃO: {inspiration}
                </p>
              </div>
            </div>

            {/* SPIRAL VIEWPORT */}
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
              <div className="relative transition-transform duration-500 ease-out" style={{ transform: 'scale(0.85)' }}>
                {/* CENTER CARD (JESUS) */}
                <div 
                  style={{ transform: `translate(${spiralCoords[0].x}px, ${spiralCoords[0].y}px)` }} 
                  className="absolute -translate-x-1/2 -translate-y-1/2 size-40 bg-primary rounded-[48px] border-8 border-white dark:border-zinc-800 shadow-[0_0_50px_rgba(249,245,6,0.3)] flex flex-col items-center justify-center text-black z-50 scale-110 rotate-2"
                >
                  <span className="material-symbols-outlined text-6xl font-fill" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                  <p className="text-lg font-black uppercase tracking-widest italic mt-1">JESUS</p>
                </div>

                {/* USER ACTIONS */}
                {actions.map((a, i) => {
                  const coord = spiralCoords[i + 1] || { x: 0, y: 0 };
                  return (
                    <MuralCard 
                      key={a.id} 
                      action={a} 
                      onClick={setSelectedAction}
                      style={{ left: coord.x, top: coord.y, transform: 'translate(-50%, -50%)' }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {currentTab === 'rank' && (
          <div className="p-6 space-y-4 animate-in fade-in overflow-y-auto pb-32 no-scrollbar">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-8 leading-none">Nosso <span className="text-primary-dark dark:text-primary">Impacto</span></h2>
            {(Object.keys(ACTION_CONFIG) as ActionType[]).map(type => {
              const count = actions.filter(a => a.action === type).length;
              const config = ACTION_CONFIG[type];
              return (
                <div key={type} className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] shadow-xl border border-zinc-100 dark:border-white/5 relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                       <span className={`material-symbols-outlined text-3xl ${config.textColor}`}>{config.icon}</span>
                       <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{config.label}</span>
                    </div>
                    <p className="text-7xl font-black italic tracking-tighter leading-none tabular-nums">{count}</p>
                  </div>
                  <span className={`absolute -right-10 -top-10 material-symbols-outlined text-[180px] opacity-[0.05] ${config.textColor} rotate-12 transition-transform duration-700`}>{config.icon}</span>
                </div>
              );
            })}
          </div>
        )}

        {currentTab === 'profile' && (
          <div className="p-6 animate-in fade-in text-center flex flex-col items-center pt-12 overflow-y-auto no-scrollbar">
            <div className="size-32 rounded-[40px] border-4 border-white dark:border-zinc-800 shadow-2xl flex items-center justify-center text-white text-4xl font-black mb-6 rotate-2" style={{ backgroundColor: user.avatarColor }}>
              {user.firstName[0]}
            </div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none mb-1">{user.firstName}</h2>
            <div className="px-4 py-1.5 bg-zinc-100 dark:bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-12 italic border border-zinc-200 dark:border-white/10">Nível {user.status}</div>
            
            <div className="w-full grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] shadow-lg text-left border border-zinc-50 dark:border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 italic">Suas Ações</p>
                <p className="text-5xl font-black italic tabular-nums">{actions.filter(a => a.userName === user.firstName).length}</p>
              </div>
              <button 
                onClick={() => { localStorage.removeItem('vibe_user_v2'); window.location.reload(); }}
                className="bg-zinc-950 dark:bg-zinc-800 p-8 rounded-[40px] shadow-lg text-left text-white border border-white/5 active:scale-95 transition-all"
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-3 italic">Sistema</p>
                <p className="text-xl font-black italic uppercase leading-none">Sair do App</p>
              </button>
            </div>
          </div>
        )}

        {currentTab === 'register' && (
          <RegistrationForm 
            onRegister={handleRegister} 
            onCancel={() => setCurrentTab('mural')} 
          />
        )}
      </main>

      {/* FOOTER NAVIGATION */}
      {currentTab !== 'register' && (
        <nav className="fixed bottom-0 left-0 right-0 p-6 pb-10 bg-gradient-to-t from-background-light dark:from-background-dark via-background-light/95 dark:via-background-dark/95 to-transparent z-40">
          <div className="max-w-md mx-auto h-22 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl rounded-[36px] shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-black/5 dark:border-white/10 flex items-center justify-around px-4">
            <button onClick={() => setCurrentTab('mural')} className={`flex flex-col items-center transition-all ${currentTab === 'mural' ? 'text-black dark:text-primary scale-110' : 'text-zinc-400 opacity-60'}`}>
              <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: currentTab === 'mural' ? "'FILL' 1" : "'FILL' 0" }}>rocket_launch</span>
              <span className="text-[8px] font-black uppercase tracking-tighter italic mt-0.5">Mural</span>
            </button>
            <button onClick={() => setCurrentTab('rank')} className={`flex flex-col items-center transition-all ${currentTab === 'rank' ? 'text-black dark:text-primary scale-110' : 'text-zinc-400 opacity-60'}`}>
              <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: currentTab === 'rank' ? "'FILL' 1" : "'FILL' 0" }}>leaderboard</span>
              <span className="text-[8px] font-black uppercase tracking-tighter italic mt-0.5">Impacto</span>
            </button>
            <button onClick={() => setCurrentTab('profile')} className={`flex flex-col items-center transition-all ${currentTab === 'profile' ? 'text-black dark:text-primary scale-110' : 'text-zinc-400 opacity-60'}`}>
              <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: currentTab === 'profile' ? "'FILL' 1" : "'FILL' 0" }}>person</span>
              <span className="text-[8px] font-black uppercase tracking-tighter italic mt-0.5">Perfil</span>
            </button>
          </div>
        </nav>
      )}

      {/* FLOATING ACTION BUTTON */}
      {currentTab !== 'register' && (
        <button 
          onClick={() => setCurrentTab('register')}
          className="fixed bottom-34 right-8 size-18 bg-primary text-black rounded-[28px] shadow-[0_15px_35px_rgba(249,245,6,0.3)] flex items-center justify-center z-50 animate-float border-4 border-white dark:border-zinc-800 active:scale-90 transition-all"
        >
          <span className="material-symbols-outlined text-4xl font-black">add</span>
        </button>
      )}

      {/* ACTION DETAILS MODAL */}
      {selectedAction && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6" onClick={() => setSelectedAction(null)}>
          <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[48px] p-10 text-center animate-in zoom-in shadow-3xl" onClick={e => e.stopPropagation()}>
            <div className={`size-24 rounded-[32px] mx-auto mb-6 flex items-center justify-center ${ACTION_CONFIG[selectedAction.action].lightBg} ${ACTION_CONFIG[selectedAction.action].darkBg} ${ACTION_CONFIG[selectedAction.action].textColor}`}>
               <span className="material-symbols-outlined text-5xl">{ACTION_CONFIG[selectedAction.action].icon}</span>
            </div>
            <h3 className="text-3xl font-black uppercase italic mb-2 leading-none tracking-tighter">
              {selectedAction.userName} <span className={ACTION_CONFIG[selectedAction.action].textColor}>{ACTION_CONFIG[selectedAction.action].label}</span>
            </h3>
            <p className="text-zinc-500 uppercase tracking-[0.2em] text-[10px] font-black italic mb-8">Pela vida de {selectedAction.friendName}</p>
            <div className="py-6 px-4 bg-zinc-50 dark:bg-white/5 rounded-3xl mb-10 border border-zinc-100 dark:border-white/10">
              <p className="text-lg font-black italic text-zinc-700 dark:text-zinc-300">"{ACTION_CONFIG[selectedAction.action].verse}"</p>
            </div>
            <button onClick={() => setSelectedAction(null)} className="w-full h-16 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase text-xs tracking-widest italic shadow-xl">Fechar</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default App;
