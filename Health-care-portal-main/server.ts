import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import {
  classifyFromDomainAverages,
  getRoutingForCategory,
  DomainAverages,
} from "./src/utils/classification";
import { ResearchCategory } from "./src/types";

dotenv.config();

const VALID_CATEGORY_LABELS = new Set<ResearchCategory>([
  "ADHD-like Pattern (Inattentive/Hyperactive)",
  "Mild Cognitive Impairment-like Pattern (MCI)",
  "Significant Cognitive/Functional Impairment Pattern",
  "Subclinical / Typical Cognitive Pattern",
  "Other / Indeterminate Pattern",
]);

// domainScores arrives from the client shaped exactly like scoring.ts's
// `domainScores` return value: keyed by display category name, each an
// object with { total, count, avg }. This maps those category names to
// the plain averages classifyFromDomainAverages() expects.
type ClientDomainScores = Record<string, { total: number; count: number; avg: number }>;

function toDomainAverages(domainScores: ClientDomainScores | undefined): DomainAverages {
  const avg = (category: string): number => domainScores?.[category]?.avg ?? 0;
  return {
    attention: avg("Attention & Focus"),
    hyperactivity: avg("Hyperactivity"),
    impulsivity: avg("Impulsivity"),
    childhood: avg("Developmental History"),
    memory: avg("Memory"),
    executive: avg("Executive Function"),
    language: avg("Language"),
    orientation: avg("Orientation"),
    cognitiveDecline: avg("Cognitive Change"),
    functionalImpairment: avg("Daily Functioning"),
  };
}

