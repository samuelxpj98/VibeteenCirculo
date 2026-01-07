
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// Log para debug no console do navegador caso algo falhe
console.log("VIBE TEEN: Iniciando aplicação...");

const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
  } catch (err) {
    console.error("VIBE TEEN: Erro Crítico de Renderização", err);
    rootElement.innerHTML = `<div style="padding: 20px; color: red; font-family: sans-serif;">
      <h2>Erro ao carregar App</h2>
      <p>${err.message}</p>
      <button onclick="localStorage.clear(); location.reload();">Resetar App</button>
    </div>`;
  }
}
