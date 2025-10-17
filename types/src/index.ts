// Chat and Session Types
export interface ChatMessage {
  id: string;
  sessionId: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isCrisis?: boolean;
}

export interface ChatSession {
  id: string;
  userId?: string;
  consentGiven: boolean;
  consentTimestamp?: Date;
  createdAt: Date;
  lastActivity: Date;
}

export interface ChatRequest {
  sessionId: string;
  message: string;
}

export interface ChatResponse {
  success: boolean;
  message?: string;
  cards?: SupportCard[];
  error?: string;
}

// Support Card Types
export interface SupportCard {
  id: string;
  category: 'safety' | 'booking' | 'dropin' | 'resources' | 'general';
  title: string;
  summary: string;
  action?: string;
  when_where?: string;
  official_link: string;
  why_for_user: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface SafetyCard extends SupportCard {
  category: 'safety';
  emergency_contacts?: EmergencyContact[];
}

export interface EmergencyContact {
  name: string;
  number: string;
  description: string;
  available: string;
}

// Crisis Detection Types
export interface CrisisDetectionResult {
  isCrisis: boolean;
  keywords: string[];
  confidence: number;
  safetyCard?: SafetyCard;
}

// Ethical AI Types
export interface EthicalPillar {
  name: string;
  description: string;
  implementation: string;
}

export interface ConsentData {
  sessionId: string;
  consentGiven: boolean;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Watsonx Orchestrate Integration Types
export interface WXORequest {
  message: string;
  sessionId: string;
  context?: Record<string, any>;
}

export interface WXOResponse {
  response: string;
  cards?: SupportCard[];
  confidence?: number;
  metadata?: Record<string, any>;
}

// Tool/Flow Types
export interface EmailPreview {
  to: string;
  subject: string;
  body: string;
  template: string;
}

export interface CheckinPreview {
  message: string;
  suggestedActions: string[];
  followUpQuestions: string[];
}

// User and Session Management
export interface UserSession {
  id: string;
  sessionId: string;
  consentGiven: boolean;
  createdAt: Date;
  lastActivity: Date;
  messageCount: number;
  crisisDetected: boolean;
}

// Configuration Types
export interface AppConfig {
  wxoAgentUrl: string;
  capsWebsiteUrl: string;
  crisisKeywords: string[];
  moodKeywords: string[];
  maxSessionDuration: number;
  enableAnalytics: boolean;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

// Constants
export const CRISIS_KEYWORDS = [
  'suicidal',
  'harm',
  'panic',
  "can't cope",
  'danger',
  'kill myself',
  'end it all',
  'not worth living'
];

export const MOOD_KEYWORDS = [
  'anxious',
  'overwhelmed',
  'stressed',
  'panic',
  'depressed',
  'sad',
  'worried',
  'scared',
  'frustrated'
];

export const ETHICAL_PILLARS: EthicalPillar[] = [
  {
    name: 'Transparency',
    description: 'Always show official sources and explain decision-making',
    implementation: 'All resources link to official SJSU CAPS pages with clear attribution'
  },
  {
    name: 'Consent',
    description: 'Session-only processing with explicit user consent',
    implementation: 'Users must agree to terms before using the system, no data stored beyond session'
  },
  {
    name: 'Privacy',
    description: 'No personal data stored beyond current session',
    implementation: 'All conversations are session-only, no persistent storage of personal information'
  },
  {
    name: 'Fairness',
    description: 'Neutral and inclusive resource suggestions',
    implementation: 'Resources are suggested based on need, not demographics or personal characteristics'
  },
  {
    name: 'Safety',
    description: 'Crisis-first logic with immediate support options',
    implementation: 'Crisis keywords trigger immediate safety resources and emergency contacts'
  },
  {
    name: 'Accountability',
    description: 'Visible explanation of resource selection',
    implementation: 'Users can see why specific resources were suggested through "Explain" features'
  }
];
