export type CompanionType = 'ADHD Companion' | 'MCI Companion' | 'Dementia Companion';

export type DomainKey =
  | 'attention'
  | 'hyperactivity'
  | 'impulsivity'
  | 'childhood_history'
  | 'memory'
  | 'executive'
  | 'language'
  | 'orientation'
  | 'cognitive_decline'
  | 'functional_impairment';

export type DomainCategory = 
  | 'Attention & Focus'
  | 'Hyperactivity'
  | 'Impulsivity'
  | 'Developmental History'
  | 'Memory'
  | 'Executive Function'
  | 'Language'
  | 'Orientation'
  | 'Cognitive Change'
  | 'Daily Functioning'
  | 'Memory & Recall'
  | 'Language & Words'
  | 'Behavior & Control'
  | 'Emotional Well-being'
  | 'Visuospatial';

export type ScaleType = 'frequency' | 'change' | 'independence';

export interface ScaleOption {
  value: number;
  label: string;
  description: string;
}

export interface User {
  id: string;
  fullName: string;
  age: number;
  gender: string;
  email: string;
  rememberMe?: boolean;
  hasCompletedScreening: boolean;
  recommendedCompanion?: CompanionType;
  selectedCompanion?: CompanionType;
  screeningDate?: string;
}

export interface ScreeningQuestion {
  id: number;
  sectionNumber: number;
  sectionTitle: string;
  domain: DomainKey;
  category: DomainCategory;
  scaleType: ScaleType;
  text: string;
  detail?: string;
}

export type ResearchCategory =
  | 'ADHD-like Pattern (Inattentive/Hyperactive)'
  | 'Mild Cognitive Impairment-like Pattern (MCI)'
  | 'Significant Cognitive/Functional Impairment Pattern'
  | 'Subclinical / Typical Cognitive Pattern'
  | 'Other / Indeterminate Pattern';

export type ScreeningAction = 'route' | 'exit';
export type ScreeningModule = 'adhd' | 'mci' | 'dementia';

export interface ScreeningResult {
  totalScore: number;
  maxPossible: number;
  percentage: number;
  domainScores: Record<string, { total: number; count: number; avg: number }>;
  recommendedCompanion: CompanionType | null;
  action: ScreeningAction;
  module: ScreeningModule | null;
  exitMessage: string | null;
  researchCategory?: ResearchCategory;
  researchCategoryExplanation?: string;
  scoringMethod?: 'llm' | 'deterministic';
  scoringFallback?: boolean;
  extractedFeatures?: string[];
  aiAnalysis?: {
    summary: string;
    keyTakeaways: string[];
    focusTip: string;
  };
  timestamp: string;
}

export interface SymptomLog {
  id: string;
  date: string;
  clarity: number; // 1-5
  focus: number; // 1-5
  mood: 'great' | 'good' | 'neutral' | 'anxious' | 'tired';
  sleepHours: number;
  notes: string;
}

export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  notes: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

export interface ResourceArticle {
  id: string;
  title: string;
  category: string;
  readTime: string;
  summary: string;
  content: string;
  tag: string;
}
