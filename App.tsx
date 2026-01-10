
import React, { useState, useEffect, useMemo, useRef, memo } from 'react';
import { User, CauseAction, ActionType, Tab, ContentItem, UserStatus } from './types';
import { WelcomeScreen } from './components/WelcomeScreen';
import { MuralCard } from './components/MuralCard';
import { StatsCard } from './components/StatsCard';
import { RegistrationForm } from './components/RegistrationForm';
import { ProjectionMode } from './components/ProjectionMode';
import { subscribeToActions, registerAction, getAllUsers, updateUserStatus, updateUserDetails, deleteAction, deleteUser } from './services/apiService';
import { ACTION_CONFIG, AVATAR_COLORS } from './constants';

const BIBLICAL_VERSES = {
  [ActionType.OREI]: "Orai sem cessar. (1 Tessalonicenses 5:17)",
  [ActionType.CUIDEI]: "Ame o seu próximo como a si mesmo. (Mateus 22:39)",
  [ActionType.COMPARTILHEI]: "Ide e pregai o gospel a toda criatura. (Marcos 16:15)"
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
  
  // Mural State
  const [zoom, setZoom] = useState(0.8);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [syncing, setSyncing] = useState(true);
  
  // Admin & Mode States
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showProjection, setShowProjection] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [adminTab, setAdminTab] = useState<'users' | 'actions'>('users');
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  
  // Profile State
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
    }
    
    const unsubscribe = subscribeToActions((newActions) => {
      setActions(newActions);
      setSyncing(false);
    });
    return () => unsubscribe();
  }, []);

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
  };

  const handleRegister = async (friendName: string, actionType: ActionType) => {
    if (!user) return;
    setSubmitting(true);
    try {
      await registerAction({ 
        userName: user.firstName, 
        friendName, 
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      const updates = { avatarColor: editColor };
      await updateUserDetails(user.email, updates);
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('causa_user', JSON.stringify(updatedUser));
      setIsEditingProfile(false);
      alert("Estilo do perfil atualizado!");
    } catch (err) {
      alert("Erro ao atualizar estilo.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === '9898') {
      setShowPasswordModal(false);
      setShowAdminPanel(true);
      setIsAdminLoading(true);
      setAdminPassword('');
      try {
        const users = await getAllUsers();
        setAdminUsers(users);
      } catch (err) {
        alert("Erro ao carregar usuários.");
      } finally {
        setIsAdminLoading(false);
      }
    } else {
      alert("Senha incorreta!");
      setAdminPassword('');
    }
  };

  const handleDeleteUser = async (email: string) => {
    if (confirm(`Excluir permanentemente o usuário ${email}? Todas as ações dele continuarão no mural mas o perfil será removido.`)) {
      try {
        await deleteUser(email);
        const updated = await getAllUsers();
        setAdminUsers(updated);
      } catch (err) {
        alert("Erro ao excluir usuário.");
      }
    }
  };

  const handleDeleteAction = async (id: string) => {
    if (confirm("Deseja remover esta ação do mural permanentemente?")) {
      try {
        await deleteAction(id);
      } catch (err) {
        alert("Erro ao excluir ação.");
      }
    }
  };

  const handleChangeStatus = async (email: string, newStatus: UserStatus) => {
    try {
      await updateUserStatus(email, newStatus);
      const updated = await getAllUsers();
      setAdminUsers(updated);
      if (user && user.email.toLowerCase() === email.toLowerCase()) {
        const updatedUser = { ...user, status: newStatus };
        setUser(updatedUser);
        localStorage.setItem('causa_user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      alert("Erro ao atualizar status.");
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
  if (showProjection) return <ProjectionMode actions={actions} onClose={() => setShowProjection(false)} />;

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
              <p className="text-zinc-500 text-[10px] font-black italic uppercase tracking-[0.2em] mt-1">Vibe Teen em Movimento</p>
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
                  onClick={() => setShowProjection(true)}
                  className="flex items-center p-6 bg-primary text-black rounded-[32px] gap-4 shadow-lg active:scale-95 transition-transform"
                >
                  <div className="w-10 h-10 rounded-xl bg-black/10 flex items-center justify-center"><span className="material-symbols-outlined">tv</span></div>
                  <div className="flex-1 text-left font-black text-[10px] uppercase tracking-widest italic leading-none">Modo TV</div>
                </button>

                <button 
                  onClick={() => setShowPasswordModal(true)}
                  className="flex items-center p-6 bg-zinc-900 dark:bg-zinc-800 text-white rounded-[32px] gap-4 border border-zinc-100 dark:border-white/5 active:scale-95 transition-transform shadow-lg"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white"><span className="material-symbols-outlined">admin_panel_settings</span></div>
                  <div className="flex-1 text-left font-black text-[10px] uppercase tracking-widest italic leading-none">ADM</div>
                </button>
              </div>

              <button 
                onClick={() => { if(confirm('Sair da conta?')) { localStorage.removeItem('causa_user'); window.location.reload(); } }} 
                className="w-full flex items-center p-6 bg-red-50 dark:bg-red-500/10 rounded-[32px] gap-4 text-red-600 border border-red-100 dark:border-red-500/20 active:scale-95 transition-transform shadow-lg"
              >
                <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center"><span className="material-symbols-outlined">logout</span></div>
                <div className="flex-1 text-left font-black text-xs uppercase tracking-widest italic leading-none">Desconectar</div>
              </button>
            </div>
          </div>
        )}

        {currentTab === 'register' && <RegistrationForm onRegister={handleRegister} onCancel={() => setCurrentTab('mural')} isSubmitting={submitting} />}
      </main>

      {/* Rest of the modals (Password, Edit Profile, Admin Panel) remain exactly the same as before */}
      {/* ... (omitidos por brevidade mas permanecem no código final) */}
      
      {/* MODAL DE SENHA CUSTOMIZADO */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[250] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in">
          <div className="w-full max-w-xs bg-white dark:bg-zinc-900 rounded-[40px] p-8 shadow-2xl border border-white/10 flex flex-col items-center">
             <div className="size-16 rounded-2xl bg-primary flex items-center justify-center text-black mb-6">
                <span className="material-symbols-outlined text-3xl font-black">lock_open</span>
             </div>
             <h3 className="text-xl font-black uppercase italic tracking-tighter mb-2 text-center">Área Restrita</h3>
             <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6 text-center italic">Digite a senha administrativa</p>
             
             <form onSubmit={handleAdminAuth} className="w-full flex flex-col gap-4">
                <input 
                  autoFocus
                  type="password"
                  placeholder="Senha"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full h-14 bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-center font-black text-xl tracking-[0.5em] outline-none border-2 border-transparent focus:border-primary transition-all"
                />
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button type="button" onClick={() => { setShowPasswordModal(false); setAdminPassword(''); }} className="h-14 bg-zinc-100 dark:bg-zinc-800 rounded-2xl font-black text-[10px] uppercase tracking-widest italic">Cancelar</button>
                  <button type="submit" className="h-14 bg-primary text-black rounded-2xl font-black text-[10px] uppercase tracking-widest italic">Acessar</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR PERFIL */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-[200] bg-background-light dark:bg-background-dark overflow-y-auto animate-in slide-in-from-bottom-10 p-6">
           <header className="flex items-center justify-between mb-8 pt-6">
             <h2 className="text-3xl font-black uppercase italic tracking-tighter">Editar Perfil</h2>
             <button onClick={() => setIsEditingProfile(false)} className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-2xl flex items-center justify-center"><span className="material-symbols-outlined">close</span></button>
           </header>
           
           <form onSubmit={handleUpdateProfile} className="flex flex-col gap-6">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-2xl mb-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-yellow-700 dark:text-yellow-400 italic">Identidade Fixa</p>
                <p className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 leading-tight mt-1">Sua identidade na Vibe Teen é única. O nome não pode ser alterado após o cadastro.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[8px] font-black uppercase tracking-widest text-zinc-400 ml-2">Nome</label>
                  <input
                    type="text"
                    value={editFirstName}
                    readOnly
                    className="w-full h-16 px-6 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl border-0 ring-1 ring-zinc-200 dark:ring-white/10 text-lg font-bold outline-none shadow-none opacity-60 cursor-not-allowed"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[8px] font-black uppercase tracking-widest text-zinc-400 ml-2">Sobrenome</label>
                  <input
                    type="text"
                    value={editLastName}
                    readOnly
                    className="w-full h-16 px-6 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl border-0 ring-1 ring-zinc-200 dark:ring-white/10 text-lg font-bold outline-none shadow-none opacity-60 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="p-5 bg-zinc-100 dark:bg-zinc-800/50 rounded-3xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 ml-1 italic">Mudar Cor do Perfil</p>
                <div className="flex justify-between items-center px-1">
                  {AVATAR_COLORS.map(c => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setEditColor(c.hex)}
                      className={`size-10 rounded-full border-4 transition-all ${editColor === c.hex ? 'border-white dark:border-zinc-700 scale-125 shadow-xl ring-2 ring-primary' : 'border-transparent opacity-40 hover:opacity-100'}`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>

              <button type="submit" disabled={submitting} className="w-full h-16 bg-primary text-black font-black rounded-2xl uppercase tracking-widest text-xs active:scale-95 transition-all shadow-xl mt-4">
                {submitting ? 'Salvando...' : 'Salvar Novo Estilo'}
              </button>
           </form>
        </div>
      )}

      {/* PAINEL ADMIN MODAL */}
      {showAdminPanel && (
        <div className="fixed inset-0 z-[200] bg-background-light dark:bg-background-dark overflow-y-auto animate-in slide-in-from-bottom-10">
          <header className="p-6 pt-12 flex flex-col gap-6 sticky top-0 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md z-20 border-b border-black/5 dark:border-white/5">
             <div className="flex items-center justify-between">
               <h2 className="text-2xl font-black uppercase italic tracking-tighter">Gerenciamento ADM</h2>
               <button onClick={() => setShowAdminPanel(false)} className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-2xl flex items-center justify-center"><span className="material-symbols-outlined">close</span></button>
             </div>
             
             <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl">
               <button 
                onClick={() => setAdminTab('users')}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${adminTab === 'users' ? 'bg-white dark:bg-zinc-800 text-black dark:text-primary shadow-sm' : 'text-zinc-400'}`}
               >
                 Usuários
               </button>
               <button 
                onClick={() => setAdminTab('actions')}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${adminTab === 'actions' ? 'bg-white dark:bg-zinc-800 text-black dark:text-primary shadow-sm' : 'text-zinc-400'}`}
               >
                 Ações Mural
               </button>
             </div>
          </header>

          <div className="p-4 flex flex-col gap-4 pb-20">
            {isAdminLoading && (
              <div className="flex flex-col items-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-widest italic text-zinc-500">Sincronizando Banco...</p>
              </div>
            )}

            {!isAdminLoading && adminTab === 'users' && (
              <>
                {adminUsers.length === 0 && <p className="text-center text-zinc-500 py-10 uppercase font-black text-[10px] tracking-widest italic">Vazio...</p>}
                {adminUsers.map(u => (
                  <div key={u.email} className="p-5 bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-100 dark:border-white/5 shadow-xl flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-2xl flex items-center justify-center text-white font-black shrink-0" style={{ backgroundColor: u.avatarColor }}>
                        {u.firstName[0]}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-black text-lg tracking-tight uppercase truncate italic">{u.firstName} {u.lastName}</p>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase truncate">{u.email}</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteUser(u.email)}
                        className="size-10 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
                      >
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>
                    <div className="flex gap-2">
                      {(['Líder', 'Membro', 'Visitante'] as UserStatus[]).map(status => (
                        <button 
                          key={status} 
                          onClick={() => handleChangeStatus(u.email, status)}
                          className={`flex-1 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${u.status === status ? 'bg-primary text-black' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}

            {!isAdminLoading && adminTab === 'actions' && (
              <>
                {actions.length === 0 && <p className="text-center text-zinc-500 py-10 uppercase font-black text-[10px] tracking-widest italic">Nenhuma ação registrada</p>}
                {actions.map(a => (
                  <div key={a.id} className="p-5 bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-100 dark:border-white/5 shadow-xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 ${ACTION_CONFIG[a.action].lightBg} ${ACTION_CONFIG[a.action].darkBg} ${ACTION_CONFIG[a.action].textColor}`}>
                      <span className="material-symbols-outlined text-2xl">{ACTION_CONFIG[a.action].icon}</span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-black text-xs uppercase tracking-tight italic leading-none mb-1">Impacto de {a.userName}</p>
                      <p className="text-[14px] font-black uppercase tracking-tighter text-primary-dark dark:text-primary truncate italic">{a.friendName}</p>
                      <p className="text-[8px] text-zinc-400 font-bold uppercase mt-1">{formatDate(a.timestamp)}</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteAction(a.id)}
                      className="size-10 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {currentTab !== 'register' && !showAdminPanel && !isEditingProfile && !showPasswordModal && (
        <button onClick={() => setCurrentTab('register')} className="fixed bottom-28 right-6 w-16 h-16 rounded-[24px] bg-primary text-black shadow-2xl flex items-center justify-center z-50 animate-float active:scale-90 transition-all border-4 border-white dark:border-zinc-800">
          <span className="material-symbols-outlined text-3xl font-black">add</span>
        </button>
      )}

      {selectedAction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-sm bg-white dark:bg-zinc-900 rounded-[48px] p-8 shadow-2xl flex flex-col items-center text-center border border-white/10 animate-in zoom-in-95">
            <div className={`size-28 rounded-[32px] ${ACTION_CONFIG[selectedAction.action].lightBg} ${ACTION_CONFIG[selectedAction.action].darkBg} flex items-center justify-center ${ACTION_CONFIG[selectedAction.action].textColor} mb-8 shadow-inner ring-4 ring-primary/20`}>
              <span className="material-symbols-outlined text-6xl">{ACTION_CONFIG[selectedAction.action].icon}</span>
            </div>
            <h3 className="text-3xl font-black mb-2 uppercase tracking-tighter italic leading-none">{ACTION_CONFIG[selectedAction.action].label}</h3>
            <p className="text-zinc-500 font-bold text-[10px] mb-4 uppercase tracking-[0.1em] italic">Registrado por {selectedAction.userName} em {formatDate(selectedAction.timestamp)}</p>
            <div className="w-full p-8 bg-zinc-50 dark:bg-white/5 rounded-[32px] mb-8 text-center border border-zinc-100 dark:border-white/5">
              <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-3 italic">Impacto gerado em:</p>
              <p className="text-3xl font-black text-primary-dark dark:text-primary tracking-tighter uppercase italic leading-none">{selectedAction.friendName}</p>
            </div>
            <p className="text-sm font-bold text-zinc-600 dark:text-zinc-300 italic mb-10 max-w-[260px] leading-relaxed">"{BIBLICAL_VERSES[selectedAction.action]}"</p>
            <button onClick={() => setSelectedAction(null)} className="w-full py-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black rounded-[24px] uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all italic">Fechar</button>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default App;
