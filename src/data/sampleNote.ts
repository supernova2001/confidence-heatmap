import type { NoteResponse } from "@/types/note";

export const sampleNote: NoteResponse = {
  encounterId: "enc-sully-demo-091",
  patientName: "Devon Patel",
  clinicianName: "Dr. Ava Singh",
  createdAt: new Date("2025-11-21T08:15:00Z").toISOString(),
  whisperModel: "whisper-large-v3-turbo",
  audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  summary:
    "Patient seen for lingering post-viral cough. No red flag symptoms. Mild wheeze addressed with rescue inhaler refill and humidified air guidance.",
  metrics: {
    averageConfidence: 0.82,
    flaggedPercent: 0.24,
    tokensFlagged: 46,
    deltaVerificationMinutes: 4.6,
  },
  segments: [
    {
      id: "seg-1",
      section: "HPI",
      text: "38 y/o reports dry cough persisting for three weeks following viral URI.",
      confidence: 0.93,
      start: 4.2,
      end: 10.1,
      rationale: "High logprob cluster (-0.12 avg) and aligned with clear speech.",
    },
    {
      id: "seg-2",
      section: "HPI",
      text: "Symptoms worse when patient lies flat; notes metallic taste at night.",
      confidence: 0.63,
      start: 12.4,
      end: 21.8,
      rationale:
        "Low logprob tokens on 'metallic' due to crosstalk, flagged for review.",
    },
    {
      id: "seg-3",
      section: "HPI",
      text: "Denies fever, chills, or chest pain; endorses mild nighttime wheeze.",
      confidence: 0.79,
      start: 23.0,
      end: 34.5,
      rationale: "Composed from two overlapping utterances; Whisper alignment ok.",
    },
    {
      id: "seg-4",
      section: "Vitals",
      text: "Vitals stable in triage: BP 118/76, HR 74, SpO2 99% RA, afebrile.",
      confidence: 0.97,
      start: 38.0,
      end: 44.2,
      rationale: "Structured data fused from EHR, no acoustic uncertainty.",
    },
    {
      id: "seg-5",
      section: "Assessment",
      text: "Most consistent with post-viral cough with reflux contribution.",
      confidence: 0.84,
      start: 46.5,
      end: 52.8,
      rationale: "Model agrees with highest-ranked chunk (EHR note 6/4).",
    },
    {
      id: "seg-6",
      section: "Assessment",
      text: "No imaging indicated today; low concern for pneumonia or PE.",
      confidence: 0.75,
      start: 53.1,
      end: 58.7,
      rationale: "Moderate certainty; contradictory guideline chunk at 0.41 score.",
    },
    {
      id: "seg-7",
      section: "Plan",
      text: "Refilled albuterol inhaler, instructed spacer use BID for a week.",
      confidence: 0.88,
      start: 60.2,
      end: 66.4,
      rationale: "Clear directive + confirmed medication list.",
    },
    {
      id: "seg-8",
      section: "Plan",
      text: "Recommended humidifier, honey-tea regimen, and reflux precautions.",
      confidence: 0.69,
      start: 67.0,
      end: 75.2,
      rationale:
        "Background clinic noise lowered logprobs; mark for optional playback.",
    },
    {
      id: "seg-9",
      section: "Follow-up",
      text: "Escalate if cough persists beyond two more weeks or hemoptysis develops.",
      confidence: 0.81,
      start: 76.5,
      end: 83.2,
      rationale: "Derived from guideline chunk, moderate retrieval score (.58).",
    },
  ],
  sources: [
    {
      id: "src-1",
      title: "EHR: Visit note - 6/4 chronic cough",
      origin: "EHR",
      snippet:
        "Patient responded to short prednisone taper previously; suspected reflux overlay.",
      score: 0.82,
    },
    {
      id: "src-2",
      title: "Transcript window 00:12-00:34",
      origin: "Transcript",
      snippet:
        '"...it gets worse at night and it tastes kind of metallic..." - patient statement',
      score: 0.71,
    },
    {
      id: "src-3",
      title: "CHEST Guideline: Subacute cough management",
      origin: "Guideline",
      snippet:
        "If imaging unremarkable and vitals stable, recommend conservative management and reflux mitigation.",
      score: 0.64,
    },
  ],
  qaFindings: [
    {
      id: "qa-1",
      title: "Reflux symptom lacks directed therapy",
      description:
        "Patient reports metallic taste and worsening cough when supine, but plan only mentions humidifier and spacer usage.",
      contradiction:
        "Transcript implies reflux contribution whereas plan omits any acid-suppression or reflux-specific intervention.",
      suggestedAction:
        "Consider adding a short PPI/H2 blocker trial or explicit reflux counseling follow-up.",
      evidenceSegments: ["seg-2", "seg-8"],
      severity: "warning",
      agentConfidence: 0.64,
    },
    {
      id: "qa-2",
      title: "No follow-up plan tied to escalation cue",
      description:
        "Follow-up section tells patient to escalate if cough persists beyond two weeks, but no actual appointment or outreach is scheduled.",
      contradiction:
        "Transcript emphasizes proactive escalation, yet plan lacks concrete follow-up scheduling or outreach assignment.",
      suggestedAction:
        "Schedule a telehealth check-in or send task to care team for 2-week follow-up if symptoms persist.",
      evidenceSegments: ["seg-9"],
      severity: "info",
      agentConfidence: 0.58,
    },
  ],
};

