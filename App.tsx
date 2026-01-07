
import React, { useState, useEffect, useMemo, useRef, memo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { 
  getFirestore, collection, addDoc, onSnapshot, query, 
  orderBy, doc, getDoc, setDoc, limit 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// --- 1. CONFIGURAÇÕES E CONSTANTES ---

const firebaseConfig = {
  apiKey: "AIzaSyAXP8095JDr1Ck1xFOoF5lCREE9VxXMUJw",
  authDomain: "vibe-teen.firebaseapp.com",
  projectId: "vibe-teen",
  storageBucket: "vibe-teen.firebasestorage.app",
  messagingSenderId: "137191414500",
  appId: "1:137191414500:web:8ad24baadb6aafe6ff2af1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

enum ActionType {
  OREI = 'orei',
  CUIDEI = 'cuidei',
  COMPARTILHEI = 'compartilhei'
}

const ACTION_CONFIG = {
  [ActionType.OREI]: {
    label: 'Orei',
    icon: 'volunteer_activism',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    verse: "Orai sem cessar. (1 Tes 5:17)"
  },
  [ActionType.CUIDEI]: {
    label: 'Cuidei',
    icon: 'spa',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    verse: "Ame o seu próximo como a si mesmo. (Mt 22:39)"
  },
  [ActionType.COMPARTILHEI]: {
    label: 'Compartilhei',
    icon: 'share',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    verse: "Ide e pregai o evangelho. (Mc 16:15)"
  }
};

const AVATAR_COLORS = ['#0084FF', '#00F576', '#FF5E00', '#A855F7', '#EC4899', '#f9f506'];

// --- 2. COMPONENTES DE UI ---

const MuralCard = ({ action, onClick, style }: any) => {
  const config = ACTION_CONFIG[action.action as ActionType];
  return (
    <button 
      onClick={() => onClick(action)}
      style={style}
      className={`absolute w-36 h-36 flex flex-col items-center justify-center rounded-[32px] border-2 border-white/10 shadow-2xl ${config.bg} backdrop-blur-sm transition-all active:scale-90 p-4`}
    >
      <span className={`material-symbols-outlined text-3xl ${config.color} mb-2`}>{config.icon}</span>
      <p className="text-sm font-black uppercase italic leading-none text-white truncate w-full text-center">{action.userName}</p>
      <div className="text-[8px] font-bold text-zinc-500 uppercase mt-1 tracking-widest">
        {new Date(action.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
      </div>
      <div className="absolute top-3 right-3 size-2 rounded-full" style={{ backgroundColor: action.userColor }}></div>
    </button>
  );
};

const WelcomeScreen = ({ onComplete }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [color, setColor] = useState(AVATAR_COLORS[0]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#0f0f0f] flex flex-col items-center justify-center p-8">
      <div className="size-20 bg-primary rounded-[28px] flex items-center justify-center text-black mb-6 rotate-3 shadow-[0_0_40px_rgba(249,245,6,0.2)]">
        <span className="material-symbols-outlined text-4xl font-black">all_inclusive</span>
      </div>
      <h1 className="text-5xl font-black italic text-white uppercase tracking-tighter leading-none text-center mb-12">VIBE<br/>TEEN</h1>
      
      <div className="w-full max-w-xs space-y-4">
        <input 
          placeholder="Seu Nome" 
          className="w-full h-16 px-6 bg-zinc-900 text-white rounded-2xl border-0 ring-1 ring-white/10 font-bold outline-none focus:ring-2 focus:ring-primary"
          value={name} onChange={e => setName(e.target.value)}
        />
        <input 
          placeholder="E-mail" 
          className="w-full h-16 px-6 bg-zinc-900 text-white rounded-2xl border-0 ring-1 ring-white/10 font-bold outline-none focus:ring-2 focus:ring-primary"
          value={email} onChange={e => setEmail(e.target.value)}
        />
        <div className="flex justify-between py-2">
          {AVATAR_COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)} className={`size-8 rounded-full border-2 ${color === c ? 'border-white scale-125' : 'border-transparent opacity-50'}`} style={{ backgroundColor: c }} />
          ))}
        </div>
        <button 
          onClick={() => name && email && onComplete({ firstName: name, email, avatarColor: color })}
          className="w-full h-16 bg-primary text-black rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
        >
          Entrar no Movimento
        </button>
      </div>
    </div>
  );
};

// --- 3. APP PRINCIPAL ---

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [actions, setActions] = useState<any[]>([]);
  const [tab, setTab] = useState('mural');
  const [mission, setMission] = useState('Buscando direção...');
  const [selected, setSelected] = useState<any>(null);
  const [showRegister, setShowRegister] = useState(false);

  // Formulário de Registro (Inline)
  const [regFriend, setRegFriend] = useState('');
  const [regAction, setRegAction] = useState<ActionType | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('vibe_v3');
    if (saved) setUser(JSON.parse(saved));

    const q = query(collection(db, 'vibe_teen_actions'), orderBy('timestamp', 'desc'), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      setActions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    fetchMission();
    return () => unsub();
  }, []);

  const fetchMission = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'Crie uma micro-missão de impacto cristão (max 8 palavras). Ex: "Ore por alguém que você viu hoje".',
      });
      setMission(res.text || 'Seja luz onde você estiver.');
    } catch (e) {
      setMission('Ame o seu próximo hoje.');
    }
  };

  const handleRegister = async () => {
    if (!regAction || !user) return;
    try {
      await addDoc(collection(db, 'vibe_teen_actions'), {
        userName: user.firstName,
        friendName: regFriend || 'Alguém',
        action: regAction,
        timestamp: new Date().toISOString(),
        userColor: user.avatarColor
      });
      setShowRegister(false);
      setRegFriend('');
      setRegAction(null);
    } catch (e) {
      alert("Erro ao salvar. Verifique sua conexão.");
    }
  };

  const spiralCoords = useMemo(() => {
    let x = 0, y = 0, dx = 0, dy = -1, cellSize = 160;
    const coords = [];
    for (let i = 0; i < actions.length + 1; i++) {
      coords.push({ x: x * cellSize, y: y * cellSize });
      if (x === y || (x < 0 && x === -y) || (x > 0 && x === 1 - y)) [dx, dy] = [-dy, dx];
      x += dx; y += dy;
    }
    return coords;
  }, [actions]);

  if (!user) return <WelcomeScreen onComplete={(u: any) => { setUser(u); localStorage.setItem('vibe_v3', JSON.stringify(u)); }} />;

  return (
    <div className="min-h-screen max-w-md mx-auto bg-[#0f0f0f] text-white flex flex-col relative overflow-hidden font-sans">
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:20px_20px]"></div>

      {/* HEADER */}
      <header className="p-6 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-black font-black rotate-3 shadow-lg">
            <span className="material-symbols-outlined text-2xl">all_inclusive</span>
          </div>
          <h1 className="text-xl font-black italic tracking-tighter uppercase">VIBE TEEN</h1>
        </div>
        <div className="size-10 rounded-full border-2 border-primary flex items-center justify-center font-black text-[10px]" style={{ backgroundColor: user.avatarColor }}>
          {user.firstName[0]}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 relative flex flex-col">
        {tab === 'mural' && (
          <div className="flex-1 relative overflow-hidden">
            <div className="absolute top-6 left-0 w-full z-20 text-center pointer-events-none px-6">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Círculo da Causa</h2>
              <div className="inline-block px-4 py-2 bg-white/5 border border-primary/20 rounded-full backdrop-blur-md">
                <p className="text-[9px] font-black uppercase tracking-widest text-primary">⚡ MISSÃO: {mission}</p>
              </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative" style={{ transform: 'scale(0.8)' }}>
                {/* JESUS */}
                <div style={{ transform: `translate(${spiralCoords[0].x}px, ${spiralCoords[0].y}px)` }} className="absolute -translate-x-1/2 -translate-y-1/2 size-40 bg-primary rounded-[48px] border-8 border-zinc-900 shadow-[0_0_60px_rgba(249,245,6,0.3)] flex flex-col items-center justify-center text-black z-50 scale-110">
                  <span className="material-symbols-outlined text-6xl font-fill" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                  <p className="text-lg font-black uppercase tracking-widest italic">JESUS</p>
                </div>
                {/* ACTIONS */}
                {actions.map((a, i) => (
                  <MuralCard 
                    key={a.id} action={a} onClick={setSelected}
                    style={{ left: spiralCoords[i+1].x, top: spiralCoords[i+1].y, transform: 'translate(-50%, -50%)' }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'rank' && (
          <div className="p-8 space-y-6 overflow-y-auto no-scrollbar pb-32">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-8">Nossa <span className="text-primary">Vibe</span></h2>
            {Object.keys(ACTION_CONFIG).map((type: any) => (
              <div key={type} className="bg-zinc-900/50 p-8 rounded-[40px] border border-white/5 flex items-center justify-between group">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`material-symbols-outlined ${ACTION_CONFIG[type as ActionType].color}`}>{ACTION_CONFIG[type as ActionType].icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{ACTION_CONFIG[type as ActionType].label}</span>
                  </div>
                  <p className="text-6xl font-black italic tracking-tighter">{actions.filter(a => a.action === type).length}</p>
                </div>
                <span className="material-symbols-outlined text-[100px] opacity-[0.03] group-hover:opacity-10 transition-opacity">{ACTION_CONFIG[type as ActionType].icon}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'profile' && (
          <div className="p-8 flex flex-col items-center pt-16">
            <div className="size-32 rounded-[40px] border-4 border-zinc-800 shadow-2xl flex items-center justify-center text-white text-5xl font-black mb-6 rotate-2" style={{ backgroundColor: user.avatarColor }}>
              {user.firstName[0]}
            </div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-12">{user.firstName}</h2>
            <div className="w-full grid grid-cols-2 gap-4">
              <div className="bg-zinc-900 p-8 rounded-[40px] text-left">
                <p className="text-[10px] font-black text-zinc-500 uppercase mb-2">Minhas Ações</p>
                <p className="text-5xl font-black italic">{actions.filter(a => a.userName === user.firstName).length}</p>
              </div>
              <button onClick={() => { localStorage.clear(); location.reload(); }} className="bg-zinc-800 p-8 rounded-[40px] text-left hover:bg-red-500/10 transition-colors">
                <p className="text-[10px] font-black text-zinc-500 uppercase mb-2">Sair</p>
                <p className="text-xl font-black italic uppercase">Logout</p>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER NAV */}
      <nav className="fixed bottom-0 left-0 right-0 p-6 pb-10 bg-gradient-to-t from-black to-transparent z-40">
        <div className="max-w-md mx-auto h-20 bg-zinc-900/90 backdrop-blur-2xl rounded-[32px] border border-white/10 flex items-center justify-around">
          <button onClick={() => setTab('mural')} className={`flex flex-col items-center ${tab === 'mural' ? 'text-primary' : 'text-zinc-500'}`}>
            <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: tab === 'mural' ? "'FILL' 1" : "'FILL' 0" }}>rocket_launch</span>
            <span className="text-[8px] font-black uppercase italic">Mural</span>
          </button>
          <button onClick={() => setTab('rank')} className={`flex flex-col items-center ${tab === 'rank' ? 'text-primary' : 'text-zinc-500'}`}>
            <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: tab === 'rank' ? "'FILL' 1" : "'FILL' 0" }}>leaderboard</span>
            <span className="text-[8px] font-black uppercase italic">Vibe</span>
          </button>
          <button onClick={() => setTab('profile')} className={`flex flex-col items-center ${tab === 'profile' ? 'text-primary' : 'text-zinc-500'}`}>
            <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: tab === 'profile' ? "'FILL' 1" : "'FILL' 0" }}>person</span>
            <span className="text-[8px] font-black uppercase italic">Perfil</span>
          </button>
        </div>
      </nav>

      {/* FAB */}
      <button 
        onClick={() => setShowRegister(true)}
        className="fixed bottom-32 right-8 size-16 bg-primary text-black rounded-3xl shadow-2xl flex items-center justify-center z-50 animate-bounce active:scale-90 border-4 border-zinc-900"
      >
        <span className="material-symbols-outlined text-4xl font-black">add</span>
      </button>

      {/* MODAL REGISTRO */}
      {showRegister && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col p-8">
           <h2 className="text-4xl font-black uppercase italic tracking-tighter mt-12 mb-12">Novo <span className="text-primary">Impacto</span></h2>
           <div className="space-y-8">
              <input 
                placeholder="Quem você abençoou?" 
                className="w-full h-18 px-8 bg-zinc-900 rounded-3xl border-0 ring-1 ring-white/10 font-bold text-xl outline-none"
                value={regFriend} onChange={e => setRegFriend(e.target.value)}
              />
              <div className="grid gap-4">
                {Object.keys(ACTION_CONFIG).map(type => (
                  <button 
                    key={type} onClick={() => setRegAction(type as ActionType)}
                    className={`flex items-center p-6 rounded-3xl border-2 transition-all ${regAction === type ? 'border-primary bg-primary/10' : 'border-transparent bg-zinc-900'}`}
                  >
                    <span className={`material-symbols-outlined text-4xl mr-4 ${ACTION_CONFIG[type as ActionType].color}`}>{ACTION_CONFIG[type as ActionType].icon}</span>
                    <span className="font-black uppercase italic text-xl">{ACTION_CONFIG[type as ActionType].label}</span>
                  </button>
                ))}
              </div>
           </div>
           <div className="mt-auto flex gap-4 pb-12">
              <button onClick={() => setShowRegister(false)} className="flex-1 h-16 bg-zinc-800 rounded-2xl font-black uppercase text-xs">Cancelar</button>
              <button onClick={handleRegister} className="flex-[2] h-16 bg-primary text-black rounded-2xl font-black uppercase text-xs shadow-xl">Salvar no Mural</button>
           </div>
        </div>
      )}

      {/* MODAL DETALHES */}
      {selected && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-8" onClick={() => setSelected(null)}>
           <div className="bg-zinc-900 w-full max-w-sm rounded-[48px] p-10 text-center border border-white/5" onClick={e => e.stopPropagation()}>
              <span className={`material-symbols-outlined text-7xl mb-6 ${ACTION_CONFIG[selected.action as ActionType].color}`}>{ACTION_CONFIG[selected.action as ActionType].icon}</span>
              <h3 className="text-3xl font-black uppercase italic leading-none mb-2">{selected.userName}</h3>
              <p className="text-zinc-500 uppercase tracking-widest text-[10px] mb-8">Abençoou {selected.friendName}</p>
              <div className="p-6 bg-black/40 rounded-3xl mb-8">
                <p className="text-lg font-bold italic text-zinc-300">"{ACTION_CONFIG[selected.action as ActionType].verse}"</p>
              </div>
              <button onClick={() => setSelected(null)} className="w-full h-16 bg-white text-black rounded-2xl font-black uppercase text-xs">Fechar</button>
           </div>
        </div>
      )}
    </div>
  );
}
