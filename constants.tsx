
import { ActionType } from './types.ts';

export const AVATAR_COLORS = [
  { name: 'Azul', hex: '#0084FF' },
  { name: 'Verde', hex: '#00F576' },
  { name: 'Laranja', hex: '#FF5E00' },
  { name: 'Roxo', hex: '#A855F7' },
  { name: 'Rosa', hex: '#EC4899' },
  { name: 'Amarelo', hex: '#f9f506' },
];

export const ACTION_CONFIG = {
  [ActionType.OREI]: {
    label: 'Orei',
    description: 'Clamei a Deus por esta vida.',
    color: 'bg-action-blue',
    icon: 'volunteer_activism',
    lightBg: 'bg-vibrant-blue-soft',
    darkBg: 'dark:bg-blue-500/10',
    textColor: 'text-vibrant-blue',
    darkTextColor: 'dark:text-blue-400'
  },
  [ActionType.CUIDEI]: {
    label: 'Cuidei',
    description: 'Demonstrei amor prático.',
    color: 'bg-action-green',
    icon: 'spa',
    lightBg: 'bg-vibrant-green-soft',
    darkBg: 'dark:bg-green-500/10',
    textColor: 'text-vibrant-green',
    darkTextColor: 'dark:text-green-400'
  },
  [ActionType.COMPARTILHEI]: {
    label: 'Compartilhei',
    description: 'Falei de Jesus.',
    color: 'bg-action-orange',
    icon: 'share',
    lightBg: 'bg-vibrant-orange-soft',
    darkBg: 'dark:bg-orange-500/10',
    textColor: 'text-vibrant-orange',
    darkTextColor: 'dark:text-orange-400'
  }
};

export const API_URL = '';
