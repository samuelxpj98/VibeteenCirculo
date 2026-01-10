
import React, { useState } from 'react';
import { User } from '../types';
import { findUserByEmail, saveOrUpdateUser } from '../services/apiService';
import { AVATAR_COLORS } from '../constants';

interface WelcomeScreenProps {
  onComplete: (user: User) => void;
}

type ViewMode = 'choice' | 'login' | 'signup';

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  const [view, setView] = useState<ViewMode>('choice');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0].hex);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (firstName.trim() && lastName.trim() && email.trim()) {
      setLoading(true);
      try {
        const newUser: User = { 
          firstName, 
          lastName, 
          email: email.toLowerCase(), 
          avatarColor, 
          status: 'Visitante' 
        };
        await saveOrUpdateUser(newUser);
        onComplete(newUser);
      } catch (err) {
        alert("Erro ao criar conta.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setLoading(true);
      try {
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
          onComplete(existingUser);
        } else {
          alert('E-mail não encontrado. Crie sua conta!');
          setView('signup');
        }
      } catch (err) {
        alert("Erro ao entrar.");
      } finally {
        setLoading(false);
      }
    }
  };

  const appendGmail = () => {
    if (!email.includes('@')) {
      setEmail(prev => prev.trim() + '@gmail.com');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background-light dark:bg-background-dark flex flex-col items-center justify-center p-6 text-[#1c1c1c] dark:text-white">
      <main className="w-full max-w-[360px] flex flex-col gap-8 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-white dark:bg-zinc-900 rounded-[32px] flex items-center justify-center shadow-2xl border-4 border-white dark:border-zinc-800 mb-6">
            <span className="material-symbols-outlined text-[44px] text-primary-dark" style={{ fontVariationSettings: "'FILL' 1" }}>
              all_inclusive
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter leading-none mb-3 uppercase italic">
            Bem-vindo ao<br/>
            <span className="text-primary-dark uppercase">VIBE TEEN</span>
          </h1>
        </div>

        {view === 'choice' && (
          <div className="flex flex-col gap-4">
            <button onClick={() => setView('login')} className="w-full h-16 bg-[#1c1c1c] dark:bg-zinc-800 text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-between px-6 active:scale-95 transition-all">
              <span>Entrar</span>
              <span className="material-symbols-outlined">login</span>
            </button>
            <button onClick={() => setView('signup')} className="w-full h-16 bg-primary text-black font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-between px-6 active:scale-95 transition-all">
              <span>Criar Conta</span>
              <span className="material-symbols-outlined">person_add</span>
            </button>
          </div>
        )}

        {(view === 'login' || view === 'signup') && (
          <form onSubmit={view === 'login' ? handleLogin : handleSignup} className="flex flex-col gap-5">
            <div className="relative">
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-16 px-6 bg-white dark:bg-zinc-900 rounded-2xl border-0 ring-1 ring-zinc-200 dark:ring-white/10 focus:ring-2 focus:ring-primary text-lg font-bold outline-none shadow-sm"
                required
              />
              
              {email.length > 0 && !email.includes('@') && (
                <button
                  type="button"
                  onClick={appendGmail}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-primary/20 hover:bg-primary/40 text-zinc-600 dark:text-primary text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-primary/20 animate-in fade-in slide-in-from-right-2"
                >
                  + @gmail.com
                </button>
              )}
            </div>
            
            {view === 'signup' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Nome"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full h-16 px-6 bg-white dark:bg-zinc-900 rounded-2xl border-0 ring-1 ring-zinc-200 dark:ring-white/10 text-lg font-bold outline-none shadow-sm"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Sobrenome"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full h-16 px-6 bg-white dark:bg-zinc-900 rounded-2xl border-0 ring-1 ring-zinc-200 dark:ring-white/10 text-lg font-bold outline-none shadow-sm"
                    required
                  />
                </div>
                <div className="p-5 bg-zinc-100 dark:bg-zinc-800/50 rounded-3xl">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 ml-1 italic">Estilo da Conta</p>
                  <div className="flex justify-between items-center px-1">
                    {AVATAR_COLORS.map(c => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setAvatarColor(c.hex)}
                        className={`size-10 rounded-full border-4 transition-all ${avatarColor === c.hex ? 'border-white dark:border-zinc-700 scale-125 shadow-xl ring-2 ring-primary' : 'border-transparent opacity-40 hover:opacity-100'}`}
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            <button type="submit" disabled={loading} className="w-full h-16 bg-[#1c1c1c] dark:bg-primary dark:text-black text-white font-black rounded-2xl uppercase tracking-widest text-xs active:scale-95 transition-all shadow-xl">
              {loading ? 'Sincronizando...' : 'Concluir'}
            </button>
            <button type="button" onClick={() => setView('choice')} className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em] mt-2 italic">Voltar ao início</button>
          </form>
        )}
      </main>
    </div>
  );
};
