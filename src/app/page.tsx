"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { NoteResponse, NoteSegment, VoiceQaFlag } from "@/types/note";

const LOW_CONFIDENCE_THRESHOLD = 0.8;

const confidenceColor = (confidence: number) => {
  if (confidence >= 0.9) return "#ecfdf3";
  if (confidence >= 0.8) return "#f5fbdc";
  if (confidence >= 0.7) return "#fff3c4";
  return "#ffe7ad";
};

const formatSeconds = (value: number) => {
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const severityStyles: Record<
  VoiceQaFlag["severity"],
  { badge: string; label: string; border: string }
> = {
  info: {
    badge: "bg-blue-100 text-blue-700",
    label: "Info",
    border: "border-blue-100",
  },
  warning: {
    badge: "bg-yellow-100 text-yellow-900",
    label: "Warning",
    border: "border-yellow-100",
  },
  critical: {
    badge: "bg-red-100 text-red-700",
    label: "Critical",
    border: "border-red-100",
  },
};

export default function Home() {
  const [note, setNote] = useState<NoteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [activeSegment, setActiveSegment] = useState<NoteSegment | null>(null);
  const [segmentEndTime, setSegmentEndTime] = useState<number | null>(null);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await fetch("/api/note", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Unable to load encounter data");
        }
        const payload = (await response.json()) as NoteResponse;
        setNote(payload);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNote();
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !segmentEndTime) return;

    const handleTimeUpdate = () => {
      if (audio.currentTime >= segmentEndTime) {
        audio.pause();
        setActiveSegment(null);
        setSegmentEndTime(null);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [segmentEndTime]);

  const handleSegmentClick = (segment: NoteSegment) => {
    if (!audioRef.current || !note) return;

    audioRef.current.currentTime = segment.start;
    audioRef.current.play();
    setActiveSegment(segment);
    setSegmentEndTime(segment.end);
  };

  const totalSeconds = useMemo(() => {
    if (!note) return 0;
    return note.segments.reduce((acc, segment) => acc + (segment.end - segment.start), 0);
  }, [note]);

  const flaggedSegments = useMemo(
    () => note?.segments.filter((segment) => segment.confidence < LOW_CONFIDENCE_THRESHOLD) ?? [],
    [note]
  );

  const segmentsById = useMemo(() => {
    if (!note) return {};
    return note.segments.reduce<Record<string, NoteSegment>>((acc, segment) => {
      acc[segment.id] = segment;
      return acc;
    }, {});
  }, [note]);

  const handleQaPlayback = (finding: VoiceQaFlag) => {
    if (!finding.evidenceSegments.length) return;
    const targetSegment = segmentsById[finding.evidenceSegments[0]];
    if (targetSegment) {
      handleSegmentClick(targetSegment);
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
        Loading encounter…
      </main>
    );
  }

  if (error || !note) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 text-red-500">
        {error ?? "Unable to load the note"}
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
        <div className="flex w-full items-center justify-end">
          <a
            href="/docs"
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-100"
          >
            Feature docs ↗
          </a>
        </div>
        <header className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-indigo-500">Confidence Heatmap</p>
              <h1 className="text-3xl font-semibold text-slate-900">
                {note.patientName} · {note.clinicianName}
              </h1>
              <p className="text-sm text-slate-500">
                Encounter {note.encounterId} · Whisper {note.whisperModel} ·{" "}
                {new Date(note.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600">
              <p className="text-xs uppercase tracking-wide text-slate-400">Summary</p>
              <p className="max-w-md text-base text-slate-700">{note.summary}</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Avg confidence" value={`${Math.round(note.metrics.averageConfidence * 100)}%`} />
            <MetricCard label="Tokens flagged" value={note.metrics.tokensFlagged} helper={`${Math.round(note.metrics.flaggedPercent * 100)}% of note`} />
            <MetricCard label="Verification delta" value={`${note.metrics.deltaVerificationMinutes.toFixed(1)}m`} helper="Time saved vs baseline" />
            <MetricCard label="Segments flagged" value={flaggedSegments.length} helper="Needs quick review" />
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-5 rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">AI Note w/ audio anchoring</p>
                <p className="text-sm text-slate-500">Click any highlighted span to replay that exact clip.</p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Stable</span>
                  <span>Review</span>
                </div>
                <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
                  {note.segments.map((segment) => (
                    <div
                      key={segment.id}
                      style={{
                        width: `${((segment.end - segment.start) / (totalSeconds || 1)) * 100}%`,
                        backgroundColor: confidenceColor(segment.confidence),
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {note.segments.map((segment) => {
                const isFlagged = segment.confidence < LOW_CONFIDENCE_THRESHOLD;
                const isActive = activeSegment?.id === segment.id;
                return (
                  <button
                    key={segment.id}
                    onClick={() => handleSegmentClick(segment)}
                    style={{ backgroundColor: confidenceColor(segment.confidence) }}
                    className={`w-full rounded-2xl border px-5 py-4 text-left transition-all ${
                      isActive ? "border-indigo-400 shadow-md" : "border-transparent hover:border-slate-200"
                    } ${isFlagged ? "ring-2 ring-yellow-400/60" : ""}`}
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                      <span className="rounded-full bg-white/70 px-2 py-0.5 text-slate-600">{segment.section}</span>
                      <span>{formatSeconds(segment.start)} – {formatSeconds(segment.end)}</span>
                      <span>conf {Math.round(segment.confidence * 100)}%</span>
                      {isFlagged && <span className="rounded-full bg-yellow-200 px-2 py-0.5 text-yellow-900">Review</span>}
                      {isActive && <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-indigo-700">Playing</span>}
                    </div>
                    <p className="mt-2 text-base text-slate-900">{segment.text}</p>
                    <p className="mt-2 text-sm text-slate-600">{segment.rationale}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="flex flex-col gap-5 rounded-3xl bg-white p-6 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-slate-900">Rapid verification queue</p>
              <p className="text-sm text-slate-500">Focus on the yellow spans first.</p>
              <div className="mt-4 space-y-3">
                {flaggedSegments.length === 0 && (
                  <p className="text-sm text-slate-500">All segments are above the confidence threshold.</p>
                )}
                {flaggedSegments.map((segment) => (
                  <div key={segment.id} className="rounded-2xl border border-yellow-200 bg-yellow-50 p-3">
                    <p className="text-sm font-medium text-yellow-900">{segment.text}</p>
                    <p className="text-xs text-yellow-800">
                      {formatSeconds(segment.start)} – {formatSeconds(segment.end)} · {Math.round(segment.confidence * 100)}% conf
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <p className="text-sm font-semibold text-slate-900">Source anchoring</p>
              <p className="text-sm text-slate-500">Top supporting evidence chunks.</p>
              <div className="mt-3 space-y-3">
                {note.sources.map((source) => (
                  <div key={source.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{source.origin}</p>
                    <p className="text-sm font-semibold text-slate-900">{source.title}</p>
                    <p className="text-sm text-slate-600">{source.snippet}</p>
                    <p className="mt-2 text-xs text-slate-500">Score {Math.round(source.score * 100)}%</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        {note.qaFindings.length > 0 && (
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Voice QA agent</p>
                <p className="text-sm text-slate-500">
                  Automatically scans transcript + plan for contradictions and suggests fixes.
                </p>
              </div>
              <p className="text-sm text-slate-500">{note.qaFindings.length} open follow-ups</p>
            </div>
            <div className="mt-5 space-y-4">
              {note.qaFindings.map((finding) => {
                const styles = severityStyles[finding.severity];
                return (
                  <div
                    key={finding.id}
                    className={`rounded-2xl border ${styles.border} bg-slate-50 p-5`}
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${styles.badge}`}>
                        {styles.label}
                      </span>
                      <p className="text-sm font-semibold text-slate-900">{finding.title}</p>
                      <span className="text-xs text-slate-500">
                        Agent confidence {Math.round(finding.agentConfidence * 100)}%
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">{finding.description}</p>
                    <p className="mt-2 text-sm text-slate-500">
                      <span className="font-semibold text-slate-700">Contradiction:</span>{" "}
                      {finding.contradiction}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      <span className="font-semibold text-slate-700">Suggested fix:</span>{" "}
                      {finding.suggestedAction}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>
                        Evidence segments:{" "}
                        {finding.evidenceSegments.map((segmentId) => (
                          <span key={segmentId} className="mr-1 rounded-full bg-white px-2 py-0.5 text-slate-600">
                            {segmentId}
                          </span>
                        ))}
                      </span>
                      <button
                        onClick={() => handleQaPlayback(finding)}
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        Play evidence
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      <audio
        ref={audioRef}
        src={note.audioUrl}
        controls
        className="mx-auto mt-4 w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"
      />
    </div>
  );
}

const MetricCard = ({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper?: string;
}) => (
  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
    <p className="text-2xl font-semibold text-slate-900">{value}</p>
    {helper && <p className="text-sm text-slate-500">{helper}</p>}
  </div>
);
