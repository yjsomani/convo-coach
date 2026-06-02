# Convo Coach

An end-to-end conversational intelligence tool that transcribes sales call recordings and surfaces AI-generated coaching insights — talk ratio, filler word detection, sentiment analysis, and actionable coaching tips.

**Live demo:** [convo-coach-gtm.vercel.app](https://convo-coach-gtm.vercel.app)

---

## What it does

Upload any sales call recording (.mp3, .wav, .m4a) under 4MB and get back:

- **Talk ratio** — estimated percentage of the call spoken by the rep vs. the customer
- **Filler word count** — total filler words detected (um, uh, like, basically, you know) with examples
- **Sentiment** — overall call sentiment with a one-sentence explanation
- **Coaching tips** — 3 specific, actionable improvements for the rep
- **Full transcript** — collapsible raw transcript of the entire call

---

## How it works

```
Audio file → Whisper API (transcription) → GPT-4o-mini (structured analysis) → React dashboard
```

1. The user uploads an audio file via the browser
2. A Next.js API route receives it server-side and calls OpenAI's Whisper API to transcribe it
3. The transcript is passed to GPT-4o-mini with a structured prompt that returns a JSON coaching report
4. The frontend renders the report as a dashboard

---

## Technical decisions worth noting

**Why `temperature: 0.3` on the LLM call?** Lower temperature produces more consistent JSON structure. The goal is reliable extraction, not creativity — so determinism matters more than variety.

**Why GPT-4o-mini instead of GPT-4o?** It's fast, cheap (fractions of a cent per call), and more than capable for structured data extraction from transcripts. The bottleneck is Whisper latency, not the analysis model.

**Why Next.js API routes instead of a separate backend?** Keeps the OpenAI key server-side without needing a separate Python server. The API route is essentially `pipeline.py` rewritten in TypeScript — same logic, different runtime.

---

## Stack

- **Transcription:** OpenAI Whisper API
- **Analysis:** OpenAI GPT-4o-mini
- **Frontend:** Next.js + TypeScript + Tailwind CSS
- **Backend:** Next.js API routes
- **Deployment:** Vercel
- **Python pipeline (CLI version):** `pipeline.py` — runs the same transcription + analysis flow from the command line

---

## Running locally

```bash
git clone https://github.com/YOUR-USERNAME/convo-coach
cd convo-coach/web
npm install
```

Create a `.env.local` file inside `web/`:

```
OPENAI_API_KEY=your-openai-api-key-here
```

Then run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Upload an audio file and click **Analyze call**.

To run the CLI pipeline directly:

```bash
cd ..
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python3 pipeline.py
```

---

