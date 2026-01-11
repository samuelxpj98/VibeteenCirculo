
export enum ActionType {
  OREI = 'orei',
  CUIDEI = 'cuidei',
  COMPARTILHEI = 'compartilhei'
}

export type UserStatus = 'Líder' | 'Membro' | 'Visitante';

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  avatarColor: string;
  church?: 'Vibe' | 'Outra Igreja';
  role?: 'user' | 'admin';
  status?: UserStatus;
  pin?: string;
  isGuest?: boolean;
}

export interface CauseAction {
  id: string;
  userName: string;
  friendName: string;
  action: ActionType;
  timestamp: string;
  userColor?: string;
}

export interface PrayerRequest {
  id: string;
  userId: string; // email ou id unico
  userName: string;
  content: string;
  timestamp: string;
  userColor: string;
}

export interface ContentItem {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  category: 'EXPRESSO' | 'APROFUNDAR' | 'MISSAO';
  timestamp: number;
}

export type Tab = 'mural' | 'rank' | 'profile' | 'register';
