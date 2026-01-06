
import React, { useState, useEffect, useMemo, useRef, memo } from 'react';
import { User, CauseAction, ActionType, Tab, UserStatus } from './types.ts';
import { WelcomeScreen } from './components/WelcomeScreen.tsx';
import { MuralCard } from './components/MuralCard.tsx';
import { StatsCard } from './components/StatsCard.tsx';
import { RegistrationForm } from './components/RegistrationForm.tsx';
import { MissionHQ } from './components/MissionHQ.tsx';
import { subscribeToActions, registerAction, getAllUsers, updateUserStatus, updateUserDetails, deleteAction, deleteUser } from './services/apiService.ts';
import { ACTION_CONFIG, AVATAR_COLORS } from './constants.tsx';
import { GoogleGenAI } from "@google/genai";

const BIBLICAL_VERSES = {
  [ActionType.OREI]: "Orai sem cessar. (1 Tessalonicenses 5:17)",
  [ActionType.CUIDEI]: "Ame o seu próximo como a si mesmo. (Mateus 22:39)",
  [ActionType.COMPARTILHEI]: "Ide e pregai o evangelho a toda criatura. (Marcos 16:15)"
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

const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
};

const isToday = (dateString: string) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const now = new Date();
  return date.toDateString() === now.toDateString();
};

