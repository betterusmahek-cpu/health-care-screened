import { Appointment, CompanionType, ResourceArticle, SymptomLog } from '../types';

export const DEMO_USER = {
  id: 'usr_demo_101',
  fullName: 'Sarah Jenkins',
  age: 48,
  gender: 'Female',
  email: 'sarah.j@example.com',
  hasCompletedScreening: true,
  recommendedCompanion: 'ADHD Companion' as CompanionType,
  selectedCompanion: 'ADHD Companion' as CompanionType,
  screeningDate: '2026-07-20',
};

export const INITIAL_SYMPTOM_LOGS: SymptomLog[] = [
  {
    id: 'log-1',
    date: '2026-07-22',
    clarity: 4,
    focus: 3,
    mood: 'good',
    sleepHours: 7.5,
    notes: 'Used the Pomodoro focus timer with rain sounds. Completed 3 chunked tasks efficiently.'
  },
  {
    id: 'log-2',
    date: '2026-07-21',
    clarity: 3,
    focus: 2,
    mood: 'tired',
    sleepHours: 6.0,
    notes: 'Felt scattered in morning. Flashcard memory reminders helped keep track of afternoon call.'
  },
  {
    id: 'log-3',
    date: '2026-07-20',
    clarity: 5,
    focus: 4,
    mood: 'great',
    sleepHours: 8.0,
    notes: 'Completed full cognitive screening baseline. ADHD companion module assigned.'
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    doctorName: 'Dr. Evelyn Vance, MD',
    specialty: 'Cognitive Neurology',
    date: '2026-08-04',
    time: '10:30 AM',
    location: 'Metropolitan Memory & Neurology Clinic, Suite 402',
    notes: 'Review initial baseline cognitive screening results and discuss daily focus routine.',
    status: 'upcoming'
  },
  {
    id: 'apt-2',
    doctorName: 'Dr. Marcus Thorne',
    specialty: 'Primary Care Physician',
    date: '2026-08-18',
    time: '02:00 PM',
    location: 'City Wellness Medical Center',
    notes: 'Annual health checkup and routine blood work review.',
    status: 'upcoming'
  }
];

export const RESOURCE_ARTICLES: ResourceArticle[] = [
  {
    id: 'art-1',
    title: 'The Neuroscience of Task Chunking for Focus',
    category: 'Attention & Executive Function',
    readTime: '4 min read',
    summary: 'Breaking complex goals into 3 bite-sized steps reduces cognitive load and overcomes task initiation paralysis.',
    content: 'When presented with large, ambiguous projects, the prefrontal cortex experiences cognitive friction. By enforcing a rule of three—focusing on only the immediate next 3 steps—you lower activation energy and stimulate baseline dopamine release as each milestone is completed.',
    tag: 'ADHD'
  },
  {
    id: 'art-2',
    title: 'Spaced Retrieval: Boosting Memory Retention in Early Cognitive Changes',
    category: 'Memory & Learning',
    readTime: '5 min read',
    summary: 'How practice testing at expanding time intervals rebuilds neural retrieval pathways for names, dates, and daily details.',
    content: 'Spaced retrieval is an evidence-based cognitive intervention where information is tested at systematically increasing time intervals (e.g., 30s, 2 min, 10 min, 1 day). Research shows it significantly improves practical recall for key daily details.',
    tag: 'MCI'
  },
  {
    id: 'art-3',
    title: 'Designing a Calm & Structurally Supportive Home Environment',
    category: 'Daily Living & Environment',
    readTime: '6 min read',
    summary: 'Simple visual cues, high-contrast orientation boards, and routine checklists that simplify daily living.',
    content: 'Creating a supportive visual environment compensates for spatial and working memory challenges. Clear orientation calendars, labeled storage, and 1-tap essential checklists provide continuous environmental scaffolding.',
    tag: 'Dementia'
  },
  {
    id: 'art-4',
    title: 'Sleep Hygiene & Brain Health: Clearing Metabolic Waste',
    category: 'Brain Wellness',
    readTime: '5 min read',
    summary: 'Why deep slow-wave sleep is essential for the glymphatic system to maintain long-term cognitive vitality.',
    content: 'During deep sleep, the brain’s glymphatic system increases flow by up to 60%, clearing metabolic byproducts accumulated throughout waking hours. Prioritizing 7-8 hours of regular sleep is one of the most powerful brain health interventions.',
    tag: 'Wellness'
  }
];
