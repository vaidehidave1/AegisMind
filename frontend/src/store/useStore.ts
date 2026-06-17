import { create } from 'zustand';
import { API_BASE_URL } from '../lib/api';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IntentType = 'General Inquiry' | 'Technical Help' | 'Unsafe Request' | 'Prompt Injection';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  intent?: IntentType;
  riskLevel?: RiskLevel;
  guardrails?: string[];
  safetyExplanation?: string;
  jsonRaw?: string;
}

// Generate a random session ID like "SN-A3F7"
function generateSessionId(): string {
  const hex = Math.random().toString(16).substring(2, 6).toUpperCase();
  return `SN-${hex}`;
}

export interface UserProfile {
  username: string;
  profilePic: string;
  token: string;
}

interface AppState {
  currentUser: UserProfile | null;
  messages: ChatMessage[];
  isProcessing: boolean;
  activeWorkflowStep: string | null;
  systemStatus: 'SECURE' | 'THREAT_DETECTED';
  stats: {
    safeQueries: number;
    blockedAttempts: number;
    injectionAttempts: number;
  };
  activeTab: 'Chat' | 'Threat Center' | 'Prompt Logs' | 'Analytics' | 'Documentation' | 'Settings' | 'Admin';
  geminiApiKey: string;
  groqApiKey: string;
  sessionId: string;
  pendingPrompt: string;
  setCurrentUser: (user: UserProfile | null) => void;
  loadHistory: () => Promise<void>;
  addMessage: (msg: ChatMessage) => void;
  clearMessages: () => void;
  setProcessing: (status: boolean) => void;
  setWorkflowStep: (step: string | null) => void;
  setSystemStatus: (status: 'SECURE' | 'THREAT_DETECTED') => void;
  incrementStat: (stat: keyof AppState['stats']) => void;
  setActiveTab: (tab: AppState['activeTab']) => void;
  setGeminiApiKey: (key: string) => void;
  setGroqApiKey: (key: string) => void;
  setPendingPrompt: (prompt: string) => void;
}

const getStoredUser = (): UserProfile | null => {
  const stored = localStorage.getItem('sentinel_user');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
};

export const useStore = create<AppState>((set, get) => ({
  currentUser: getStoredUser(),
  messages: [],
  isProcessing: false,
  activeWorkflowStep: null,
  systemStatus: 'SECURE',
  stats: {
    safeQueries: 0,
    blockedAttempts: 0,
    injectionAttempts: 0,
  },
  activeTab: 'Chat',
  geminiApiKey: localStorage.getItem('sentinel_gemini_api_key') || '',
  groqApiKey: localStorage.getItem('sentinel_groq_api_key') || '',
  sessionId: generateSessionId(),
  pendingPrompt: '',
  setCurrentUser: (user) => {
    if (user) {
      localStorage.setItem('sentinel_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sentinel_user');
    }
    set({ currentUser: user });
  },
  loadHistory: async () => {
    const user = get().currentUser;
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/chat/history`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (res.ok) {
        const historyData = await res.json();
        // Convert ISO string timestamps back to Date objects
        const formatted = historyData.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
        set({ messages: formatted });
      }
    } catch (err) {
      console.error("Failed to load chat history:", err);
    }
  },
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  clearMessages: () => set({ messages: [] }),
  setProcessing: (status) => set({ isProcessing: status }),
  setWorkflowStep: (step) => set({ activeWorkflowStep: step }),
  setSystemStatus: (status) => set({ systemStatus: status }),
  incrementStat: (stat) => set((state) => ({ 
    stats: { ...state.stats, [stat]: state.stats[stat] + 1 } 
  })),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setGeminiApiKey: (key) => {
    localStorage.setItem('sentinel_gemini_api_key', key);
    set({ geminiApiKey: key });
  },
  setGroqApiKey: (key) => {
    localStorage.setItem('sentinel_groq_api_key', key);
    set({ groqApiKey: key });
  },
  setPendingPrompt: (prompt) => set({ pendingPrompt: prompt }),
}));