const OptimizedMuralCard = memo(MuralCard);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [actions, setActions] = useState<CauseAction[]>([]);
  const [currentTab, setCurrentTab] = useState<Tab>('mural');
  const [submitting, setSubmitting] = useState(false);
  const [selectedAction, setSelectedAction] = useState<CauseAction | null>(null);
  const [aiInspiration, setAiInspiration] = useState<string>('');
  
  const [zoom, setZoom] = useState(0.8);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [syncing, setSyncing] = useState(true);
  
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showMissionHQ, setShowMissionHQ] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [adminTab, setAdminTab] = useState<'users' | 'actions'>('users');
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editColor, setEditColor] = useState('');

  const muralRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const storedUser = localStorage.getItem('causa_user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setEditFirstName(parsed.firstName);
      setEditLastName(parsed.lastName);
      setEditColor(parsed.avatarColor);
      fetchAIInspiration();
    }
    
    const unsubscribe = subscribeToActions((newActions) => {
      setActions(newActions);
      setSyncing(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchAIInspiration = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'Gere uma frase curta e impactante (máximo 15 palavras) para um jovem cristão sobre impacto social, oração ou cuidado ao próximo. Seja moderno e vibrante.',
      });
      setAiInspiration(response.text || 'O Reino de Deus é feito de pequenas ações com grande amor.');
    } catch (err) {
      console.error("Erro ao carregar inspiração AI", err);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (currentTab !== 'mural') return;
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.min(Math.max(prev * delta, 0.2), 3));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (currentTab !== 'mural') return;
    isDragging.current = true;
    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || currentTab !== 'mural') return;
    const dx = e.touches[0].clientX - lastPos.current.x;
    const dy = e.touches[0].clientY - lastPos.current.y;
    setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = () => { isDragging.current = false; };

  const handleWelcomeComplete = (newUser: User) => {
    setUser(newUser);
    setEditFirstName(newUser.firstName);
    setEditLastName(newUser.lastName);
    setEditColor(newUser.avatarColor);
    localStorage.setItem('causa_user', JSON.stringify(newUser));
    fetchAIInspiration();
  };

  const handleRegister = async (friendName: string, actionType: ActionType) => {
    if (!user) return;
    setSubmitting(true);
    try {
      await registerAction({ 
        userName: user.firstName, 
        friendName: friendName || 'Alguém', 
        action: actionType,
        userColor: user.avatarColor 
      });
      setCurrentTab('mural');
    } catch (err) {
      alert('Erro ao salvar no Firebase.');
    } finally {
      setSubmitting(false);
    }
  };

  const globalStats = useMemo(() => ({
    [ActionType.OREI]: {
      total: actions.filter(a => a.action === ActionType.OREI).length,
      today: actions.filter(a => a.action === ActionType.OREI && isToday(a.timestamp)).length
    },
    [ActionType.CUIDEI]: {
      total: actions.filter(a => a.action === ActionType.CUIDEI).length,
      today: actions.filter(a => a.action === ActionType.CUIDEI && isToday(a.timestamp)).length
    },
    [ActionType.COMPARTILHEI]: {
      total: actions.filter(a => a.action === ActionType.COMPARTILHEI).length,
      today: actions.filter(a => a.action === ActionType.COMPARTILHEI && isToday(a.timestamp)).length
    },
  }), [actions]);

  const myStats = useMemo(() => {
    if (!user) return { [ActionType.OREI]: 0, [ActionType.CUIDEI]: 0, [ActionType.COMPARTILHEI]: 0 };
    return {
      [ActionType.OREI]: actions.filter(a => a.userName === user.firstName && a.action === ActionType.OREI).length,
      [ActionType.CUIDEI]: actions.filter(a => a.userName === user.firstName && a.action === ActionType.CUIDEI).length,
      [ActionType.COMPARTILHEI]: actions.filter(a => a.userName === user.firstName && a.action === ActionType.COMPARTILHEI).length,
    };
  }, [actions, user]);

  const spiralCoords = useMemo(() => getSpiralCoords(actions.length + 1, 180), [actions.length]);

  if (!user) return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  if (showMissionHQ) return <MissionHQ actions={actions} onClose={() => setShowMissionHQ(false)} />;

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto relative bg-background-light dark:bg-background-dark text-zinc-900 dark:text-white pb-24 overflow-hidden">
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none bg-dot-pattern"></div>

      <header className="relative z-[60] p-4 pt-6 sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md flex items-center justify-between border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[14px] bg-primary flex items-center justify-center text-black shadow-lg shadow-primary/40 rotate-3">
            <span className="material-symbols-outlined text-[24px] font-black">all_inclusive</span>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter uppercase leading-none italic">VIBE TEEN</h1>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`size-1.5 rounded-full ${syncing ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></span>
              <span className="text-[7px] font-bold text-zinc-400 uppercase tracking-widest italic">{syncing ? 'Sync...' : 'Online'}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {currentTab === 'mural' && (
          <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in relative">
            <div className="absolute top-6 left-0 w-full z-50 pointer-events-none text-center px-4">
              <h2 className="text-3xl font-black bg-gradient-to-r from-yellow-600 to-orange-500 bg-clip-text text-transparent uppercase tracking-tighter italic leading-none">Círculo da Causa</h2>
              {aiInspiration && (
                <p className="text-zinc-500 text-[10px] font-black italic uppercase tracking-[0.1em] mt-2 px-6 animate-in fade-in slide-in-from-top-2 duration-1000">
                  ⚡ {aiInspiration}
                </p>
              )}
            </div>

            <div 
              ref={muralRef} 
              onWheel={handleWheel}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="relative flex-1 overflow-hidden touch-none"
            >
              <div 
                className="absolute inset-0 flex items-center justify-center transition-transform duration-75 ease-out"
                style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }}
              >
                <div style={{ position: 'absolute', transform: `translate(${spiralCoords[0]?.x || 0}px, ${spiralCoords[0]?.y || 0}px)`, zIndex: 200 }} className="size-40 flex flex-col items-center justify-center rounded-[48px] bg-primary text-black shadow-2xl border-8 border-white dark:border-zinc-800 scale-110 active:scale-95 transition-all">
                  <span className="material-symbols-outlined text-6xl mb-1 font-fill" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                  <p className="text-[18px] font-black uppercase tracking-widest italic">JESUS</p>
                </div>

                {actions.map((action, index) => {
                  const coord = spiralCoords[index + 1] || { x: 0, y: 0 };
                  return (
                    <OptimizedMuralCard 
                      key={action.id} 
                      action={action} 
                      onClick={(a) => setSelectedAction(a)} 
                      style={{ 
                        position: 'absolute', 
                        left: '50%', 
                        top: '50%', 
                        marginLeft: `${coord.x}px`, 
                        marginTop: `${coord.y}px`, 
                        transform: `translate(-50%, -50%)`, 
                        zIndex: 100 - index 
                      }} 
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {currentTab === 'rank' && (
          <div className="animate-in fade-in p-4 overflow-y-auto no-scrollbar space-y-6 pb-20">
            <div className="pt-2 mb-4 text-center">
              <h2 className="text-4xl font-black tracking-tighter uppercase italic leading-none">Nosso <span className="text-yellow-600 dark:text-primary">Legado</span></h2>
            </div>
            <div className="flex flex-col gap-6">
              <StatsCard type={ActionType.OREI} count={globalStats[ActionType.OREI].total} todayCount={globalStats[ActionType.OREI].today} />
              <StatsCard type={ActionType.CUIDEI} count={globalStats[ActionType.CUIDEI].total} todayCount={globalStats[ActionType.CUIDEI].today} />
              <StatsCard type={ActionType.COMPARTILHEI} count={globalStats[ActionType.COMPARTILHEI].total} todayCount={globalStats[ActionType.COMPARTILHEI].today} />
            </div>
          </div>
        )}

        {currentTab === 'profile' && (
          <div className="animate-in fade-in p-4 overflow-y-auto no-scrollbar pb-10">
            <div className="flex flex-col items-center pt-8 pb-10 mb-8 bg-white dark:bg-zinc-900 rounded-[48px] border border-zinc-100 dark:border-white/5 shadow-2xl relative overflow-hidden text-center">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/20 to-transparent"></div>
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-[32px] border-4 border-white dark:border-zinc-800 flex items-center justify-center text-white text-4xl font-black shadow-2xl mx-auto rotate-2 transition-transform hover:rotate-0" style={{ backgroundColor: user.avatarColor }}>
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <div className={`absolute -bottom-2 -right-2 ${user.status === 'Líder' ? 'bg-orange-500' : user.status === 'Membro' ? 'bg-blue-500' : 'bg-primary'} text-black size-10 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white dark:border-zinc-800`}>
                  <span className="material-symbols-outlined text-[20px] font-black">{user.status === 'Líder' ? 'star' : user.status === 'Membro' ? 'verified' : 'person'}</span>
                </div>
              </div>
              <h2 className="text-3xl font-black tracking-tighter uppercase italic leading-none">{user.firstName} {user.lastName}</h2>
              <div className="flex flex-col items-center gap-2 mt-4">
                <div className="px-4 py-1.5 bg-zinc-100 dark:bg-white/5 rounded-full flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs text-zinc-400">verified_user</span>
                  <p className="text-zinc-600 dark:text-zinc-300 font-black uppercase text-[10px] tracking-[0.2em] italic">{user.status || 'Visitante'}</p>
                </div>
              </div>
            </div>

            <div className="mb-8 space-y-4">
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] px-4 italic">Minha Atuação</h3>
              {(Object.keys(ACTION_CONFIG) as ActionType[]).map(type => (
                <div key={type} className="p-5 bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-100 dark:border-white/5 shadow-sm flex gap-4 items-center active:scale-95 transition-all">
                  <div className={`size-14 rounded-[20px] flex-shrink-0 flex items-center justify-center ${ACTION_CONFIG[type].lightBg} ${ACTION_CONFIG[type].darkBg} ${ACTION_CONFIG[type].textColor}`}>
                    <span className="material-symbols-outlined text-3xl">{ACTION_CONFIG[type].icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-lg tracking-tight uppercase italic">{ACTION_CONFIG[type].label}</span>
                      <span className={`${ACTION_CONFIG[type].textColor} font-black text-2xl`}>{myStats[type]}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 mb-8">
              <button 
                onClick={() => setIsEditingProfile(true)}
                className="w-full flex items-center p-6 bg-white dark:bg-zinc-900 rounded-[32px] gap-4 border border-zinc-100 dark:border-white/5 active:scale-95 transition-transform shadow-lg"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary-dark"><span className="material-symbols-outlined">palette</span></div>
                <div className="flex-1 text-left font-black text-xs uppercase tracking-widest italic leading-none">Mudar Estilo</div>
              </button>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowMissionHQ(true)}
                  className="flex items-center p-6 bg-primary text-black rounded-[32px] gap-4 shadow-lg active:scale-95 transition-transform"
                >
                  <div className="w-10 h-10 rounded-xl bg-black/10 flex items-center justify-center"><span className="material-symbols-outlined">insights</span></div>
                  <div className="flex-1 text-left font-black text-[10px] uppercase tracking-widest italic leading-none">QG Missão</div>
                </button>

                <button 
                  onClick={() => setShowPasswordModal(true)}
                  className="flex items-center p-6 bg-zinc-900 dark:bg-zinc-800 text-white rounded-[32px] gap-4 border border-zinc-100 dark:border-white/5 active:scale-95 transition-transform shadow-lg"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white"><span className="material-symbols-outlined">admin_panel_settings</span></div>
                  <div className="flex-1 text-left font-black text-[10px] uppercase tracking-widest italic leading-none">ADM</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'register' && <RegistrationForm onRegister={handleRegister} onCancel={() => setCurrentTab('mural')} isSubmitting={submitting} />}
      </main>

      {/* FOOTER NAV */}
      {currentTab !== 'register' && !showAdminPanel && !isEditingProfile && !showPasswordModal && (
        <nav className="fixed bottom-0 left-0 w-full p-4 pb-8 z-40 bg-gradient-to-t from-background-light dark:from-background-dark via-background-light/95 to-transparent pt-12">
          <div className="max-w-md mx-auto h-20 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-[32px] shadow-2xl flex items-center justify-around px-4">
            <button onClick={() => setCurrentTab('mural')} className={`flex flex-col items-center gap-1 transition-all ${currentTab === 'mural' ? 'text-black dark:text-primary scale-110' : 'text-zinc-400 opacity-60'}`}>
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: currentTab === 'mural' ? "'FILL' 1" : "'FILL' 0" }}>rocket_launch</span>
              <span className="text-[9px] font-black uppercase tracking-tighter italic">Mural</span>
            </button>
            <button onClick={() => setCurrentTab('rank')} className={`flex flex-col items-center gap-1 transition-all ${currentTab === 'rank' ? 'text-black dark:text-primary scale-110' : 'text-zinc-400 opacity-60'}`}>
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: currentTab === 'rank' ? "'FILL' 1" : "'FILL' 0" }}>leaderboard</span>
              <span className="text-[9px] font-black uppercase tracking-tighter italic">Impacto</span>
            </button>
            <button onClick={() => setCurrentTab('profile')} className={`flex flex-col items-center gap-1 transition-all ${currentTab === 'profile' ? 'text-black dark:text-primary scale-110' : 'text-zinc-400 opacity-60'}`}>
              <div className={`w-8 h-8 rounded-[8px] flex items-center justify-center text-[10px] font-black text-white transition-all ${currentTab === 'profile' ? 'border-2 border-primary shadow-lg shadow-primary/20' : 'border-zinc-200 dark:border-zinc-800 opacity-70'}`} style={{ backgroundColor: user.avatarColor }}>
                {user.firstName[0]}
              </div>
              <span className="text-[9px] font-black uppercase tracking-tighter italic">Perfil</span>
            </button>
          </div>
        </nav>
      )}

      {currentTab !== 'register' && !showAdminPanel && !isEditingProfile && !showPasswordModal && (
        <button onClick={() => setCurrentTab('register')} className="fixed bottom-28 right-6 w-16 h-16 rounded-[24px] bg-primary text-black shadow-2xl flex items-center justify-center z-50 animate-float active:scale-90 transition-all border-4 border-white dark:border-zinc-800">
          <span className="material-symbols-outlined text-3xl font-black">add</span>
        </button>
      )}

      {/* SELECTED ACTION MODAL */}
      {selectedAction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-sm bg-white dark:bg-zinc-900 rounded-[48px] p-8 shadow-2xl flex flex-col items-center text-center border border-white/10 animate-in zoom-in-95">
            <div className={`size-28 rounded-[32px] ${ACTION_CONFIG[selectedAction.action].lightBg} ${ACTION_CONFIG[selectedAction.action].darkBg} flex items-center justify-center ${ACTION_CONFIG[selectedAction.action].textColor} mb-8 shadow-inner ring-4 ring-primary/20`}>
              <span className="material-symbols-outlined text-6xl">{ACTION_CONFIG[selectedAction.action].icon}</span>
            </div>
            <h3 className="text-3xl font-black mb-2 uppercase tracking-tighter italic leading-none">{ACTION_CONFIG[selectedAction.action].label}</h3>
            <p className="text-zinc-500 font-bold text-[10px] mb-4 uppercase tracking-[0.1em] italic">Registrado em {formatDate(selectedAction.timestamp)}</p>
            <div className="w-full p-8 bg-zinc-50 dark:bg-white/5 rounded-[32px] mb-8 text-center border border-zinc-100 dark:border-white/5">
              <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-3 italic">Impacto gerado em:</p>
              <p className="text-3xl font-black text-primary-dark dark:text-primary tracking-tighter uppercase italic leading-none">{selectedAction.friendName}</p>
            </div>
            <p className="text-sm font-bold text-zinc-600 dark:text-zinc-300 italic mb-10 max-w-[260px] leading-relaxed">"{BIBLICAL_VERSES[selectedAction.action]}"</p>
            <button onClick={() => setSelectedAction(null)} className="w-full py-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black rounded-[24px] uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all italic">Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
