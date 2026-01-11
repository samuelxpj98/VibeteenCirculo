
import React, { useState } from 'react';
import { User } from '../types.ts';
import { findUserByEmail, saveOrUpdateUser } from '../services/apiService.ts';
import { AVATAR_COLORS } from '../constants.tsx';

interface WelcomeScreenProps {
  onComplete: (user: User) => void;
}

type Step = 'choice' | 'login-email' | 'login-pin' | 'signup-names' | 'signup-church' | 'signup-email' | 'signup-pin' | 'signup-avatar';

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState<Step>('choice');
  
  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [church, setChurch] = useState<'Vibe' | 'Outra Igreja'>('Vibe');
  const [email, setEmail] = useState(''); // Mantemos o nome da variável 'email' para compatibilidade com o backend, mas funciona como 'login'
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0].hex);
  const [pin, setPin] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [tempUser, setTempUser] = useState<User | null>(null);

  // --- HANDLERS ---

  const handleVisitor = () => {
    const guestUser: User = {
      firstName: 'Visitante',
      lastName: '',
      email: 'visitante@vibe.teen',
      avatarColor: '#888888',
      status: 'Visitante',
      isGuest: true
    };
    onComplete(guestUser);
  };

  const checkEmailForLogin = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const user = await findUserByEmail(email.trim());
      if (user) {
        setTempUser(user);
        setPin(''); // Reset pin for entry
        setStep('login-pin');
      } else {
        alert('Login não encontrado. Crie sua conta!');
        setStep('signup-names'); // Redirect to signup
      }
    } catch (err) {
      alert("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  const verifyPinAndLogin = () => {
    if (tempUser && tempUser.pin === pin) {
      onComplete(tempUser);
    } else {
      alert("Senha incorreta!");
      setPin('');
    }
  };

  const handleSignupComplete = async () => {
    if (pin.length < 4) {
      alert("A senha precisa de 4 números.");
      return;
    }
    
    setLoading(true);
    try {
      const newUser: User = { 
        firstName, 
        lastName, 
        email: email.toLowerCase().trim(), 
        avatarColor, 
        church,
        pin,
        status: 'Membro',
        isGuest: false
      };
      await saveOrUpdateUser(newUser);
      onComplete(newUser);
    } catch (err) {
      alert("Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  };

  // --- KEYPAD COMPONENT ---
  const Keypad = ({ value, onChange, onEnter, label }: { value: string, onChange: (v: string) => void, onEnter: () => void, label: string }) => {
    const handleNum = (num: string) => {
      if (value.length < 4) onChange(value + num);
    };
    const handleDel = () => onChange(value.slice(0, -1));

    return (
      <div className="flex flex-col items-center w-full animate-in slide-in-from-bottom-10">
        <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px] mb-6 italic">{label}</p>
        
        <div className="flex gap-4 mb-8">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`size-4 rounded-full transition-all ${value.length > i ? 'bg-primary scale-110 shadow-[0_0_10px_#f9f506]' : 'bg-zinc-300 dark:bg-zinc-800'}`}></div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button 
              key={num} 
              onClick={() => handleNum(num.toString())} 
              className="h-16 rounded-2xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-2xl font-black text-zinc-900 dark:text-white active:scale-95 transition-all shadow-lg border border-white/5"
            >
              {num}
            </button>
          ))}
          <div className="flex items-center justify-center"></div>
          <button 
            onClick={() => handleNum('0')} 
            className="h-16 rounded-2xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-2xl font-black text-zinc-900 dark:text-white active:scale-95 transition-all shadow-lg border border-white/5"
          >
            0
          </button>
          <button 
            onClick={handleDel} 
            className="h-16 rounded-2xl bg-red-100 dark:bg-red-500/10 hover:bg-red-200 dark:hover:bg-red-500/20 text-red-600 dark:text-red-500 flex items-center justify-center active:scale-95 transition-all shadow-lg border border-white/5"
          >
            <span className="material-symbols-outlined">backspace</span>
          </button>
        </div>

        <button 
          onClick={onEnter} 
          disabled={value.length < 4}
          className={`w-full max-w-[280px] mt-6 h-14 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${value.length === 4 ? 'bg-primary text-black shadow-xl active:scale-95' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'}`}
        >
          {loading ? 'Processando...' : 'Confirmar'}
        </button>
      </div>
    );
  };

  // --- RENDER ---
  return (
    <div className="fixed inset-0 z-[100] bg-background-light dark:bg-background-dark flex flex-col items-center justify-center p-6 text-[#1c1c1c] dark:text-white overflow-y-auto no-scrollbar">
      
      {/* Header Fixo */}
      <div className="flex flex-col items-center text-center mb-8 shrink-0">
        <h1 className="text-4xl font-black tracking-tighter leading-none uppercase italic animate-in fade-in slide-in-from-top-4 text-center">
          VIBE <br/><span className="text-primary-dark dark:text-primary">TEEN</span>
        </h1>
      </div>

      <main className="w-full max-w-[340px] flex flex-col items-center">
        
        {/* STEP: CHOICE */}
        {step === 'choice' && (
          <div className="w-full flex flex-col gap-4 animate-in slide-in-from-bottom-8">
            <button onClick={() => setStep('login-email')} className="w-full h-16 bg-[#1c1c1c] dark:bg-zinc-800 text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-between px-6 active:scale-95 transition-all border border-white/5">
              <span>Já tenho login</span>
              <span className="material-symbols-outlined">login</span>
            </button>
            <button onClick={() => setStep('signup-names')} className="w-full h-16 bg-primary text-black font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-between px-6 active:scale-95 transition-all shadow-xl shadow-primary/20 hover:brightness-110">
              <span>Criar Login</span>
              <span className="material-symbols-outlined">person_add</span>
            </button>
            <div className="relative py-2">
               <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-200 dark:border-white/5"></div></div>
               <div className="relative flex justify-center text-[10px] uppercase font-black italic"><span className="bg-background-light dark:bg-background-dark px-2 text-zinc-500">Ou</span></div>
            </div>
            <button onClick={handleVisitor} className="w-full h-14 bg-transparent border-2 border-zinc-200 dark:border-zinc-800 text-zinc-400 font-black text-[10px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-600 dark:hover:text-zinc-300">
              <span className="material-symbols-outlined text-lg">visibility</span>
              <span>Entrar como Visitante</span>
            </button>
          </div>
        )}

        {/* LOGIN FLOW */}
        {step === 'login-email' && (
          <div className="w-full animate-in slide-in-from-right-8">
            <p className="text-left text-zinc-500 font-black uppercase text-[10px] tracking-widest mb-2 italic">Seu Login</p>
            <div className="relative mb-6">
              <input
                type="text"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Usuário, email ou apelido"
                className="w-full h-16 px-6 bg-white dark:bg-zinc-900 rounded-2xl border-0 ring-1 ring-zinc-200 dark:ring-white/10 focus:ring-2 focus:ring-primary text-lg font-bold outline-none shadow-sm"
              />
            </div>
            <button onClick={checkEmailForLogin} disabled={loading || !email.trim()} className="w-full h-16 bg-[#1c1c1c] dark:bg-white text-white dark:text-black font-black rounded-2xl uppercase tracking-widest text-xs active:scale-95 transition-all shadow-xl disabled:opacity-50">
              {loading ? 'Buscando...' : 'Continuar'}
            </button>
            <button onClick={() => setStep('choice')} className="w-full py-4 text-zinc-400 font-black text-[10px] uppercase tracking-widest italic">Voltar</button>
          </div>
        )}

        {step === 'login-pin' && (
          <Keypad 
            value={pin} 
            onChange={setPin} 
            onEnter={verifyPinAndLogin} 
            label={`Olá, ${tempUser?.firstName}! Digite sua senha.`} 
          />
        )}

        {/* SIGNUP FLOW */}
        {step === 'signup-names' && (
          <div className="w-full animate-in slide-in-from-right-8">
            <h3 className="text-xl font-black uppercase italic tracking-tighter mb-6 text-center">Quem é você?</h3>
            <div className="flex flex-col gap-4 mb-6">
              <input
                type="text"
                placeholder="Nome"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full h-16 px-6 bg-white dark:bg-zinc-900 rounded-2xl border-0 ring-1 ring-zinc-200 dark:ring-white/10 text-lg font-bold outline-none shadow-sm"
              />
              <input
                type="text"
                placeholder="Sobrenome"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full h-16 px-6 bg-white dark:bg-zinc-900 rounded-2xl border-0 ring-1 ring-zinc-200 dark:ring-white/10 text-lg font-bold outline-none shadow-sm"
              />
            </div>
            <button 
              onClick={() => { if(firstName && lastName) setStep('signup-church'); }} 
              disabled={!firstName || !lastName}
              className="w-full h-16 bg-primary text-black font-black rounded-2xl uppercase tracking-widest text-xs active:scale-95 transition-all shadow-xl disabled:opacity-50 disabled:scale-100 hover:brightness-110"
            >
              Próximo
            </button>
            <button onClick={() => setStep('choice')} className="w-full py-4 text-zinc-400 font-black text-[10px] uppercase tracking-widest italic">Cancelar</button>
          </div>
        )}

        {step === 'signup-church' && (
          <div className="w-full animate-in slide-in-from-right-8">
            <h3 className="text-xl font-black uppercase italic tracking-tighter mb-6 text-center">Sua Igreja</h3>
            <div className="flex flex-col gap-4 mb-8">
              <button 
                onClick={() => setChurch('Vibe')}
                className={`h-20 rounded-2xl border-2 flex items-center px-6 gap-4 transition-all ${church === 'Vibe' ? 'border-primary bg-primary/10' : 'border-zinc-200 dark:border-zinc-800 bg-transparent opacity-60'}`}
              >
                <div className="size-10 rounded-full bg-primary flex items-center justify-center text-black font-black"><span className="material-symbols-outlined">bolt</span></div>
                <div className="text-left">
                  <p className="font-black uppercase italic text-lg">Vibe Teen</p>
                  <p className="text-[10px] font-bold uppercase text-zinc-500">Membro da casa</p>
                </div>
              </button>
              
              <button 
                onClick={() => setChurch('Outra Igreja')}
                className={`h-20 rounded-2xl border-2 flex items-center px-6 gap-4 transition-all ${church === 'Outra Igreja' ? 'border-action-blue bg-action-blue/10' : 'border-zinc-200 dark:border-zinc-800 bg-transparent opacity-60'}`}
              >
                <div className="size-10 rounded-full bg-action-blue flex items-center justify-center text-black font-black"><span className="material-symbols-outlined">church</span></div>
                <div className="text-left">
                  <p className="font-black uppercase italic text-lg">Outra Igreja</p>
                  <p className="text-[10px] font-bold uppercase text-zinc-500">Visitante de honra</p>
                </div>
              </button>
            </div>
            <button onClick={() => setStep('signup-email')} className="w-full h-16 bg-white dark:bg-zinc-800 text-black dark:text-white font-black rounded-2xl uppercase tracking-widest text-xs active:scale-95 transition-all shadow-lg border border-zinc-200 dark:border-white/5">
              Continuar
            </button>
            <button onClick={() => setStep('signup-names')} className="w-full py-4 text-zinc-400 font-black text-[10px] uppercase tracking-widest italic">Voltar</button>
          </div>
        )}

        {step === 'signup-email' && (
          <div className="w-full animate-in slide-in-from-right-8">
            <h3 className="text-xl font-black uppercase italic tracking-tighter mb-2 text-center">Seu Login</h3>
            <p className="text-center text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-6">Crie um usuário único para entrar</p>
            <div className="relative mb-6">
              <input
                type="text"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: pedro123 ou seu e-mail"
                className="w-full h-16 px-6 bg-white dark:bg-zinc-900 rounded-2xl border-0 ring-1 ring-zinc-200 dark:ring-white/10 focus:ring-2 focus:ring-primary text-lg font-bold outline-none shadow-sm"
              />
            </div>
            <button 
              onClick={() => { if(email.trim().length > 0) setStep('signup-avatar'); }} 
              disabled={email.trim().length === 0}
              className="w-full h-16 bg-primary text-black font-black rounded-2xl uppercase tracking-widest text-xs active:scale-95 transition-all shadow-xl disabled:opacity-50 hover:brightness-110"
            >
              Próximo
            </button>
            <button onClick={() => setStep('signup-church')} className="w-full py-4 text-zinc-400 font-black text-[10px] uppercase tracking-widest italic">Voltar</button>
          </div>
        )}

        {step === 'signup-avatar' && (
           <div className="w-full animate-in slide-in-from-right-8">
             <h3 className="text-xl font-black uppercase italic tracking-tighter mb-6 text-center">Sua Cor</h3>
             <div className="grid grid-cols-3 gap-4 mb-8">
                {AVATAR_COLORS.map(c => (
                  <button
                    key={c.hex}
                    onClick={() => setAvatarColor(c.hex)}
                    className={`aspect-square rounded-2xl border-4 transition-all flex items-center justify-center ${avatarColor === c.hex ? 'border-white dark:border-zinc-700 scale-110 shadow-xl ring-2 ring-primary' : 'border-transparent opacity-40 hover:opacity-100 bg-white/5'}`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {avatarColor === c.hex && <span className="material-symbols-outlined text-white mix-blend-difference font-black">check</span>}
                  </button>
                ))}
             </div>
             <button onClick={() => setStep('signup-pin')} className="w-full h-16 bg-white dark:bg-zinc-800 text-black dark:text-white font-black rounded-2xl uppercase tracking-widest text-xs active:scale-95 transition-all shadow-lg border border-zinc-200 dark:border-white/5">
               Escolher Senha
             </button>
           </div>
        )}

        {step === 'signup-pin' && (
          <Keypad 
            value={pin} 
            onChange={setPin} 
            onEnter={handleSignupComplete} 
            label="Crie uma senha de 4 números" 
          />
        )}

      </main>
    </div>
  );
};
