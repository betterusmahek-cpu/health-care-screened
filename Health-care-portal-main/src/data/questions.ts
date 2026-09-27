import { ScaleOption, ScaleType, ScreeningQuestion } from '../types';

export const FREQUENCY_SCALE: ScaleOption[] = [
  { value: 0, label: '0 — Never', description: 'Not at all / never experienced' },
  { value: 1, label: '1 — Rarely', description: 'Once in a while or infrequently' },
  { value: 2, label: '2 — Sometimes', description: 'A few times periodically' },
  { value: 3, label: '3 — Often', description: 'Frequently or multiple times a week' },
  { value: 4, label: '4 — Very often', description: 'Almost daily or consistently' },
];

export const CHANGE_SCALE: ScaleOption[] = [
  { value: 0, label: '0 — No change', description: 'Same as prior baseline ability' },
  { value: 1, label: '1 — Slight change', description: 'Minor changes noticed on occasion' },
  { value: 2, label: '2 — Noticeable change', description: 'Clear difference from past functioning' },
  { value: 3, label: '3 — Significant change', description: 'Substantial decline noticed' },
  { value: 4, label: '4 — Severe change', description: 'Major progression affecting confidence' },
];

export const INDEPENDENCE_SCALE: ScaleOption[] = [
  { value: 0, label: '0 — Completely independent', description: 'No difficulty or assistance needed' },
  { value: 1, label: '1 — Independent, but with minor difficulty', description: 'Performs alone with extra effort or time' },
  { value: 2, label: '2 — Occasionally need assistance', description: 'Needs occasional help or reminders' },
  { value: 3, label: '3 — Frequently need assistance', description: 'Regular support needed to complete tasks' },
  { value: 4, label: '4 — Unable to perform independently', description: 'Fully relies on family or caregiver' },
];

// Helper to get scale options by scale type
export function getScaleOptions(scaleType: ScaleType): ScaleOption[] {
  switch (scaleType) {
    case 'change':
      return CHANGE_SCALE;
    case 'independence':
      return INDEPENDENCE_SCALE;
    case 'frequency':
    default:
      return FREQUENCY_SCALE;
  }
}

