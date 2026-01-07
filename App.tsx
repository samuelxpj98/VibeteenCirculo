
import React, { useState, useEffect, useMemo, useRef, memo } from 'react';
import { GoogleGenAI } from "@google/genai";

// --- TYPES ---
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

type Tab = 'mural' | 'rank' | 'profile' | 'register';

// --- CONSTANTS ---
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
    description: 'Clamei a Deus.',
    icon: 'volunteer_activism',
    lightBg: 'bg-vibrant-blue-soft',
    darkBg: 'dark:bg-blue-500/10',
    textColor: 'text-vibrant-blue',
    verse: "Orai sem cessar. (1 Tes 5:17)"
  },
  [ActionType.CUIDEI]: {
    label: 'Cuidei',
    description: 'Amor prático.',
    icon: 'spa',
    lightBg: 'bg-vibrant-green-soft',
    darkBg: 'dark:bg-green-500/10',
    textColor: 'text-vibrant-green',
    verse: "Ame o seu próximo como a si mesmo. (Mt 22:39)"
  },
  [ActionType.COMPARTILHEI]: {
    label: 'Compartilhei',
    description: 'Falei de Jesus.',
    icon: 'share',
    lightBg: 'bg-vibrant-orange-soft',
    darkBg: 'dark:bg-orange-500/10',
    textColor: 'text-vibrant-orange',
    verse: "Ide e pregai o evangelho. (Mc 16:15)"
  }
};

// --- HELPERS ---
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

// --- COMPONENTS ---

