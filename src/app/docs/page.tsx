import Link from "next/link";

const LIST_ITEM_CLASSES = "rounded-2xl border border-slate-100 bg-white p-4 shadow-sm";

const bullets = [
  {
    title: "Problem",
    text: "Clinicians spend too long verifying AI-generated notes because they must reread large blocks of text and scrub through full audio recordings.",
  },
  {
    title: "Solution",
    text: "Surface confidence signals and provenance inline so the doctor reviews only the risky spans and can jump straight to the original evidence.",
  },
  {
    title: "Business impact",
    text: "Reduces time-to-verify, a key KPI measured in minutes saved per encounter.",
  },
];

const ragSteps = [
  "Whisper generates timestamped transcript tokens with logprobs.",
  "Relevant transcript windows, recent EHR snippets, and guideline chunks are embedded and stored in the vector DB.",
  "Retriever pulls top chunks per section; the LLM drafts the note, attaching segment confidence, timestamps, and evidence IDs.",
  "Frontend visualizes segments with color-coding, audio anchoring, supporting sources, and Voice QA agent findings.",
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <header className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-500">Confidence Heatmap</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Feature documentation</h1>
          <p className="mt-3 text-base text-slate-600">
            Prototype that highlights low-confidence spans, anchors them to audio, and exposes their supporting evidence so clinicians can verify in seconds.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex w-fit items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            ← Back to demo
          </Link>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {bullets.map((item) => (
            <article key={item.title} className={LIST_ITEM_CLASSES}>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.title}</p>
              <p className="mt-2 text-sm text-slate-700">{item.text}</p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">How it works</h2>
          <ol className="mt-4 space-y-3 text-sm text-slate-700">
            {ragSteps.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="mt-0.5 h-6 w-6 rounded-full bg-indigo-50 text-center text-sm font-semibold text-indigo-600">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Voice QA agent</h2>
          <p className="mt-2 text-sm text-slate-600">
            An autonomous verifier that scans transcripts, plan statements, and retrieval evidence to surface contradictions.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            <li>Detects mismatches such as symptoms without follow-up or medications mentioned in dialogue but absent from plan.</li>
            <li>Ranks issues by severity and reports estimated agent confidence.</li>
            <li>Links each issue to the exact evidence segments so reviewers can replay audio instantly.</li>
            <li>Suggests concrete remediation steps (e.g., add reflux therapy, schedule follow-up call).</li>
          </ul>
        </section>

        <section className="rounded-3xl bg-indigo-50 p-6 text-slate-900">
          <h2 className="text-xl font-semibold">Why it helps clinicians</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>Highlights only the spans that need attention, reducing review time.</li>
            <li>One click plays the exact audio clip, so providers do not scrub entire recordings.</li>
            <li>Evidence cards (transcript, EHR, guidelines) show provenance, increasing trust.</li>
            <li>Metrics quantify verification savings toward the time-to-verify KPI.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