// 30 Curated Screening Questions grouped into 10 sections
export const SCREENING_QUESTIONS: ScreeningQuestion[] = [
  // --- Section 1: Attention & Focus (Questions 1–7) ---
  {
    id: 1,
    sectionNumber: 1,
    sectionTitle: 'Section 1: Attention & Focus',
    domain: 'attention',
    category: 'Attention & Focus',
    scaleType: 'frequency',
    text: 'How often do you have difficulty maintaining attention during a task, lecture, conversation, or activity?',
  },
  {
    id: 2,
    sectionNumber: 1,
    sectionTitle: 'Section 1: Attention & Focus',
    domain: 'attention',
    category: 'Attention & Focus',
    scaleType: 'frequency',
    text: 'How often do you make mistakes because you overlook details or fail to notice important information?',
  },
  {
    id: 3,
    sectionNumber: 1,
    sectionTitle: 'Section 1: Attention & Focus',
    domain: 'attention',
    category: 'Attention & Focus',
    scaleType: 'frequency',
    text: 'How often do you start tasks but have difficulty finishing them?',
  },
  {
    id: 4,
    sectionNumber: 1,
    sectionTitle: 'Section 1: Attention & Focus',
    domain: 'attention',
    category: 'Attention & Focus',
    scaleType: 'frequency',
    text: 'How often do you have difficulty organizing your work, studies, or daily activities?',
  },
  {
    id: 5,
    sectionNumber: 1,
    sectionTitle: 'Section 1: Attention & Focus',
    domain: 'attention',
    category: 'Attention & Focus',
    scaleType: 'frequency',
    text: 'How often do you avoid or delay tasks that require prolonged mental effort?',
  },
  {
    id: 6,
    sectionNumber: 1,
    sectionTitle: 'Section 1: Attention & Focus',
    domain: 'attention',
    category: 'Attention & Focus',
    scaleType: 'frequency',
    text: 'How often are you easily distracted by unrelated sounds, thoughts, notifications, or activities?',
  },
  {
    id: 7,
    sectionNumber: 1,
    sectionTitle: 'Section 1: Attention & Focus',
    domain: 'attention',
    category: 'Attention & Focus',
    scaleType: 'frequency',
    text: 'How often do you forget appointments, deadlines, instructions, or everyday responsibilities?',
  },

  // --- Section 2: Hyperactivity (Questions 8–9) ---
  {
    id: 8,
    sectionNumber: 2,
    sectionTitle: 'Section 2: Hyperactivity',
    domain: 'hyperactivity',
    category: 'Hyperactivity',
    scaleType: 'frequency',
    text: 'How often do you feel restless when you are expected to remain seated or still?',
  },
  {
    id: 9,
    sectionNumber: 2,
    sectionTitle: 'Section 2: Hyperactivity',
    domain: 'hyperactivity',
    category: 'Hyperactivity',
    scaleType: 'frequency',
    text: 'How often do you feel unable to relax without doing something or keeping yourself occupied?',
  },

  // --- Section 3: Impulsivity (Questions 10–11) ---
  {
    id: 10,
    sectionNumber: 3,
    sectionTitle: 'Section 3: Impulsivity',
    domain: 'impulsivity',
    category: 'Impulsivity',
    scaleType: 'frequency',
    text: 'How often do you interrupt conversations or answer before another person has finished speaking?',
  },
  {
    id: 11,
    sectionNumber: 3,
    sectionTitle: 'Section 3: Impulsivity',
    domain: 'impulsivity',
    category: 'Impulsivity',
    scaleType: 'frequency',
    text: 'How often do you find it difficult to wait for your turn?',
  },

  // --- Section 4: Developmental History (Questions 12–14) ---
  {
    id: 12,
    sectionNumber: 4,
    sectionTitle: 'Section 4: Developmental History',
    domain: 'childhood_history',
    category: 'Developmental History',
    scaleType: 'frequency',
    text: 'Did you experience persistent difficulties with attention, organization, or impulsivity during childhood?',
  },
  {
    id: 13,
    sectionNumber: 4,
    sectionTitle: 'Section 4: Developmental History',
    domain: 'childhood_history',
    category: 'Developmental History',
    scaleType: 'frequency',
    text: 'During childhood or adolescence, did these difficulties interfere with your schoolwork, relationships, or daily activities?',
  },
  {
    id: 14,
    sectionNumber: 4,
    sectionTitle: 'Section 4: Developmental History',
    domain: 'childhood_history',
    category: 'Developmental History',
    scaleType: 'frequency',
    text: 'Have your attention-related difficulties been present for a long period rather than appearing only recently?',
  },

  // --- Section 5: Memory (Questions 15–19) ---
  {
    id: 15,
    sectionNumber: 5,
    sectionTitle: 'Section 5: Memory',
    domain: 'memory',
    category: 'Memory',
    scaleType: 'frequency',
    text: 'How often do you forget information that you learned recently?',
  },
  {
    id: 16,
    sectionNumber: 5,
    sectionTitle: 'Section 5: Memory',
    domain: 'memory',
    category: 'Memory',
    scaleType: 'frequency',
    text: 'How often do you forget conversations or events that happened recently?',
  },
  {
    id: 17,
    sectionNumber: 5,
    sectionTitle: 'Section 5: Memory',
    domain: 'memory',
    category: 'Memory',
    scaleType: 'frequency',
    text: 'How often do you repeat a question, story, or information because you do not remember having already mentioned it?',
  },
  {
    id: 18,
    sectionNumber: 5,
    sectionTitle: 'Section 5: Memory',
    domain: 'memory',
    category: 'Memory',
    scaleType: 'frequency',
    text: 'How often do you have difficulty learning and remembering new information?',
  },
  {
    id: 19,
    sectionNumber: 5,
    sectionTitle: 'Section 5: Memory',
    domain: 'memory',
    category: 'Memory',
    scaleType: 'frequency',
    text: 'How often do you forget where you have placed commonly used objects?',
  },

  // --- Section 6: Executive Function (Questions 20–22) ---
  {
    id: 20,
    sectionNumber: 6,
    sectionTitle: 'Section 6: Executive Function',
    domain: 'executive',
    category: 'Executive Function',
    scaleType: 'frequency',
    text: 'How often do you have difficulty planning or carrying out a familiar multi-step task?',
  },
  {
    id: 21,
    sectionNumber: 6,
    sectionTitle: 'Section 6: Executive Function',
    domain: 'executive',
    category: 'Executive Function',
    scaleType: 'frequency',
    text: 'How often do you have difficulty solving a problem that you previously would have handled easily?',
  },
  {
    id: 22,
    sectionNumber: 6,
    sectionTitle: 'Section 6: Executive Function',
    domain: 'executive',
    category: 'Executive Function',
    scaleType: 'frequency',
    text: 'How often do you lose track of the steps while performing an ordinary task?',
  },

  // --- Section 7: Language (Question 23) ---
  {
    id: 23,
    sectionNumber: 7,
    sectionTitle: 'Section 7: Language',
    domain: 'language',
    category: 'Language',
    scaleType: 'frequency',
    text: 'How often do you have difficulty finding familiar words while speaking or writing?',
  },

  // --- Section 8: Orientation (Question 24) ---
  {
    id: 24,
    sectionNumber: 8,
    sectionTitle: 'Section 8: Orientation',
    domain: 'orientation',
    category: 'Orientation',
    scaleType: 'frequency',
    text: 'How often do you become confused about dates, times, locations, or where you are going?',
  },

  // --- Section 9: Cognitive Change (Questions 25–27) ---
  {
    id: 25,
    sectionNumber: 9,
    sectionTitle: 'Section 9: Cognitive Change',
    domain: 'cognitive_decline',
    category: 'Cognitive Change',
    scaleType: 'change',
    text: 'Compared with your previous level of ability, how much decline have you noticed in your memory or thinking?',
  },
  {
    id: 26,
    sectionNumber: 9,
    sectionTitle: 'Section 9: Cognitive Change',
    domain: 'cognitive_decline',
    category: 'Cognitive Change',
    scaleType: 'change',
    text: 'How much have other people noticed a change in your memory, thinking, or ability to perform familiar tasks?',
  },
  {
    id: 27,
    sectionNumber: 9,
    sectionTitle: 'Section 9: Cognitive Change',
    domain: 'cognitive_decline',
    category: 'Cognitive Change',
    scaleType: 'change',
    text: 'How much has your memory or thinking difficulty progressively increased over time?',
  },

  // --- Section 10: Daily Functioning (Questions 28–30) ---
  {
    id: 28,
    sectionNumber: 10,
    sectionTitle: 'Section 10: Daily Functioning',
    domain: 'functional_impairment',
    category: 'Daily Functioning',
    scaleType: 'independence',
    text: 'How much difficulty do you have independently managing finances, payments, or important documents?',
  },
  {
    id: 29,
    sectionNumber: 10,
    sectionTitle: 'Section 10: Daily Functioning',
    domain: 'functional_impairment',
    category: 'Daily Functioning',
    scaleType: 'independence',
    text: 'How much difficulty do you have independently managing medications, appointments, schedules, or important responsibilities?',
  },
  {
    id: 30,
    sectionNumber: 10,
    sectionTitle: 'Section 10: Daily Functioning',
    domain: 'functional_impairment',
    category: 'Daily Functioning',
    scaleType: 'independence',
    text: 'How much difficulty do you have independently managing everyday activities such as cooking, shopping, transportation, or household tasks?',
  },
];

// Backward-compatible scale export
export const SCALE_OPTIONS = FREQUENCY_SCALE;
