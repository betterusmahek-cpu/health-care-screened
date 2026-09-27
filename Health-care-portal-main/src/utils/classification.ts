import { CompanionType, ResearchCategory } from '../types';

// What the UI should do once a category is decided.
export type ScreeningAction = 'route' | 'exit';
export type ScreeningModule = 'adhd' | 'mci' | 'dementia';

export interface DomainAverages {
  attention: number; // 0-4
  hyperactivity: number; // 0-4
  impulsivity: number; // 0-4
  childhood: number; // 0-4 (Developmental History)
  memory: number; // 0-4
  executive: number; // 0-4
  language: number; // 0-4
  orientation: number; // 0-4
  cognitiveDecline: number; // 0-4 (Cognitive Change)
  functionalImpairment: number; // 0-4 (Daily Functioning)
}

export interface ClassificationResult {
  researchCategory: ResearchCategory;
  researchCategoryExplanation: string;
  recommendedCompanion: CompanionType | null;
  action: ScreeningAction;
  module: ScreeningModule | null;
  exitMessage: string | null;
}

type Routing = Pick<
  ClassificationResult,
  'recommendedCompanion' | 'action' | 'module' | 'exitMessage'
>;

const EXPLANATION_BY_CATEGORY: Record<ResearchCategory, string> = {
  'Significant Cognitive/Functional Impairment Pattern':
    'Elevated ratings in daily activity management (finances, medications, or navigation) with progressive cognitive changes. Best supported with caregiver coordination and daily routine scaffolding.',
  'Mild Cognitive Impairment-like Pattern (MCI)':
    'Noticeable memory retrieval friction or perceived decline over time, while daily living independence remains largely preserved. Best supported with spaced recall exercises and memory cues.',
  'ADHD-like Pattern (Inattentive/Hyperactive)':
    'Prominent attention maintenance challenges, task initiation friction, restlessness, or childhood developmental continuity. Best supported with focus timers, pacing, and distraction filters.',
  'Subclinical / Typical Cognitive Pattern':
    'Overall responses fall within a typical, subclinical baseline range across all ten domains, with no area standing out as elevated.',
  'Other / Indeterminate Pattern':
    'Responses show a mixed or moderately elevated pattern that does not clearly fit the ADHD, MCI, or Dementia research categories.',
};

const ROUTING_BY_CATEGORY: Record<ResearchCategory, Routing> = {
  'Significant Cognitive/Functional Impairment Pattern': {
    recommendedCompanion: 'Dementia Companion',
    action: 'route',
    module: 'dementia',
    exitMessage: null,
  },
  'Mild Cognitive Impairment-like Pattern (MCI)': {
    recommendedCompanion: 'MCI Companion',
    action: 'route',
    module: 'mci',
    exitMessage: null,
  },
  'ADHD-like Pattern (Inattentive/Hyperactive)': {
    recommendedCompanion: 'ADHD Companion',
    action: 'route',
    module: 'adhd',
    exitMessage: null,
  },
  'Subclinical / Typical Cognitive Pattern': {
    recommendedCompanion: null,
    action: 'exit',
    module: null,
    exitMessage: 'You are probably healthy.',
  },
  'Other / Indeterminate Pattern': {
    recommendedCompanion: null,
    action: 'exit',
    module: null,
    exitMessage: 'Diagnosis help is not available here.',
  },
};

/**
 * Given ANY of the 5 valid categories (deterministic or LLM-chosen),
 * return the correct routing fields. This is what lets an LLM override
 * to a different valid category still route correctly, instead of only
 * ever reflecting whatever the raw domain scores alone would produce.
 */
export function getRoutingForCategory(category: ResearchCategory): Routing {
  return ROUTING_BY_CATEGORY[category];
}

function buildResult(category: ResearchCategory): ClassificationResult {
  return {
    researchCategory: category,
    researchCategoryExplanation: EXPLANATION_BY_CATEGORY[category],
    ...ROUTING_BY_CATEGORY[category],
  };
}

/**
 * Transparent, rule-based classifier into exactly 5 outcomes:
 *   ADHD, MCI, Dementia -> action "route" into that module
 *   Healthy, Other/Indeterminate -> action "exit" with a short message
 *
 * This is the ONLY place this decision logic should live. Both the
 * browser (src/utils/scoring.ts) and the server (server.ts) call this
 * same function so their results can never diverge.
 */
export function classifyFromDomainAverages(d: DomainAverages): ClassificationResult {
  const {
    attention,
    hyperactivity,
    impulsivity,
    childhood,
    memory,
    executive,
    language,
    orientation,
    cognitiveDecline,
    functionalImpairment,
  } = d;

  // ADHD Cluster
  const adhdWeightSum = 2.0 + 1.4 + 1.4 + 1.8;
  const adhdNorm =
    (attention * 2.0 + hyperactivity * 1.4 + impulsivity * 1.4 + childhood * 1.8) /
    adhdWeightSum;

  // MCI Cluster
  const mciWeightSum = 2.0 + 1.8 + 1.4 + 1.0;
  const mciNorm =
    (memory * 2.0 + cognitiveDecline * 1.8 + executive * 1.4 + language * 1.0) /
    mciWeightSum;

  // Dementia / Significant Impairment Cluster
  const dementiaWeightSum = 2.2 + 1.8 + 1.8 + 1.4 + 1.0;
  const dementiaNorm =
    (functionalImpairment * 2.2 +
      orientation * 1.8 +
      cognitiveDecline * 1.8 +
      memory * 1.4 +
      executive * 1.0) /
    dementiaWeightSum;

  const hasFunctionalImpairment = functionalImpairment >= 1.5;
  const hasHighDeclineOrDisorientation = cognitiveDecline >= 2.0 && orientation >= 1.5;

  // 1. Dementia-like
  if (hasFunctionalImpairment || (dementiaNorm >= 1.8 && hasHighDeclineOrDisorientation)) {
    return buildResult('Significant Cognitive/Functional Impairment Pattern');
  }

  // 2. MCI-like
  if (
    (memory >= 1.5 || cognitiveDecline >= 1.5) &&
    functionalImpairment < 1.5 &&
    (memory >= attention || mciNorm >= adhdNorm)
  ) {
    return buildResult('Mild Cognitive Impairment-like Pattern (MCI)');
  }

  // 3. ADHD-like
  if (
    adhdNorm >= 1.2 ||
    (attention >= 1.5 && (hyperactivity >= 1.0 || impulsivity >= 1.0 || childhood >= 1.0))
  ) {
    return buildResult('ADHD-like Pattern (Inattentive/Hyperactive)');
  }

  // Neither ADHD-, MCI-, nor Dementia-like. Split the remainder into
  // Healthy (everything comfortably low) vs. Other/Indeterminate (mixed
  // or moderately elevated but not matching any specific pattern) instead
  // of silently defaulting into a companion module.
  const overallAvg =
    (attention +
      hyperactivity +
      impulsivity +
      childhood +
      memory +
      executive +
      language +
      orientation +
      cognitiveDecline +
      functionalImpairment) /
    10;

  if (overallAvg < 1.0) {
    return buildResult('Subclinical / Typical Cognitive Pattern');
  }

  return buildResult('Other / Indeterminate Pattern');
}
