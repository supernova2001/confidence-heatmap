## Confidence Heatmap Prototype

This repo hosts a high-fidelity prototype of the **Confidence Heatmap & Source Anchoring** feature. It shows how an AI-generated clinical note can highlight low-confidence spans, link directly to the supporting audio, and surface RAG evidence so providers trust the draft in seconds.

### Why the feature exists
- **Problem**: Doctors spend minutes re-reading long AI notes and scrubbing through full visit audio to verify accuracy.
- **Solution**: Color every sentence by model confidence, auto-flag risky spans, and let clinicians click a sentence to play only that audio clip.
- **Result**: Verification time drops because providers review just the yellow spans and see the provenance immediately.

### What you’ll find
- `src/app/page.tsx`: Main experience with confidence strip, rapid-review queue, source cards, audio player, and Voice QA agent findings.
- `src/app/docs/page.tsx`: In-product documentation that explains the workflow to stakeholders.
- `src/data/sampleNote.ts`: Mock payload emulating the RAG + Whisper output (segments, sources, QA flags, metrics).
- `src/app/api/note/route.ts`: Simple API route serving the sample payload.

### Architecture in plain English
1. **Capture**: Whisper (or similar) transcribes visit audio with timestamps + token logprobs.
2. **Retrieve**: Transcript windows, EHR snippets, and guidelines are chunked, embedded, and stored in a vector DB.
3. **Generate**: An LLM drafts the structured note using retrieved evidence, emitting segment-level confidence, timestamps, and provenance.
4. **Verify**:  
   - Frontend renders the note as a color-coded heatmap.  
   - Clicking a span plays that exact audio slice.  
   - Source cards show which transcript/EHR/guideline chunk supported the sentence.  
   - The Voice QA agent runs contradiction checks (e.g., symptom mentioned without plan) and lists suggested fixes.

![screenshot](https://github.com/user-attachments/assets/3ab2a0bb-3f6f-4cc8-95ec-602c4b657c09)

### Running the prototype

```bash
npm install
npm run dev
# visit http://localhost:3000
```

### What to build next
- Swap the mock API with a real RAG pipeline (Whisper + retriever + LLM)
- Persist QA findings, allow dismissal/escalation, and push actions into the EHR
- Add telemetry so we can measure verification time savings in production

Questions or ideas? Open a PR or drop an issue—we’re treating this as a living design doc as much as a UI prototype.
