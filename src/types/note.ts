export interface NoteSegment {
  id: string;
  text: string;
  confidence: number; // 0 - 1 logprob derived
  start: number; // seconds in audio file
  end: number; // seconds in audio file
  section: "HPI" | "Assessment" | "Plan" | "Vitals" | "Follow-up";
  rationale: string;
}

export interface VoiceQaFlag {
  id: string;
  title: string;
  description: string;
  contradiction: string;
  suggestedAction: string;
  evidenceSegments: string[];
  severity: "info" | "warning" | "critical";
  agentConfidence: number; // 0 - 1
}

export interface EvidenceChunk {
  id: string;
  title: string;
  origin: "EHR" | "Guideline" | "Transcript";
  snippet: string;
  score: number; // retrieval score 0 - 1
}

export interface NoteMetrics {
  averageConfidence: number;
  flaggedPercent: number;
  tokensFlagged: number;
  deltaVerificationMinutes: number;
}

export interface NoteResponse {
  encounterId: string;
  patientName: string;
  clinicianName: string;
  createdAt: string;
  audioUrl: string;
  summary: string;
  whisperModel: string;
  metrics: NoteMetrics;
  segments: NoteSegment[];
  sources: EvidenceChunk[];
  qaFindings: VoiceQaFlag[];
}

