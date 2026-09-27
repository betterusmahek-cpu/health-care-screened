import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, HelpCircle, Shield, Sparkles, Leaf, Cpu } from 'lucide-react';
import { SCREENING_QUESTIONS, getScaleOptions } from '../../data/questions';
import { ScreeningQuestion, ScreeningResult, User } from '../../types';
import { calculateScreeningResult } from '../../utils/scoring';
import { ScreeningResultModal } from './ScreeningResultModal';

interface CognitiveScreeningProps {
  user: User;
  onScreeningComplete: (result: ScreeningResult) => void;
  onCancel?: () => void;
}

export const CognitiveScreening: React.FC<CognitiveScreeningProps> = ({
  user,
  onScreeningComplete,
  onCancel,
}) => {
  // Screening steps: 'intro' -> 'questions' -> 'result'
  const [step, setStep] = useState<'intro' | 'questions'>('intro');
  const [useLLM, setUseLLM] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [finalResult, setFinalResult] = useState<ScreeningResult | null>(null);

  const questions: ScreeningQuestion[] = SCREENING_QUESTIONS;
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);
  const currentAnswer = responses[currentQuestion?.id];

  const handleSelectOption = (value: number) => {
    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleFinishScreening();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleFinishScreening = async () => {
    setIsAnalyzing(true);

    // Baseline deterministic scoring
    const baseResult = calculateScreeningResult(responses, questions);

    try {
      // Call server endpoint for analysis (or LLM feature extraction)
      const res = await fetch('/api/screening/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: { age: user.age, gender: user.gender },
          scores: { totalScore: baseResult.totalScore, maxPossible: baseResult.maxPossible },
          domainScores: baseResult.domainScores,
          researchCategory: baseResult.researchCategory,
          researchCategoryExplanation: baseResult.researchCategoryExplanation,
          recommendedCompanion: baseResult.recommendedCompanion,
          useLLM,
          responses,
          questions,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        baseResult.scoringMethod = data.scoringMethod || (useLLM ? 'llm' : 'deterministic');
        baseResult.scoringFallback = data.scoringFallback ?? false;
        if ('recommendedCompanion' in data) {
          baseResult.recommendedCompanion = data.recommendedCompanion;
        }
        if (data.researchCategory) {
          baseResult.researchCategory = data.researchCategory;
        }
        if (data.researchCategoryExplanation) {
          baseResult.researchCategoryExplanation = data.researchCategoryExplanation;
        }
        if (data.action) {
          baseResult.action = data.action;
        }
        if ('module' in data) {
          baseResult.module = data.module;
        }
        if ('exitMessage' in data) {
          baseResult.exitMessage = data.exitMessage;
        }
        if (data.extractedFeatures) {
          baseResult.extractedFeatures = data.extractedFeatures;
        }
        baseResult.aiAnalysis = {
          summary: data.summary,
          keyTakeaways: data.keyTakeaways || [],
          focusTip: data.focusTip || '',
        };
      } else {
        baseResult.scoringMethod = 'deterministic';
        baseResult.scoringFallback = useLLM;
      }
    } catch (err) {
      console.warn('API error during screening analysis; falling back to deterministic scoring.', err);
      baseResult.scoringMethod = 'deterministic';
      baseResult.scoringFallback = useLLM;
    }

    setIsAnalyzing(false);
    setFinalResult(baseResult);
  };

  const handleModalContinue = () => {
    if (finalResult) {
      onScreeningComplete(finalResult);
    }
  };

  // 1. Loading / Analyzing View
  if (isAnalyzing) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-[#EEF5F1] text-[#1E5443] flex items-center justify-center mb-6 shadow-sm border border-[#CFDFD6] animate-pulse">
          {useLLM ? <Cpu className="w-8 h-8 text-[#1E5443] animate-spin" /> : <Leaf className="w-8 h-8" />}
        </div>
        <h3 className="text-2xl font-extrabold text-[#14261C] mb-2">
          {useLLM ? 'Running LLM-Assisted Feature Extraction...' : 'Calculating Deterministic Domain Scores...'}
        </h3>
        <p className="text-xs sm:text-sm text-[#4E6155] max-w-md mb-6 leading-relaxed">
          {useLLM
            ? 'Evaluating your answers across 10 sections using Gemini research-extraction models to assess attention, memory retention, and daily functioning.'
            : 'Scoring responses across 10 structured sections and calibrating baseline support recommendations.'}
        </p>
        <div className="w-64 h-2.5 bg-[#E4ECE7] rounded-full overflow-hidden">
          <div className="h-full bg-[#1E5443] animate-pulse w-full rounded-full" />
        </div>
      </div>
    );
  }

  // 2. Final Result Modal View
  if (finalResult) {
    return (
      <ScreeningResultModal
        result={finalResult}
        user={user}
        onContinueToDashboard={handleModalContinue}
      />
    );
  }

  // 3. Pre-Screening Overview Screen (Exact Match to uploaded image)
  if (step === 'intro') {
    return (
      <div className="w-full min-h-screen bg-[#FDFBF7] text-[#192A20] font-sans antialiased">
        {/* Top Minimal Research Instrument Header matching image top left */}
        <header className="border-b border-[#E7ECE8] bg-[#FDFBF7] px-6 sm:px-12 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Target/Compass mark icon from uploaded image top left */}
            <div className="w-6 h-6 rounded-full border border-[#2B4B3D] flex items-center justify-center relative">
              <div className="w-2.5 h-2.5 rounded-full bg-[#1E5443] absolute top-1 left-1" />
            </div>
            <div>
              <h1 className="font-mono text-[13px] font-bold tracking-tight text-[#16291E] leading-tight">
                Multidomain Screening Instrument
              </h1>
              <p className="font-mono text-[11px] text-[#55695C] leading-none mt-0.5">
                Research prototype &bull; not a diagnostic tool
              </p>
            </div>
          </div>

          {onCancel && (
            <button
              onClick={onCancel}
              className="text-xs font-semibold text-[#5A6D60] hover:text-[#16291E] transition-colors cursor-pointer"
            >
              Exit to Dashboard
            </button>
          )}
        </header>

        {/* Main Content Area matching exact proportions and layout */}
        <main className="max-w-2xl mx-auto px-6 sm:px-8 pt-12 pb-20">
          {/* Subheader tracking uppercase */}
          <div className="font-mono text-[11px] tracking-[0.2em] font-semibold text-[#3D6B56] uppercase mb-4">
            Before You Begin
          </div>

          {/* Main Title with serif styling matching image */}
          <h2 className="text-3xl sm:text-[34px] font-serif font-bold text-[#14261C] leading-[1.2] tracking-tight mb-5">
            A research screening instrument for attention and cognitive patterns
          </h2>

          {/* Lead Paragraph */}
          <p className="text-sm sm:text-[15px] text-[#425549] leading-relaxed mb-6 font-normal">
            This questionnaire asks 30 questions about attention, memory, thinking, and daily functioning. Your answers are converted into a set of domain scores and passed through a transparent, rule-based classifier that places the overall pattern into one of five research categories.
          </p>

          {/* "This is not a medical diagnosis" Callout Box (Exact match to uploaded image) */}
          <div className="bg-[#EEF5F1] border border-[#D5E4DB] rounded-xl p-5 mb-8 text-[#283C30]">
            <h3 className="font-bold text-sm text-[#183628] mb-1.5">
              This is not a medical diagnosis.
            </h3>
            <p className="text-xs sm:text-[13px] text-[#3D5245] leading-relaxed">
              The result is a <strong className="font-bold text-[#183628]">research screening classification</strong>, not a clinical evaluation. It has not been validated against DSM-5 criteria or any diagnostic reference standard. Please discuss any concerns about your attention, memory, or thinking with a qualified healthcare professional.
            </p>
          </div>

          {/* Key Facts / Numbers Grid (Exact match to uploaded image) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5 mb-9 text-xs sm:text-[13px] text-[#3E5246] leading-relaxed">
            <div className="flex items-baseline gap-3">
              <span className="font-bold text-[#183628] text-sm shrink-0 w-3">30</span>
              <span>questions, grouped into 10 short sections</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="font-bold text-[#183628] text-sm shrink-0 w-3">~6</span>
              <span>minutes to complete</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="font-bold text-[#183628] text-sm shrink-0 w-3">0</span>
              <span>identifying information collected — no name, phone, or ID is requested</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="font-bold text-[#183628] text-sm shrink-0 w-3">—</span>
              <span>responses are not stored by default</span>
            </div>
          </div>

          {/* LLM-Assisted Feature Extraction Checkbox Card (Exact match to uploaded image) */}
          <div className="bg-[#FAF8F5] border border-[#D3DED6] rounded-xl p-5 sm:p-6 mb-8">
            <label className="flex items-start gap-3.5 cursor-pointer select-none">
              <input
                type="checkbox"
                id="checkbox-use-llm"
                checked={useLLM}
                onChange={(e) => setUseLLM(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[#9CB0A2] text-[#1E5443] focus:ring-[#1E5443] accent-[#1E5443] cursor-pointer"
              />
              <div className="space-y-1.5 flex-1">
                <span className="block text-xs sm:text-sm font-bold text-[#14261C]">
                  Use LLM-assisted feature extraction
                </span>
                <p className="text-xs sm:text-[12.5px] text-[#4E6155] leading-relaxed">
                  Routes your responses through a research-extraction LLM step instead of the deterministic scorer. Requires an API key configured on the server; if unavailable or it fails, results automatically fall back to deterministic scoring and the results page will say so.
                </p>
              </div>
            </label>
          </div>

          {/* Begin Screening Action Button (Matching exact button in uploaded image: pine green, rounded, white text) */}
          <div>
            <button
              id="btn-begin-screening"
              onClick={() => setStep('questions')}
              className="px-7 py-3 bg-[#1E5443] hover:bg-[#184637] active:bg-[#12362a] text-white font-medium text-sm rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Begin screening</span>
            </button>
          </div>
        </main>
      </div>
    );
  }

  // 4. Questions Runner Screen
  const scaleOptions = getScaleOptions(currentQuestion.scaleType);

  const getScaleLabel = (type: string) => {
    switch (type) {
      case 'change':
        return 'Change Scale (0 = No change → 4 = Severe change)';
      case 'independence':
        return 'Independence Scale (0 = Independent → 4 = Unable to perform)';
      case 'frequency':
      default:
        return 'Frequency Scale (0 = Never → 4 = Very often)';
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6">
      {/* Header & Section Indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#1E5443] bg-[#EAF2ED] px-3.5 py-1.5 rounded-full border border-[#D1E2D7]">
          <span>{currentQuestion.sectionTitle}</span>
          <span className="text-[#899B8F]">•</span>
          <span className="font-mono text-[11px] text-[#2C6B56]">domain: {currentQuestion.domain}</span>
        </div>
        <button
          onClick={() => setStep('intro')}
          className="text-xs font-semibold text-[#5C6E63] hover:text-[#14261C] transition-colors"
        >
          Assessment Info
        </button>
      </div>

      {/* Progress Bar & Counter */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-bold text-[#56655A] mb-2">
          <span>
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <div className="flex items-center gap-2">
            {useLLM && (
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1E5443] bg-[#EAF2ED] px-2 py-0.5 rounded-md border border-[#CFDFD6]">
                LLM Mode Active
              </span>
            )}
            <span>{progressPercent}% Complete</span>
          </div>
        </div>
        <div className="w-full h-2.5 bg-[#E4ECE7] rounded-full overflow-hidden border border-[#D1DDD7]">
          <div
            className="h-full bg-[#1E5443] transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 shadow-sm border border-[#E3E8E2] relative overflow-hidden mb-6">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <span className="px-3 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-wider bg-[#EAF2ED] text-[#1E5443]">
            {currentQuestion.category}
          </span>
          <span className="text-xs text-[#5C6E63] flex items-center gap-1 font-medium">
            <HelpCircle className="w-3.5 h-3.5 text-[#1E5443]" /> {getScaleLabel(currentQuestion.scaleType)}
          </span>
        </div>

        <h3 id={`screening-question-${currentQuestion.id}`} className="text-lg sm:text-xl font-extrabold text-[#14261C] mb-6 leading-snug">
          {currentQuestion.text}
        </h3>

        {/* 0–4 Scale Options */}
        <div className="space-y-3">
          {scaleOptions.map((opt) => {
            const isSelected = currentAnswer === opt.value;
            return (
              <button
                key={opt.value}
                id={`btn-scale-option-${currentQuestion.id}-${opt.value}`}
                onClick={() => handleSelectOption(opt.value)}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'border-[#1E5443] bg-[#EAF2ED] shadow-2xs ring-2 ring-[#1E5443]/20'
                    : 'bg-white border-[#E3E8E2] hover:bg-[#F4F7F3] hover:border-[#CBD5CA]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 ${
                      isSelected ? 'bg-[#1E5443] text-white' : 'bg-[#FAF8F5] text-[#1C251F] border border-[#D5DDD3]'
                    }`}
                  >
                    {opt.value}
                  </div>
                  <div>
                    <p className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-[#14261C]' : 'text-[#2C382F]'}`}>
                      {opt.label}
                    </p>
                    <p className="text-[11px] text-[#5C6E63]">{opt.description}</p>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-[#1E5443] text-white flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        <button
          id="btn-screening-prev"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 border transition-all cursor-pointer ${
            currentIndex === 0
              ? 'opacity-40 cursor-not-allowed border-[#E3E8E2] text-slate-400'
              : 'border-[#CBD5CA] text-[#1C251F] bg-white hover:bg-[#F2F5F2]'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          id="btn-screening-next"
          onClick={handleNext}
          disabled={currentAnswer === undefined}
          className={`px-7 py-3 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xs flex items-center gap-2 transition-all cursor-pointer ${
            currentAnswer === undefined
              ? 'opacity-50 cursor-not-allowed bg-slate-400'
              : 'bg-[#1E5443] hover:bg-[#164234]'
          }`}
        >
          <span>{currentIndex === totalQuestions - 1 ? 'Finish & See Results' : 'Next Question'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-8 text-center text-xs text-[#6A786C] flex items-center justify-center gap-1.5">
        <Shield className="w-3.5 h-3.5 text-[#1E5443]" />
        <span>Self-reflection assessment across 10 sections</span>
      </div>
    </div>
  );
};
