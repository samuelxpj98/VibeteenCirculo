
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CauseAction, ActionType } from '../types';
import { ACTION_CONFIG } from '../constants';

interface ProjectionModeProps {
  actions: CauseAction[];
  onClose: () => void;
}

const THEOLOGIAN_QUOTES = [
  { text: "A oração não muda Deus, mas muda quem ora.", author: "C.S. Lewis" },
  { text: "Pregue o Evangelho em todo tempo. Se necessário, use palavras.", author: "São Francisco de Assis" },
  { text: "Deus não nos chama para sermos bem-sucedidos, mas para sermos fiéis.", author: "Madre Teresa" },
  { text: "A igreja existe para nada mais senão levar os homens a Cristo.", author: "C.S. Lewis" },
  { text: "Um pouco de amor em ação vale mais do que toneladas de teoria.", author: "Charles Spurgeon" },
  { text: "Se você não tem o desejo de que outros sejam salvos, você mesmo não é salvo.", author: "Charles Spurgeon" },
  { text: "Deus usa pessoas comuns para realizar coisas extraordinárias.", author: "D.L. Moody" }
];

const KINGDOM_INSIGHTS = [
  { title: "Pequenas Sementes", text: "Cada oração feita em segredo é uma semente de eternidade plantada no coração de um amigo." },
  { title: "O Reino é Agora", text: "Cuidar de alguém não é apenas um gesto gentil, é o Reino de Deus se manifestando na terra." },
  { title: "Luz no Escuro", text: "Compartilhar sua fé é acender uma lâmpada em um quarto escuro. O impacto é imediato." },
  { title: "Influência Eterna", text: "Nós não vemos os frutos de tudo o que plantamos hoje, mas o céu registra cada ato de amor." }
];

const VERSES = [
  { text: "Pedi, e dar-se-vos-á; buscai, e encontrareis; batei, e abrir-se-vos-á.", ref: "Mateus 7:7" },
  { text: "Orai uns pelos outros, para que sareis.", ref: "Tiago 5:16" },
  { text: "Nisto todos conhecerão que sois meus discípulos, se vos amardes uns aos outros.", ref: "João 13:35" },
  { text: "Vós sois o sal da terra e a luz do mundo.", ref: "Mateus 5:13-14" }
];

type SlideType = 'stats' | 'recent_activity' | 'theologian' | 'kingdom' | 'verse';

