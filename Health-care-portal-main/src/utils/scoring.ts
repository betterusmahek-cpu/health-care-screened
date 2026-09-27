import { CompanionType, DomainCategory, ResearchCategory, ScreeningQuestion, ScreeningResult } from '../types';
import { classifyFromDomainAverages } from './classification';

export function calculateScreeningResult(
  responses: Record<number, number>,
  questions: ScreeningQuestion[]
): ScreeningResult {
  const domainTotals: Record<string, { total: number; count: number }> = {
    'Attention & Focus': { total: 0, count: 0 },
    'Hyperactivity': { total: 0, count: 0 },
    'Impulsivity': { total: 0, count: 0 },
    'Developmental History': { total: 0, count: 0 },
    'Memory': { total: 0, count: 0 },
    'Executive Function': { total: 0, count: 0 },
    'Language': { total: 0, count: 0 },
    'Orientation': { total: 0, count: 0 },
    'Cognitive Change': { total: 0, count: 0 },
    'Daily Functioning': { total: 0, count: 0 },
  };

  const domainKeyTotals: Record<string, { total: number; count: number }> = {
    attention: { total: 0, count: 0 },
    hyperactivity: { total: 0, count: 0 },
    impulsivity: { total: 0, count: 0 },
    childhood_history: { total: 0, count: 0 },
    memory: { total: 0, count: 0 },
    executive: { total: 0, count: 0 },
    language: { total: 0, count: 0 },
    orientation: { total: 0, count: 0 },
    cognitive_decline: { total: 0, count: 0 },
    functional_impairment: { total: 0, count: 0 },
  };

  let grandTotal = 0;
  const maxPossible = questions.length * 4;

  questions.forEach((q) => {
    const val = responses[q.id] ?? 0;
    grandTotal += val;

    if (domainTotals[q.category]) {
      domainTotals[q.category].total += val;
      domainTotals[q.category].count += 1;
    }

    if (q.domain && domainKeyTotals[q.domain]) {
      domainKeyTotals[q.domain].total += val;
      domainKeyTotals[q.domain].count += 1;
    }
  });

  const domainScores: Record<string, { total: number; count: number; avg: number }> = {};

  Object.entries(domainTotals).forEach(([cat, item]) => {
    const avg = item.count > 0 ? item.total / item.count : 0;
    domainScores[cat] = {
      total: item.total,
      count: item.count,
      avg: Number(avg.toFixed(2)),
    };
  });

  const getAvg = (domainKey: string, fallbackCategory?: string): number => {
    if (domainKeyTotals[domainKey] && domainKeyTotals[domainKey].count > 0) {
      return domainKeyTotals[domainKey].total / domainKeyTotals[domainKey].count;
    }
    if (fallbackCategory && domainScores[fallbackCategory]) {
      return domainScores[fallbackCategory].avg;
    }
    return 0;
  };

  const attentionAvg = getAvg('attention', 'Attention & Focus');
  const hyperactivityAvg = getAvg('hyperactivity', 'Hyperactivity');
  const impulsivityAvg = getAvg('impulsivity', 'Impulsivity');
  const childhoodAvg = getAvg('childhood_history', 'Developmental History');
  const memoryAvg = getAvg('memory', 'Memory');
  const executiveAvg = getAvg('executive', 'Executive Function');
  const languageAvg = getAvg('language', 'Language');
  const orientationAvg = getAvg('orientation', 'Orientation');
  const cognitiveDeclineAvg = getAvg('cognitive_decline', 'Cognitive Change');
  const functionalImpairmentAvg = getAvg('functional_impairment', 'Daily Functioning');

  // Transparent Rule-Based Classifier into 5 Research Categories — see
  // classification.ts for the single source of truth shared with server.ts:
  // 1. Significant Cognitive/Functional Impairment Pattern -> Dementia Companion (route)
  // 2. Mild Cognitive Impairment-like Pattern (MCI) -> MCI Companion (route)
  // 3. ADHD-like Pattern (Inattentive/Hyperactive) -> ADHD Companion (route)
  // 4. Subclinical / Typical Cognitive Pattern -> "You are probably healthy." (exit)
  // 5. Other / Indeterminate Pattern -> "Diagnosis help is not available here." (exit)
  const classification = classifyFromDomainAverages({
    attention: attentionAvg,
    hyperactivity: hyperactivityAvg,
    impulsivity: impulsivityAvg,
    childhood: childhoodAvg,
    memory: memoryAvg,
    executive: executiveAvg,
    language: languageAvg,
    orientation: orientationAvg,
    cognitiveDecline: cognitiveDeclineAvg,
    functionalImpairment: functionalImpairmentAvg,
  });

  const {
    researchCategory,
    researchCategoryExplanation,
    recommendedCompanion,
    action,
    module,
    exitMessage,
  } = classification;

  const percentage = Math.round((grandTotal / Math.max(1, maxPossible)) * 100);

  return {
    totalScore: grandTotal,
    maxPossible,
    percentage,
    domainScores,
    researchCategory,
    researchCategoryExplanation,
    recommendedCompanion,
    action,
    module,
    exitMessage,
    scoringMethod: 'deterministic',
    timestamp: new Date().toISOString().split('T')[0],
  };
}
