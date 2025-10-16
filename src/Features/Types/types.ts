// types/auth.ts
export interface User {
  id: string;
  fullName: string;
  email: string;
  password?:string;
currentPassword?:string
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

export interface ErrorResponse {
  data: {
    message: string;
  };
  status?: number;
}

export interface Activity {
  id: string;
  type: 'reminder' | 'quiz' | 'chat' | 'file';
  title: string;
  description: string;
  createdAt: string;
  // Type-specific fields
  datetime?: string;
  lastSeen?: string;
  topic?: string;
  source?: string;
  difficulty?: string;
  numQuestions?: number;
  messageCount?: number;
  originalName?: string;
  mimeType?: string;
  size?: number;
  url?: string;
}

export interface Question {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  answer: string;
  explanation: string;
  _id?: string;
}

export interface Quiz {
  _id: string;
  topic: string;
  source: string;
  difficulty: string;
  numQuestions: number;
  questions: Question[];
  userId: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface GenerateQuizRequest {
  topic: string;
  difficulty: string;
  numQuestions: number;
  file?: File;
}

export interface Chat {
  _id: string;
  title: string;
  messages: Message[];
  userId: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface Message {
  _id: string;
  content: string;
  sender: string;
  timestamp: string;
  file?: {
    originalName: string;
    url: string;
    mimeType: string;
  };
}

export interface CreateChatRequest {
  title: string;
}

export interface SendMessageRequest {
  chatId: string;
  message: string;
  file?: File;
}

export interface FileUpload {
  _id: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  secureUrl: string;
  publicId: string;
  resourceType: string;
  userId: string;
  createdAt: string;
  __v?: number;
}
