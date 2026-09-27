import React, { useState } from 'react';
import {
  ArrowRight,
  Activity,
  BarChart3,
  AlertCircle,
  Shield,
  ShieldAlert,
  Sparkles,
  Target,
  Leaf,
  Cpu,
  CheckCircle2,
  Info
} from 'lucide-react';
import { CompanionType, ScreeningResult, User } from '../../types';

interface ScreeningResultModalProps {
  result: ScreeningResult;
  user: User;
  onContinueToDashboard: () => void;
}

export const ScreeningResultModal: React.FC<ScreeningResultModalProps> = ({
  result,
  user,
  onContinueToDashboard,
}) => {
  const [showDetailedDomains, setShowDetailedDomains] = useState(true);
  const isExit = result.action === 'exit';

  const getCompanionDetails = (type: CompanionType) => {
    switch (type) {
      case 'ADHD Companion':
        return {
          title: 'ADHD Companion Module',
          subtitle: 'Support for Focus, Attention & Task Initiation',
          badgeBg: 'bg-[#EAF2ED] border-[#1E5443] text-[#14261C]',
          btnBg: 'bg-[#1E5443] hover:bg-[#164234]',
          icon: Target,
          iconBg: 'bg-[#1E5443] text-white',
          desc: 'Directly targets identified attention fatigue, restlessness, and task initiation friction with focus timers, multi-step task chunkers, and distraction reduction prompts.',
        };
      case 'MCI Companion':
        return {
          title: 'MCI Companion Module',
          subtitle: 'Support for Early Cognitive & Memory Changes',
          badgeBg: 'bg-[#EAF2ED] border-[#1E5443] text-[#14261C]',
          btnBg: 'bg-[#1E5443] hover:bg-[#164234]',
          icon: Leaf,
          iconBg: 'bg-[#1E5443] text-white',
          desc: 'Directly targets recent recall delays, word-finding friction, and routine planning through spaced retrieval practice, visual daily checklists, and reflection logs.',
        };
      case 'Dementia Companion':
        return {
          title: 'Dementia Companion Module',
          subtitle: 'Support for Orientation & Daily Living Scaffolding',
          badgeBg: 'bg-[#FFF8F3] border-[#E0986C] text-[#14261C]',
          btnBg: 'bg-[#D97746] hover:bg-[#C26233]',
          icon: Shield,
          iconBg: 'bg-[#D97746] text-white',
          desc: 'Directly targets spatial/time orientation, daily routine scaffolding (medications, finances, household tasks), and caregiver coordination with high-contrast cue cards.',
        };
    }
  };

  // Only meaningful when action === 'route'; result.recommendedCompanion is
  // null for the exit categories (Healthy / Other-Indeterminate).
  const details = result.recommendedCompanion
    ? getCompanionDetails(result.recommendedCompanion)
    : null;
  const IconComp = details?.icon;

  // Derive domain symptom severity level
  const getSeverityLabel = (avgScore: number) => {
    if (avgScore >= 2.5) return { label: 'Elevated Need', color: 'text-amber-800 bg-amber-100 border-amber-300' };
    if (avgScore >= 1.5) return { label: 'Moderate Impact', color: 'text-emerald-800 bg-emerald-100 border-emerald-300' };
    return { label: 'Mild / Baseline', color: 'text-slate-700 bg-slate-100 border-slate-300' };
  };

  // Convert domain scores entries into ordered array
  const domainList = Object.entries(result.domainScores || {}) as [
    string,
    { total: number; count: number; avg: number }
  ][];

  // Key observations generated from top scoring domains
  const topDomains = [...domainList]
    .sort((a, b) => b[1].avg - a[1].avg)
    .filter(([_, data]) => data.count > 0)
    .slice(0, 3);

  const isLLM = result.scoringMethod === 'llm';
  const isFallback = result.scoringFallback === true;

  return (
    <div id="screening-symptom-analysis-modal" className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs p-4 sm:p-6 flex justify-center items-start sm:items-center min-h-screen">
      <div className="bg-[#FAF8F5] rounded-3xl shadow-xl border border-[#CBD7CE] max-w-3xl w-full p-6 sm:p-8 my-auto relative max-h-[90vh] overflow-y-auto">
        {/* Step Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EAF2ED] text-[#1E5443] text-xs font-bold border border-[#D1E2D7] mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-[#2C6B56]" />
            Post-Assessment Symptom Analysis
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#14261C] tracking-tight">
            Cognitive & Symptom Profile
          </h2>
          <p className="text-xs sm:text-sm text-[#4E6155] mt-1 max-w-lg mx-auto font-medium">
            Review your 30-question symptom breakdown across 10 cognitive sections.
          </p>
        </div>

        {/* Scoring Methodology & Research Classification Banner */}
        <div className="mb-6 space-y-3">
          {/* Research Classification Box */}
          <div className="bg-[#EEF5F1] border border-[#D5E4DB] rounded-2xl p-4.5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#1E5443] text-white flex items-center justify-center shrink-0 font-mono text-xs font-bold mt-0.5">
                RC
              </div>
              <div className="flex-1">
                <span className="text-[11px] font-mono tracking-wider text-[#3D6B56] uppercase font-bold block">
                  Transparent Rule-Based Research Classification (1 of 5)
                </span>
                <h4 className="text-base font-serif font-bold text-[#14261C] mt-0.5">
                  {result.researchCategory || 'ADHD-like Pattern (Inattentive/Hyperactive)'}
                </h4>
                <p className="text-xs text-[#3D5245] mt-1 leading-relaxed">
                  {result.researchCategoryExplanation ||
                    'Domain scores were analyzed across attention, memory, and functional independence to place your response profile into this research category.'}
                </p>
                {result.recommendedCompanion ? (
                  <div className="mt-2.5 inline-flex items-center gap-2 text-xs font-bold text-[#1E5443] bg-white/80 px-3 py-1 rounded-lg border border-[#C5D7CC]">
                    <span>Directly mapped to suggested module:</span>
                    <span className="text-[#14261C] underline font-extrabold">{result.recommendedCompanion}</span>
                  </div>
                ) : (
                  <div className="mt-2.5 inline-flex items-center gap-2 text-xs font-bold text-[#5C6E63] bg-white/80 px-3 py-1 rounded-lg border border-[#C5D7CC]">
                    <span>No companion module is mapped to this category.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Scoring Methodology Mode */}
          {isLLM ? (
            <div className="bg-white border border-[#CBD7CE] rounded-xl p-3 flex items-start gap-3 shadow-2xs">
              <Cpu className="w-4 h-4 text-[#1E5443] shrink-0 mt-0.5" />
              <div className="text-xs text-[#283C30]">
                <span className="font-bold text-[#1E5443]">
                  Method: LLM-Assisted Feature Extraction (Gemini 3.8 Flash)
                </span>
                <span className="text-[#4E6155] ml-1.5">
                  Extracted cognitive patterns from responses across the 10 sections to validate research classification.
                </span>
              </div>
            </div>
          ) : isFallback ? (
            <div className="bg-[#FFF8F3] border border-[#F2D0BD] rounded-xl p-3 flex items-start gap-3 shadow-2xs">
              <Info className="w-4 h-4 text-[#D97746] shrink-0 mt-0.5" />
              <div className="text-xs text-[#3D322B]">
                <span className="font-bold text-[#B95526]">
                  Method: Standard Deterministic Scorer (Fallback)
                </span>
                <span className="text-[#685A50] ml-1.5">
                  Server AI was unavailable; transparent deterministic rule-based classification was applied successfully.
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#CBD7CE] rounded-xl p-3 flex items-start gap-3 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-[#1E5443] shrink-0 mt-0.5" />
              <div className="text-xs text-[#283C30]">
                <span className="font-bold text-[#1E5443]">
                  Method: Deterministic Rule-Based Scorer
                </span>
                <span className="text-[#4E6155] ml-1.5">
                  Converted domain scores into one of five transparent research categories.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 1. Overall Symptom Score Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-[#E3E8E2] text-center shadow-2xs">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#6A786C] block">
              Total Score
            </span>
            <span className="text-2xl font-black text-[#14261C] mt-0.5 block">
              {result.totalScore} <span className="text-xs font-bold text-[#6A786C]">/ {result.maxPossible}</span>
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E3E8E2] text-center shadow-2xs">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#6A786C] block">
              Primary Symptom Focus
            </span>
            <span className="text-sm font-extrabold text-[#1E5443] mt-1.5 block">
              {topDomains[0] ? topDomains[0][0] : 'Balanced Profile'}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E3E8E2] text-center shadow-2xs">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#6A786C] block">
              Recommended Module
            </span>
            <span className="text-sm font-extrabold text-[#D97746] mt-1.5 block">
              {result.recommendedCompanion}
            </span>
          </div>
        </div>

        {/* 2. Domain-by-Domain Symptom Severity Breakdown */}
        <div className="bg-[#EEF5F1] p-5 rounded-2xl border border-[#CFDFD6] mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#1E5443] flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#2C6B56]" />
              10 Sections Breakdown
            </h3>
            <button
              onClick={() => setShowDetailedDomains(!showDetailedDomains)}
              className="text-xs font-bold text-[#1E5443] hover:underline"
            >
              {showDetailedDomains ? 'Collapse Details' : 'Expand All 10 Sections'}
            </button>
          </div>

          {showDetailedDomains && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {domainList.map(([cat, data]) => {
                if (data.count === 0) return null;
                const severity = getSeverityLabel(data.avg);
                const barPercent = Math.min(100, Math.round((data.avg / 4) * 100));

                return (
                  <div key={cat} className="bg-white p-3.5 rounded-xl border border-[#D5DDD3] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#14261C]">{cat}</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${severity.color}`}>
                        {severity.label}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-[#E4ECE7] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1E5443] rounded-full transition-all"
                        style={{ width: `${barPercent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#6A786C]">
                      <span>Avg: {data.avg} / 4.0</span>
                      <span>{data.count} Questions</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Extracted Features (if present from LLM) */}
        {result.extractedFeatures && result.extractedFeatures.length > 0 && (
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#CBD7CE] mb-6 space-y-2.5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#14261C] flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-[#1E5443]" />
              Extracted Research Features
            </h4>
            <ul className="space-y-1.5 text-xs text-[#3E5246]">
              {result.extractedFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1E5443] mt-1.5 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 3. Key Symptom Observations */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E3E8E2] mb-6 space-y-2.5">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#14261C] flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-[#1E5443]" />
            Key Observations
          </h4>
          <ul className="space-y-1.5 text-xs text-[#3D4A3E]">
            {topDomains.map(([cat, data]) => (
              <li key={cat} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D97746] mt-1.5 shrink-0" />
                <span>
                  <strong>{cat}</strong> showed notable responses (average rating {data.avg} / 4.0).
                </span>
              </li>
            ))}
            <li className="flex items-start gap-2 text-[#56655A]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1E5443] mt-1.5 shrink-0" />
              <span>
                {result.recommendedCompanion
                  ? <>These symptom patterns align directly with the support tools in the <strong>{result.recommendedCompanion}</strong>.</>
                  : <>These symptom patterns did not clearly align with any single companion module in this research classification.</>}
              </span>
            </li>
          </ul>
        </div>

        {/* AI Personalized Analysis */}
        {result.aiAnalysis && (
          <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#1E5443]/20 mb-6 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D97746]" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#1E5443]">
                AI Companion Analysis & Guidance
              </h4>
            </div>

            {result.aiAnalysis.summary && (
              <p className="text-xs sm:text-sm text-[#14261C] leading-relaxed font-medium">
                {result.aiAnalysis.summary}
              </p>
            )}

            {result.aiAnalysis.keyTakeaways && result.aiAnalysis.keyTakeaways.length > 0 && (
              <div className="pt-2 border-t border-[#E3E8E2]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6A786C] block mb-1.5">
                  Actionable Strategies
                </span>
                <ul className="space-y-1.5 text-xs text-[#3E5246]">
                  {result.aiAnalysis.keyTakeaways.map((takeaway, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D97746] mt-1.5 shrink-0" />
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.aiAnalysis.focusTip && (
              <div className="bg-white p-3 rounded-xl border border-[#CFDFD6] text-xs text-[#1E5443] font-medium flex items-start gap-2">
                <Target className="w-4 h-4 text-[#D97746] shrink-0 mt-0.5" />
                <span><strong>Daily Wellness Tip:</strong> {result.aiAnalysis.focusTip}</span>
              </div>
            )}
          </div>
        )}

        {/* 4. Target Module Box (route) OR Exit Message Box (exit) */}
        {isExit ? (
          <div className="p-5 rounded-2xl border-2 border-[#CBD7CE] bg-[#EEF5F1] shadow-2xs mb-6">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs bg-[#1E5443] text-white">
                <Info className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#5C6E63] block">
                  Screening Result
                </span>
                <h3 className="text-lg font-extrabold text-[#14261C] mt-0.5">
                  {result.exitMessage}
                </h3>
                <p className="text-xs text-[#3E5246] mt-1 leading-relaxed">
                  No companion module is being opened for this result. You can return to your dashboard, and retake the screening at any time.
                </p>
              </div>
            </div>
          </div>
        ) : details && IconComp ? (
          <div className={`p-5 rounded-2xl border-2 shadow-2xs mb-6 ${details.badgeBg}`}>
            <div className="flex items-start gap-3.5">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${details.iconBg}`}>
                <IconComp className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#5C6E63]">
                    Targeted Module Match
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#1E5443] text-white">
                    Primary Recommendation
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-[#14261C] mt-0.5">{details.title}</h3>
                <p className="text-xs text-[#3E5246] mt-1 leading-relaxed">
                  {details.desc}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Non-Diagnostic Disclaimer */}
        <div className="p-3 rounded-xl bg-[#FFF8F3] border border-[#F2D0BD] text-[#3D322B] text-xs flex items-start gap-2.5 mb-6">
          <ShieldAlert className="w-4 h-4 text-[#D97746] shrink-0 mt-0.5" />
          <p className="leading-snug">
            <strong>Wellness Disclaimer:</strong> This symptom analysis is provided for personal self-reflection and non-medical scaffolding purposes. Consult a licensed medical practitioner for clinical evaluation.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-[#E3E8E2]">
          <p className="text-xs text-[#5C6E63] font-medium text-center sm:text-left">
            {isExit
              ? 'Click below to return to your dashboard.'
              : 'Click below when you are ready to open your recommended companion.'}
          </p>

          {isExit ? (
            <button
              id="btn-screening-exit"
              onClick={onContinueToDashboard}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-sm font-bold text-white shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer bg-[#1E5443] hover:bg-[#164234]"
            >
              <span>Return to Dashboard</span>
            </button>
          ) : (
            <button
              id="btn-confirm-companion-redirect"
              onClick={onContinueToDashboard}
              className={`w-full sm:w-auto px-7 py-3.5 rounded-xl text-sm font-bold text-white shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${details?.btnBg ?? 'bg-[#1E5443] hover:bg-[#164234]'}`}
            >
              <span>Proceed to {result.recommendedCompanion}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
