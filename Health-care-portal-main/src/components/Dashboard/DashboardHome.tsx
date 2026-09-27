import React from 'react';
import { Leaf, ShieldAlert, Target, Shield, ArrowRight, Sparkles, Brain, RotateCcw } from 'lucide-react';
import { CompanionType, ScreeningResult, User } from '../../types';

interface DashboardHomeProps {
  user: User;
  screeningResult: ScreeningResult | null;
  onOpenCompanion: (comp: CompanionType) => void;
  onStartScreening: () => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  user,
  screeningResult,
  onOpenCompanion,
  onStartScreening,
}) => {
  const recommended = screeningResult
    ? screeningResult.recommendedCompanion
    : user.hasCompletedScreening && user.recommendedCompanion
    ? user.recommendedCompanion
    : undefined;

  return (
    <div id="cognicompanion-dashboard-home" className="space-y-8 py-2 max-w-5xl mx-auto">
      {/* 1. Brand Hero / Header Section */}
      <div className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#3F5244] text-[#EBF1EB] shadow-sm mb-1">
          <Leaf className="w-6 h-6" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1C251F] tracking-tight">
          CogniCompanion
        </h1>
        <p className="text-sm sm:text-base text-[#56655A] font-medium max-w-xl mx-auto leading-relaxed">
          Your companion for focus, memory, and mind — through games, music, and conversation.
        </p>
      </div>

      {/* 2. Medical Disclaimer Notice Banner (Matching Image) */}
      <div className="bg-[#FFF8F3] border border-[#F2D0BD] rounded-2xl p-5 sm:p-6 text-[#3D322B] shadow-2xs">
        <div className="flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-full bg-[#FCE8D8] text-[#D98A5B] flex items-center justify-center shrink-0 mt-0.5">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="space-y-1 text-xs sm:text-sm">
            <h3 className="font-bold text-[#2D2621]">
              CogniCompanion is a support and wellness tool, not a diagnostic or medical service.
            </h3>
            <p className="text-[#685A50] leading-relaxed">
              This platform cannot diagnose ADHD, dementia, or MCI. If you have concerns about yourself or a loved one, please consult a qualified healthcare professional. The activities here are meant to support wellbeing alongside, not replace, professional medical care.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Assessment Recommendation Prompt (If user took assessment or needs to) */}
      {screeningResult ? (
        <div className="bg-[#EEF2ED] border border-[#D5DDD3] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1E5443] text-white flex items-center justify-center font-bold">
              <Brain className="w-5 h-5 text-[#89D1B0]" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#1E5443] block">
                Multidomain Screening Completed ({screeningResult.timestamp})
              </span>
              <p className="text-xs sm:text-sm font-bold text-[#1C251F]">
                Research Classification: <span className="text-[#14261C] font-semibold">{screeningResult.researchCategory || 'Typical / Subclinical Pattern'}</span>
                {screeningResult.recommendedCompanion ? (
                  <> &bull; Suggested: <span className="text-[#1E5443] font-extrabold">{screeningResult.recommendedCompanion}</span></>
                ) : (
                  <> &bull; <span className="text-[#56655A] font-semibold">No module suggested</span></>
                )}
                {screeningResult.scoringMethod === 'llm' && (
                  <span className="ml-2 text-[10px] bg-[#EAF2ED] text-[#1E5443] font-bold px-2 py-0.5 rounded-full border border-[#D1E2D7]">
                    LLM Extracted
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onStartScreening}
            className="px-4 py-2 bg-white hover:bg-[#FAF8F5] text-[#1E5443] border border-[#C2CFC0] rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Re-Take 30-Q Assessment
          </button>
        </div>
      ) : (
        <div className="bg-[#EEF2ED] border border-[#D5DDD3] rounded-2xl p-5 text-center sm:text-left sm:flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-[#1C251F] flex items-center justify-center sm:justify-start gap-1.5">
              <Sparkles className="w-4 h-4 text-[#1E5443]" /> Take the 30-Question Cognitive Self-Reflection Assessment
            </h3>
            <p className="text-xs text-[#56655A] mt-0.5">
              30 questions, grouped into 10 short sections (~6 minutes) with optional LLM-assisted feature extraction.
            </p>
          </div>
          <button
            onClick={onStartScreening}
            className="mt-3 sm:mt-0 px-6 py-3 bg-[#1E5443] hover:bg-[#164234] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs shrink-0 flex items-center gap-2 mx-auto sm:mx-0 cursor-pointer"
          >
            <span>Start 30-Q Screening</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. Three Companion Cards Grid (Matching Exact Screenshot Layout & Colors) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {/* CARD 1: ADHD */}
        <div
          className={`rounded-3xl p-6 sm:p-7 border flex flex-col justify-between transition-all ${
            recommended === 'ADHD Companion'
              ? 'bg-[#EEF2ED] border-[#3F5244] ring-2 ring-[#3F5244]/20 shadow-sm'
              : 'bg-[#F2F5F2] border-[#E2E8E1] hover:border-[#CBD5CA]'
          }`}
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E2E8E1] text-[#3F5244] flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#1C251F]">ADHD</h2>
                {recommended === 'ADHD Companion' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-[#E0986C] text-white rounded-full">
                    Recommended
                  </span>
                )}
              </div>
              <p className="text-xs text-[#56655A] font-medium mt-1">
                Support for focus and attention
              </p>
            </div>
          </div>

          <div className="pt-6">
            <button
              id="btn-open-adhd-companion"
              onClick={() => onOpenCompanion('ADHD Companion')}
              className="w-full py-3 px-4 rounded-full bg-[#3F5244] hover:bg-[#324237] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
            >
              <span>Open ADHD Companion</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CARD 2: Dementia */}
        <div
          className={`rounded-3xl p-6 sm:p-7 border flex flex-col justify-between transition-all ${
            recommended === 'Dementia Companion'
              ? 'bg-[#FFF8F3] border-[#E0986C] ring-2 ring-[#E0986C]/30 shadow-sm'
              : 'bg-[#FFF9F5] border-[#F5E5D8] hover:border-[#ECC2A6]'
          }`}
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FCE8D8] text-[#D98A5B] flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#1C251F]">Dementia</h2>
                {recommended === 'Dementia Companion' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-[#E0986C] text-white rounded-full">
                    Recommended
                  </span>
                )}
              </div>
              <p className="text-xs text-[#56655A] font-medium mt-1">
                Support for memory and daily living
              </p>
            </div>
          </div>

          <div className="pt-6">
            <button
              id="btn-open-dementia-companion"
              onClick={() => onOpenCompanion('Dementia Companion')}
              className="w-full py-3 px-4 rounded-full bg-[#E0986C] hover:bg-[#D38759] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
            >
              <span>Open Dementia Companion</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CARD 3: MCI */}
        <div
          className={`rounded-3xl p-6 sm:p-7 border flex flex-col justify-between transition-all ${
            recommended === 'MCI Companion'
              ? 'bg-[#EEF2ED] border-[#3F5244] ring-2 ring-[#3F5244]/20 shadow-sm'
              : 'bg-[#F2F5F2] border-[#E2E8E1] hover:border-[#CBD5CA]'
          }`}
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E2E8E1] text-[#3F5244] flex items-center justify-center">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#1C251F]">MCI</h2>
                {recommended === 'MCI Companion' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-[#E0986C] text-white rounded-full">
                    Recommended
                  </span>
                )}
              </div>
              <p className="text-xs text-[#56655A] font-medium mt-1">
                Support for early cognitive changes
              </p>
            </div>
          </div>

          <div className="pt-6">
            <button
              id="btn-open-mci-companion"
              onClick={() => onOpenCompanion('MCI Companion')}
              className="w-full py-3 px-4 rounded-full bg-[#3F5244] hover:bg-[#324237] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
            >
              <span>Open MCI Companion</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
