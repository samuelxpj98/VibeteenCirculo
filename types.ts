
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
  church?: string;
  role?: 'user' | 'admin';
  status?: UserStatus; // Novo campo para o título de verificado
}

export interface CauseAction {
  id: string;
  userName: string;
  friendName: string;
  action: ActionType;
  timestamp: string;
  userColor?: string;
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