// Fix: Use React.FC to properly handle the 'key' prop in components used within lists
const MuralCard: React.FC<{ action: CauseAction, onClick: (action: CauseAction) => void, style: React.CSSProperties }> = ({ action, onClick, style }) => {
  const config = ACTION_CONFIG[action.action];
  const day = new Date(action.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

  return (
    <button 
      onClick={() => onClick(action)}
      style={style}
      className={`absolute w-40 h-36 flex flex-col items-center justify-center rounded-[32px] border-2 border-white/50 dark:border-white/5 shadow-xl ${config.lightBg} ${config.darkBg} transition-all active:scale-90 group p-4`}
    >
      <div className={`size-10 rounded-xl flex items-center justify-center ${config.textColor} bg-white/80 dark:bg-black/40 mb-2`}>
        <span className="material-symbols-outlined text-2xl font-black">{config.icon}</span>
      </div>
      <p className="text-sm font-black uppercase tracking-tighter text-zinc-900 dark:text-zinc-100 truncate w-full text-center italic leading-none mb-1">
        {action.userName}
      </p>
      <div className="text-[9px] font-black text-zinc-400 uppercase tracking-widest italic">{day}</div>
      {action.userColor && (
        <div className="absolute top-3 right-3 size-2 rounded-full" style={{ backgroundColor: action.userColor }}></div>
      )}
    </button>
  );
};

const RegistrationForm = ({ onRegister, onCancel }: any) => {
  const [friendName, setFriendName] = useState('');
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);

  return (
    <div className="flex flex-col h-full w-full p-6 animate-in slide-in-from-bottom-12">
      <div className="mt-4 mb-8 text-center">
        <h2 className="text-3xl font-black uppercase italic italic leading-none">Qual o <span className="text-primary-dark dark:text-primary">Impacto?</span></h2>
      </div>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">Quem você ajudou?</label>
          <input 
            type="text" 
            placeholder="Nome do amigo..." 
            className="w-full h-16 px-6 bg-white dark:bg-zinc-900 border-2 border-transparent ring-1 ring-zinc-200 dark:ring-white/10 rounded-2xl font-bold text-lg outline-none"
            value={friendName}
            onChange={e => setFriendName(e.target.value)}
          />
        </div>
        <div className="grid gap-4">
          {(Object.keys(ACTION_CONFIG) as ActionType[]).map(type => (
            <button 
              key={type}
              onClick={() => setSelectedAction(type)}
              className={`flex items-center p-5 bg-white dark:bg-zinc-900 border-2 rounded-[24px] transition-all ${selectedAction === type ? 'border-primary ring-4 ring-primary/10' : 'border-transparent'}`}
            >
              <div className={`size-12 rounded-xl ${ACTION_CONFIG[type].lightBg} ${ACTION_CONFIG[type].darkBg} flex items-center justify-center ${ACTION_CONFIG[type].textColor} mr-4`}>
                <span className="material-symbols-outlined">{ACTION_CONFIG[type].icon}</span>
              </div>
              <div className="flex-1 text-left">
                <p className="font-black uppercase italic leading-none">{ACTION_CONFIG[type].label}</p>
                <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-1">{ACTION_CONFIG[type].description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="mt-auto flex gap-4 pt-10">
        <button onClick={onCancel} className="flex-1 h-14 bg-zinc-200 dark:bg-zinc-800 rounded-xl font-black uppercase text-xs">Voltar</button>
        <button 
          onClick={() => selectedAction && onRegister(friendName, selectedAction)}
          disabled={!selectedAction}
          className="flex-[2] h-14 bg-primary text-black rounded-xl font-black uppercase text-xs disabled:opacity-50"
        >
          Salvar Ação
        </button>
      </div>
    </div>
  );
};

const WelcomeScreen = ({ onComplete }: any) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  return (
    <div className="fixed inset-0 z-[100] bg-background-light dark:bg-background-dark flex flex-col items-center justify-center p-8">
      <div className="w-24 h-24 bg-primary rounded-[32px] flex items-center justify-center text-black shadow-2xl mb-8 rotate-3">
        <span className="material-symbols-outlined text-5xl font-black">all_inclusive</span>
      </div>
      <h1 className="text-4xl font-black uppercase italic text-center mb-10 leading-none">VIBE<br/>TEEN</h1>
      <div className="w-full max-w-xs space-y-4">
        <input 
          placeholder="Seu Nome" 
          className="w-full h-16 px-6 bg-white dark:bg-zinc-900 rounded-2xl border-0 ring-1 ring-zinc-200 dark:ring-white/10 font-bold"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input 
          placeholder="Seu E-mail" 
          className="w-full h-16 px-6 bg-white dark:bg-zinc-900 rounded-2xl border-0 ring-1 ring-zinc-200 dark:ring-white/10 font-bold"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <button 
          onClick={() => name && email && onComplete({ firstName: name, lastName: '', email, avatarColor: AVATAR_COLORS[0].hex, status: 'Visitante' })}
          className="w-full h-16 bg-black dark:bg-primary text-white dark:text-black rounded-2xl font-black uppercase tracking-widest text-xs"
        >
          Entrar no Círculo
        </button>
      </div>
    </div>
  );
};

// --- MAIN APP ---

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [actions, setActions] = useState<CauseAction[]>([]);
  const [currentTab, setCurrentTab] = useState<Tab>('mural');
  const [inspiration, setInspiration] = useState('Buscando direção...');
  const [selectedAction, setSelectedAction] = useState<CauseAction | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('vibe_user');
    if (saved) setUser(JSON.parse(saved));
    
    // Mock inicial de ações para o mural não ficar vazio
    setActions([
      { id: '1', userName: 'Davi', friendName: 'Lucas', action: ActionType.OREI, timestamp: new Date().toISOString(), userColor: '#0084FF' },
      { id: '2', userName: 'Ana', friendName: 'Gabi', action: ActionType.CUIDEI, timestamp: new Date().toISOString(), userColor: '#00F576' }
    ]);

    fetchInspiration();
  }, []);

  const fetchInspiration = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'Gere uma missão do dia para um jovem cristão (máximo 12 palavras). Ex: "Ore por um amigo que você não fala faz tempo".',
      });
      setInspiration(response.text || 'O Reino é construído com pequenas ações de amor.');
    } catch (e) {
      setInspiration('Deus usa sua disposição para mudar o mundo!');
    }
  };

  const handleRegister = (friendName: string, action: ActionType) => {
    if (!user) return;
    const newAction: CauseAction = {
      id: Math.random().toString(36),
      userName: user.firstName,
      friendName,
      action,
      timestamp: new Date().toISOString(),
      userColor: user.avatarColor
    };
    setActions([newAction, ...actions]);
    setCurrentTab('mural');
  };

  const spiralCoords = useMemo(() => getSpiralCoords(actions.length + 1, 180), [actions.length]);

  if (!user) return <WelcomeScreen onComplete={(u: User) => { setUser(u); localStorage.setItem('vibe_user', JSON.stringify(u)); }} />;

  return (
    <div className="min-h-screen max-w-md mx-auto bg-background-light dark:bg-background-dark text-black dark:text-white flex flex-col overflow-hidden font-sans">
      <div className="fixed inset-0 opacity-10 pointer-events-none bg-dot-pattern"></div>

      {/* HEADER */}
      <header className="relative z-50 p-6 flex items-center justify-between border-b border-black/5 dark:border-white/5 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-black font-black shadow-lg shadow-primary/20 rotate-3">
            <span className="material-symbols-outlined text-2xl">all_inclusive</span>
          </div>
          <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">VIBE TEEN</h1>
        </div>
        <div className="size-10 rounded-full border-2 border-primary overflow-hidden" style={{ backgroundColor: user.avatarColor }}></div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {currentTab === 'mural' && (
          <div className="flex-1 relative animate-in fade-in">
            {/* INSPIRATION BANNER */}
            <div className="absolute top-6 left-0 w-full px-6 z-20 text-center pointer-events-none">
              <h2 className="text-2xl font-black uppercase italic text-zinc-900 dark:text-white leading-none mb-1">Círculo da Causa</h2>
              <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/20 rounded-full backdrop-blur-md animate-in slide-in-from-top-4 duration-1000">
                <p className="text-[9px] font-black uppercase tracking-widest text-primary-dark dark:text-primary">⚡ MISSÃO: {inspiration}</p>
              </div>
            </div>

            {/* SPIRAL VIEW */}
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
              <div className="relative" style={{ transform: 'scale(0.8)' }}>
                {/* JESUS CENTER */}
                <div style={{ transform: `translate(${spiralCoords[0].x}px, ${spiralCoords[0].y}px)` }} className="absolute -translate-x-1/2 -translate-y-1/2 size-40 bg-primary rounded-[48px] border-8 border-white dark:border-zinc-800 shadow-2xl flex flex-col items-center justify-center text-black z-50 scale-110">
                  <span className="material-symbols-outlined text-6xl font-fill" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                  <p className="text-lg font-black uppercase tracking-widest italic">JESUS</p>
                </div>

                {/* ACTIONS */}
                {actions.map((action, i) => {
                  const coord = spiralCoords[i + 1] || { x: 0, y: 0 };
                  return (
                    <MuralCard 
                      key={action.id} 
                      action={action} 
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
          <div className="p-6 space-y-6 animate-in fade-in">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-8 leading-none">Impacto <span className="text-primary-dark dark:text-primary">Real</span></h2>
            {(Object.keys(ACTION_CONFIG) as ActionType[]).map(type => {
              const count = actions.filter(a => a.action === type).length;
              const config = ACTION_CONFIG[type];
              return (
                <div key={type} className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] shadow-xl border border-zinc-100 dark:border-white/5 relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                       <span className={`material-symbols-outlined text-3xl ${config.textColor}`}>{config.icon}</span>
                       <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total de {config.label}</span>
                    </div>
                    <p className="text-7xl font-black italic tracking-tighter leading-none">{count}</p>
                  </div>
                  <span className={`absolute -right-10 -top-10 material-symbols-outlined text-[180px] opacity-[0.05] ${config.textColor} rotate-12 group-hover:rotate-0 transition-transform duration-700`}>{config.icon}</span>
                </div>
              );
            })}
          </div>
        )}

        {currentTab === 'profile' && (
          <div className="p-6 animate-in fade-in text-center flex flex-col items-center pt-12">
            <div className="size-32 rounded-[32px] border-4 border-white dark:border-zinc-800 shadow-2xl flex items-center justify-center text-white text-4xl font-black mb-6 rotate-2" style={{ backgroundColor: user.avatarColor }}>
              {user.firstName[0]}
            </div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none mb-2">{user.firstName} {user.lastName}</h2>
            <div className="px-4 py-1 bg-zinc-100 dark:bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-10">{user.status}</div>
            
            <div className="w-full grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] shadow-lg text-left">
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2">Suas Ações</p>
                <p className="text-4xl font-black italic">{actions.filter(a => a.userName === user.firstName).length}</p>
              </div>
              <button 
                onClick={() => { localStorage.removeItem('vibe_user'); window.location.reload(); }}
                className="bg-zinc-900 dark:bg-zinc-800 p-6 rounded-[32px] shadow-lg text-left text-white"
              >
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">Conta</p>
                <p className="text-lg font-black italic uppercase leading-none">Sair</p>
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

      {/* FOOTER NAV */}
      {currentTab !== 'register' && (
        <nav className="p-6 pb-10 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent">
          <div className="h-20 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-[32px] shadow-2xl border border-black/5 dark:border-white/5 flex items-center justify-around px-4">
            <button onClick={() => setCurrentTab('mural')} className={`flex flex-col items-center transition-all ${currentTab === 'mural' ? 'text-black dark:text-primary scale-110' : 'text-zinc-400 opacity-60'}`}>
              <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: currentTab === 'mural' ? "'FILL' 1" : "'FILL' 0" }}>rocket_launch</span>
              <span className="text-[8px] font-black uppercase tracking-tighter italic">Mural</span>
            </button>
            <button onClick={() => setCurrentTab('rank')} className={`flex flex-col items-center transition-all ${currentTab === 'rank' ? 'text-black dark:text-primary scale-110' : 'text-zinc-400 opacity-60'}`}>
              <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: currentTab === 'rank' ? "'FILL' 1" : "'FILL' 0" }}>leaderboard</span>
              <span className="text-[8px] font-black uppercase tracking-tighter italic">Impacto</span>
            </button>
            <button onClick={() => setCurrentTab('profile')} className={`flex flex-col items-center transition-all ${currentTab === 'profile' ? 'text-black dark:text-primary scale-110' : 'text-zinc-400 opacity-60'}`}>
              <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: currentTab === 'profile' ? "'FILL' 1" : "'FILL' 0" }}>person</span>
              <span className="text-[8px] font-black uppercase tracking-tighter italic">Perfil</span>
            </button>
          </div>
        </nav>
      )}

      {/* FAB */}
      {currentTab !== 'register' && (
        <button 
          onClick={() => setCurrentTab('register')}
          className="fixed bottom-32 right-8 size-16 bg-primary text-black rounded-3xl shadow-2xl flex items-center justify-center z-50 animate-float border-4 border-white dark:border-zinc-800"
        >
          <span className="material-symbols-outlined text-4xl font-black">add</span>
        </button>
      )}

      {/* ACTION MODAL */}
      {selectedAction && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6" onClick={() => setSelectedAction(null)}>
          <div className="bg-white dark:bg-zinc-900 w-full rounded-[48px] p-10 text-center animate-in zoom-in" onClick={e => e.stopPropagation()}>
            <div className={`size-24 rounded-[32px] mx-auto mb-6 flex items-center justify-center ${ACTION_CONFIG[selectedAction.action].lightBg} ${ACTION_CONFIG[selectedAction.action].darkBg} ${ACTION_CONFIG[selectedAction.action].textColor}`}>
               <span className="material-symbols-outlined text-5xl">{ACTION_CONFIG[selectedAction.action].icon}</span>
            </div>
            <h3 className="text-3xl font-black uppercase italic mb-2 leading-none">{selectedAction.userName} <span className={ACTION_CONFIG[selectedAction.action].textColor}>{ACTION_CONFIG[selectedAction.action].label}</span></h3>
            <p className="text-zinc-500 uppercase tracking-widest text-[10px] font-black italic mb-8">Por {selectedAction.friendName}</p>
            <p className="text-lg font-bold italic text-zinc-600 dark:text-zinc-300 mb-10">"{ACTION_CONFIG[selectedAction.action].verse}"</p>
            <button onClick={() => setSelectedAction(null)} className="w-full h-16 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase text-xs">Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
