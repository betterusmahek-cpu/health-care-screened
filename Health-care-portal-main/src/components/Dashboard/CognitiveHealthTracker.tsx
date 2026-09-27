import React from 'react';
import { Activity, Brain, Calendar, CheckCircle2, RotateCcw, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { CompanionType, ScreeningResult, User } from '../../types';

interface CognitiveHealthTrackerProps {
  user: User;
  screeningResult: ScreeningResult | null;
  onRetakeScreening: () => void;
  onSelectCompanion: (comp: CompanionType) => void;
}

export const CognitiveHealthTracker: React.FC<CognitiveHealthTrackerProps> = ({
  user,
  screeningResult,
  onRetakeScreening,
  onSelectCompanion,
}) => {
  const activeCompanion = user.selectedCompanion || user.recommendedCompanion || 'ADHD Companion';

  return (
    <div id="cognitive-health-tracker" className="space-y-6">
      {/* Companion Selector & Highlight Banner */}
      <div className="bg-white p-6 rounded-3xl shadow-md border border-teal-100">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Active Companion Module
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
              {activeCompanion}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Selected companion scaffolding tailored for your daily routine.
            </p>
          </div>

          <button
            id="btn-retake-screening-dashboard"
            onClick={onRetakeScreening}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1E5443] hover:bg-[#164234] shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Re-Take 30-Q Assessment</span>
          </button>
        </div>

        {/* Switcher Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {(['ADHD Companion', 'MCI Companion', 'Dementia Companion'] as CompanionType[]).map((comp) => {
            const isSelected = activeCompanion === comp;
            const isRecommended = user.recommendedCompanion === comp;

            return (
              <button
                key={comp}
                id={`btn-select-companion-${comp.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => onSelectCompanion(comp)}
                className={`p-4 rounded-2xl border text-left transition-all relative ${
                  isSelected
                    ? 'border-teal-600 bg-teal-50/80 shadow-xs ring-2 ring-teal-500/30'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                }`}
              >
                {isRecommended && (
                  <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                    Recommended
                  </span>
                )}
                <span className="text-sm font-bold text-slate-900 block">{comp}</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {comp === 'ADHD Companion' && 'Focus, Attention & Task Structure'}
                  {comp === 'MCI Companion' && 'Early Memory Changes & Retrieval'}
                  {comp === 'Dementia Companion' && 'Orientation & Daily Scaffolding'}
                </span>
                {isSelected && (
                  <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-teal-700">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Selected Mode
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Screening Score Summary Card */}
      {screeningResult ? (
        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-300">
                <Brain className="w-4 h-4 text-teal-400" /> Recent Baseline Assessment
              </div>
              <h3 className="text-xl font-bold">Cognitive Screening Breakdown</h3>
              <p className="text-xs text-slate-300 max-w-lg">
                Screening conducted on {screeningResult.timestamp}. Your total self-reported baseline score is{' '}
                <span className="font-bold text-teal-300">{screeningResult.totalScore} / {screeningResult.maxPossible}</span> ({screeningResult.percentage}%).
              </p>
            </div>

            <div className="flex items-center gap-4 bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 shrink-0">
              <div className="text-center">
                <span className="text-xs text-slate-400 uppercase font-bold block">Baseline Score</span>
                <span className="text-3xl font-black text-teal-400">{screeningResult.percentage}%</span>
              </div>
              <div className="h-10 w-px bg-slate-700" />
              <div className="text-center">
                <span className="text-xs text-slate-400 uppercase font-bold block">Recommended</span>
                <span className="text-xs font-bold text-amber-300">{screeningResult.recommendedCompanion}</span>
              </div>
            </div>
          </div>

          {/* Domain Breakdown Grid */}
          <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {(Object.entries(screeningResult.domainScores) as [string, { total: number; count: number; avg: number }][]).map(([cat, val]) => (
              <div key={cat} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase block truncate">{cat}</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-base font-bold text-white">{val.avg}</span>
                  <span className="text-[10px] text-slate-400">/ 4 avg</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-teal-50/60 border border-teal-200 p-6 rounded-3xl text-center">
          <Brain className="w-10 h-10 text-teal-600 mx-auto mb-2" />
          <h3 className="text-lg font-bold text-slate-900">No Screening Baseline Recorded</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto mt-1 mb-4">
            Take our 30-question cognitive assessment across 10 sections to receive an intelligent companion recommendation and baseline score.
          </p>
          <button
            onClick={onRetakeScreening}
            className="px-6 py-3 bg-[#1E5443] hover:bg-[#164234] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
          >
            Start 30-Question Assessment Now
          </button>
        </div>
      )}
    </div>
  );
};