export const ProjectionMode: React.FC<ProjectionModeProps> = ({ actions, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Definimos a sequência de slides para a apresentação
  const slides = useMemo(() => {
    const totalStats = {
      orei: actions.filter(a => a.action === ActionType.OREI).length,
      cuidei: actions.filter(a => a.action === ActionType.CUIDEI).length,
      compartilhei: actions.filter(a => a.action === ActionType.COMPARTILHEI).length,
    };

    const presentation: { type: SlideType; data: any }[] = [
      { type: 'stats', data: totalStats },
      { type: 'kingdom', data: KINGDOM_INSIGHTS[0] },
      { type: 'recent_activity', data: actions.slice(0, 5) }, // Últimas 5 sem nomes
      { type: 'theologian', data: THEOLOGIAN_QUOTES[0] },
      { type: 'verse', data: VERSES[0] },
      { type: 'kingdom', data: KINGDOM_INSIGHTS[1] },
      { type: 'theologian', data: THEOLOGIAN_QUOTES[1] },
      { type: 'verse', data: VERSES[1] },
      { type: 'kingdom', data: KINGDOM_INSIGHTS[2] },
      { type: 'theologian', data: THEOLOGIAN_QUOTES[2] },
      { type: 'verse', data: VERSES[2] }
    ];

    return presentation;
  }, [actions]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextSlide, 8000); // 8 segundos por slide
    return () => clearInterval(timer);
  }, [nextSlide, isPaused]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, onClose]);

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-[300] bg-[#050505] text-white flex flex-col items-center justify-center p-12 overflow-hidden select-none cursor-none">
      {/* Background Animated Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] size-[800px] bg-primary/10 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] size-[800px] bg-blue-500/5 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Header Fixo */}
      <header className="absolute top-12 left-12 right-12 flex items-center justify-between z-50">
        <div className="flex items-center gap-6">
          <div className="size-20 rounded-3xl bg-primary flex items-center justify-center text-black shadow-2xl rotate-3">
            <span className="material-symbols-outlined text-5xl font-black">all_inclusive</span>
          </div>
          <div>
            <h2 className="text-5xl font-black tracking-tighter italic uppercase leading-none">VIBE TEEN</h2>
            <p className="text-primary font-black uppercase tracking-[0.5em] text-sm mt-2">Círculo da Causa • Modo Celebração</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsPaused(!isPaused)} 
            className="size-16 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all group pointer-events-auto"
          >
            <span className="material-symbols-outlined text-3xl text-zinc-500 group-hover:text-white">
              {isPaused ? 'play_arrow' : 'pause'}
            </span>
          </button>
          <button onClick={onClose} className="size-16 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all group pointer-events-auto">
            <span className="material-symbols-outlined text-3xl text-zinc-500 group-hover:text-white">close_fullscreen</span>
          </button>
        </div>
      </header>

      {/* Main Slide Area */}
      <main className="relative z-10 w-full max-w-7xl flex flex-col items-center justify-center min-h-[60vh]">
        
        {/* Slide: Estatísticas Gerais */}
        {slide.type === 'stats' && (
          <div className="w-full grid grid-cols-3 gap-16 animate-in slide-in-from-bottom-20 fade-in duration-1000">
             <div className="flex flex-col items-center p-16 bg-white/5 rounded-[80px] border border-white/10 backdrop-blur-sm">
                <span className="material-symbols-outlined text-8xl text-blue-400 mb-8">volunteer_activism</span>
                <span className="text-[10rem] font-black italic tracking-tighter leading-none">{slide.data.orei}</span>
                <span className="text-2xl font-black uppercase tracking-[0.4em] text-zinc-500 mt-6">Orações Realizadas</span>
             </div>
             <div className="flex flex-col items-center p-16 bg-primary/10 rounded-[80px] border-4 border-primary/20 scale-110 shadow-[0_0_150px_rgba(249,245,6,0.1)] backdrop-blur-md">
                <span className="material-symbols-outlined text-8xl text-primary mb-8">spa</span>
                <span className="text-[10rem] font-black italic tracking-tighter text-primary leading-none">{slide.data.cuidei}</span>
                <span className="text-2xl font-black uppercase tracking-[0.4em] text-primary mt-6">Vidas Cuidadas</span>
             </div>
             <div className="flex flex-col items-center p-16 bg-white/5 rounded-[80px] border border-white/10 backdrop-blur-sm">
                <span className="material-symbols-outlined text-8xl text-orange-500 mb-8">share</span>
                <span className="text-[10rem] font-black italic tracking-tighter leading-none">{slide.data.compartilhei}</span>
                <span className="text-2xl font-black uppercase tracking-[0.4em] text-zinc-500 mt-6">Fé Compartilhada</span>
             </div>
          </div>
        )}

        {/* Slide: Atividade Recente (Sem Nomes) */}
        {slide.type === 'recent_activity' && (
          <div className="w-full flex flex-col items-center animate-in zoom-in fade-in duration-1000">
            <h3 className="text-4xl font-black uppercase italic tracking-widest text-zinc-500 mb-16">Movimentos Recentes no Reino</h3>
            <div className="grid grid-cols-2 gap-8 w-full max-w-5xl">
              {(slide.data as CauseAction[]).map((a, i) => (
                <div key={i} className="flex items-center gap-8 p-8 bg-white/5 rounded-[40px] border border-white/10">
                  <div className={`size-24 rounded-3xl flex items-center justify-center ${ACTION_CONFIG[a.action].darkBg} ${ACTION_CONFIG[a.action].textColor}`}>
                    <span className="material-symbols-outlined text-5xl">{ACTION_CONFIG[a.action].icon}</span>
                  </div>
                  <div>
                    <p className="text-3xl font-black uppercase italic tracking-tighter leading-none mb-2">
                      Um Adolescente <span className={ACTION_CONFIG[a.action].textColor}>{ACTION_CONFIG[a.action].label}</span>
                    </p>
                    <p className="text-xl font-bold text-zinc-400 italic">Impacto real em uma vida preciosa</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Slide: Frases de Teólogos */}
        {slide.type === 'theologian' && (
          <div className="max-w-5xl text-center animate-in fade-in zoom-in duration-1000">
            <span className="material-symbols-outlined text-primary text-9xl mb-12 opacity-30">format_quote</span>
            <h2 className="text-7xl font-black italic leading-tight uppercase tracking-tighter mb-12 px-12">
              "{slide.data.text}"
            </h2>
            <div className="flex items-center justify-center gap-4">
               <div className="h-px w-16 bg-primary/40"></div>
               <p className="text-3xl font-black text-primary uppercase tracking-[0.3em] italic">{slide.data.author}</p>
               <div className="h-px w-16 bg-primary/40"></div>
            </div>
          </div>
        )}

        {/* Slide: Reino Insights */}
        {slide.type === 'kingdom' && (
          <div className="flex flex-col items-center text-center max-w-5xl animate-in slide-in-from-right-20 fade-in duration-1000">
            <div className="size-32 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center mb-12">
              <span className="material-symbols-outlined text-primary text-6xl">auto_awesome</span>
            </div>
            <h3 className="text-4xl font-black uppercase tracking-[0.5em] text-primary/60 italic mb-6">{slide.data.title}</h3>
            <p className="text-7xl font-black italic tracking-tighter leading-tight uppercase">
              {slide.data.text}
            </p>
          </div>
        )}

        {/* Slide: Versículos */}
        {slide.type === 'verse' && (
          <div className="max-w-4xl text-center animate-in fade-in slide-in-from-top-20 duration-1000">
            <span className="material-symbols-outlined text-blue-400 text-9xl mb-12 opacity-40">menu_book</span>
            <h2 className="text-6xl font-black italic leading-tight uppercase tracking-tighter mb-12 bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
              {slide.data.text}
            </h2>
            <p className="text-4xl font-black text-blue-400 uppercase tracking-[0.3em] italic">{slide.data.ref}</p>
          </div>
        )}
      </main>

      {/* Navegação Manual (Invisível no Mouse, mas funcional) */}
      <div className="absolute inset-y-0 left-0 w-32 flex items-center justify-center pointer-events-none group">
        <button 
          onClick={prevSlide}
          className="size-20 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-auto hover:bg-white/10"
        >
          <span className="material-symbols-outlined text-4xl">chevron_left</span>
        </button>
      </div>
      <div className="absolute inset-y-0 right-0 w-32 flex items-center justify-center pointer-events-none group">
        <button 
          onClick={nextSlide}
          className="size-20 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-auto hover:bg-white/10"
        >
          <span className="material-symbols-outlined text-4xl">chevron_right</span>
        </button>
      </div>

      {/* Footer Indicadores */}
      <footer className="absolute bottom-12 left-0 w-full px-12 flex justify-between items-end">
        <div className="text-zinc-600 font-black uppercase text-sm tracking-[0.6em] italic">
          Movimento de Fé • Simplicidade é Poder
        </div>
        <div className="flex gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2 transition-all duration-1000 rounded-full pointer-events-auto ${i === currentSlide ? 'w-16 bg-primary' : 'w-4 bg-white/10 hover:bg-white/20'}`}
            ></button>
          ))}
        </div>
      </footer>
    </div>
  );
};