function buildDeterministicResponse(domainScores: ClientDomainScores | undefined) {
  const classification = classifyFromDomainAverages(toDomainAverages(domainScores));

  const keyTakeawaysByCategory: Record<ResearchCategory, string[]> = {
    "ADHD-like Pattern (Inattentive/Hyperactive)": [
      "Use external structure — timers, checklists, and visible reminders — to support attention and task follow-through.",
      "Break tasks into smaller steps to reduce the impact of impulsivity on daily routines.",
      "Sharing this baseline with a clinician can help clarify whether further ADHD-specific evaluation would be useful.",
    ],
    "Mild Cognitive Impairment-like Pattern (MCI)": [
      "Track memory and executive-function changes over time rather than relying on a single check-in.",
      "Use consistent daily routines and external memory aids (notes, calendars) to reduce cognitive load.",
      "Discuss these baseline results with a physician, particularly the memory and daily-functioning domains.",
    ],
    "Significant Cognitive/Functional Impairment Pattern": [
      "These results suggest meaningful impact on daily functioning — a clinical evaluation is strongly recommended.",
      "Involve a trusted family member or caregiver in follow-up and any care planning.",
      "Keep a simple daily log of memory or functional changes to share with a clinician.",
    ],
    "Subclinical / Typical Cognitive Pattern": [
      "Maintain the habits that are working — consistent sleep, routine, and mental engagement support continued cognitive wellness.",
      "Re-screen periodically, since this is a one-time snapshot rather than an ongoing diagnosis.",
    ],
    "Other / Indeterminate Pattern": [
      "Consider retaking the screening, ideally answering every item, since partial or mixed answers can blur the pattern.",
      "Treat this result as inconclusive rather than reassuring or concerning either way.",
    ],
  };

  return {
    scoringMethod: "deterministic" as const,
    scoringFallback: false,
    researchCategory: classification.researchCategory,
    researchCategoryExplanation: classification.researchCategoryExplanation,
    recommendedCompanion: classification.recommendedCompanion,
    action: classification.action,
    module: classification.module,
    exitMessage: classification.exitMessage,
    summary:
      classification.action === "exit"
        ? classification.exitMessage
        : `Based on your deterministic baseline response profile, the ${classification.recommendedCompanion} offers targeted scaffolding for your daily routine and cognitive wellness.`,
    keyTakeaways: keyTakeawaysByCategory[classification.researchCategory],
    focusTip:
      "Maintain consistent sleep, hydration, and structured pacing throughout your day for optimal brain vitality.",
    extractedFeatures: [
      "Category calculated through the shared, transparent rule-based classifier (same logic used client-side).",
    ],
  };
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Initialize Gemini AI client server-side
  let ai: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  // API Route for health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", aiEnabled: !!ai });
  });

  // API Route for Cognitive AI Analysis & LLM-assisted Feature Extraction
  app.post("/api/screening/analyze", async (req, res) => {
    const { user, scores, domainScores, useLLM, responses, questions } =
      req.body || {};

    // If user did not request LLM extraction or if AI client is unavailable:
    if (!useLLM || !ai) {
      const deterministic = buildDeterministicResponse(domainScores);
      return res.json({
        ...deterministic,
        scoringFallback: !!useLLM && !ai,
      });
    }

    // Format response breakdown for Gemini LLM feature extraction
    const answeredDetails = (questions || [])
      .map((q: any) => {
        const val = responses ? responses[q.id] : undefined;
        return `[${q.sectionTitle} / ${q.domain}] Q${q.id}: "${q.text}" -> Score: ${
          val ?? "Unanswered"
        }/4 (Scale: ${q.scaleType})`;
      })
      .join("\n");

    // Compute the deterministic classification up front so it can (a) seed
    // the prompt as a baseline signal and (b) act as the guardrail/fallback
    // if the LLM returns something invalid.
    const deterministic = classifyFromDomainAverages(toDomainAverages(domainScores));

    const prompt = `You are a clinical-research cognitive wellness AI analyzing a 30-item multidomain screening instrument.

Analyze these 30-item cognitive self-reflection assessment metrics and responses for a user:

User Profile: Age ${user?.age || "N/A"}, Gender: ${user?.gender || "N/A"}
Total Baseline Score: ${scores?.totalScore || 0} / ${scores?.maxPossible || 120}
Deterministic Domain Scores: ${JSON.stringify(domainScores || {})}
Deterministic Baseline Category (computed by rule-based scoring — treat as a strong prior, only deviate if the raw responses clearly justify it): ${deterministic.researchCategory}

Detailed 30 Question Responses across 10 Sections:
${answeredDetails}

Task:
Perform research-extraction LLM feature analysis across the 10 sections:
1. Attention & Focus (Q1-7)
2. Hyperactivity (Q8-9)
3. Impulsivity (Q10-11)
4. Developmental History (Q12-14)
5. Memory (Q15-19)
6. Executive Function (Q20-22)
7. Language (Q23)
8. Orientation (Q24)
9. Cognitive Change (Q25-27)
10. Daily Functioning (Q28-30)

Place the overall pattern into EXACTLY ONE of these five research categories — these are the only valid values, do not invent others:
1. "ADHD-like Pattern (Inattentive/Hyperactive)" -> routes the user to the ADHD module
2. "Mild Cognitive Impairment-like Pattern (MCI)" -> routes the user to the MCI module
3. "Significant Cognitive/Functional Impairment Pattern" -> routes the user to the Dementia module
4. "Subclinical / Typical Cognitive Pattern" -> no module; the app shows a brief "probably healthy" message and exits the screening flow
5. "Other / Indeterminate Pattern" -> no module; use whenever the pattern is mixed or ambiguous — the app shows a "diagnosis help is not available" message and exits the screening flow

Provide a reassuring, compassionate, empowering, non-diagnostic response in strict JSON. For categories 4 and 5, set "recommendedCompanion" to null since no module applies:
{
  "scoringMethod": "llm",
  "researchCategory": "ADHD-like Pattern (Inattentive/Hyperactive)" | "Mild Cognitive Impairment-like Pattern (MCI)" | "Significant Cognitive/Functional Impairment Pattern" | "Subclinical / Typical Cognitive Pattern" | "Other / Indeterminate Pattern",
  "researchCategoryExplanation": "A 1-2 sentence explanation of why this research category fits their response pattern.",
  "recommendedCompanion": "ADHD Companion" | "MCI Companion" | "Dementia Companion" | null,
  "summary": "A 2-3 sentence personalized summary highlighting their strengths and why this companion module fits (or, for categories 4/5, a short reassuring closing note).",
  "keyTakeaways": ["Actionable strategy 1", "Actionable strategy 2", "Actionable strategy 3"],
  "focusTip": "One daily habit tip for brain wellness",
  "extractedFeatures": [
    "Key extracted feature 1 regarding attention or memory profile",
    "Key extracted feature 2 regarding daily functioning or developmental continuity",
    "Key extracted feature 3 regarding routine scaffolding needs"
  ]
}`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "{}";
      const parsedData = JSON.parse(text);

      // Guardrail: only accept one of the 5 known categories. Anything else
      // (hallucinated label, missing field, wrong casing) falls back to the
      // deterministic classification instead of silently defaulting to ADHD.
      const category: ResearchCategory = VALID_CATEGORY_LABELS.has(
        parsedData.researchCategory
      )
        ? parsedData.researchCategory
        : deterministic.researchCategory;

      // action/module/exitMessage/companion are ALWAYS derived server-side
      // from the (validated) category via the shared routing table — the
      // LLM never decides routing directly, and an override to a *different*
      // valid category still routes correctly (unlike re-running the
      // domain-score classifier, which would just reproduce the original
      // deterministic category regardless of the LLM's choice).
      const routing = getRoutingForCategory(category);

      parsedData.researchCategory = category;
      parsedData.recommendedCompanion = routing.recommendedCompanion;
      parsedData.action = routing.action;
      parsedData.module = routing.module;
      parsedData.exitMessage = routing.exitMessage;
      if (routing.action === "exit") {
        parsedData.summary = routing.exitMessage;
      }

      parsedData.scoringMethod = "llm";
      parsedData.scoringFallback = false;

      return res.json(parsedData);
    } catch (err: any) {
      console.error("Error running LLM feature extraction with Gemini:", err);
      // Automatic graceful fallback to deterministic scoring as promised in the UI
      const fallback = buildDeterministicResponse(domainScores);
      return res.json({ ...fallback, scoringFallback: true });
    }
  });

  // Vite middleware for dev or static serving for prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CogniCare Health server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
