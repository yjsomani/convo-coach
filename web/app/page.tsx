"use client";

import { useState } from "react";

type Report = {
  talk_ratio: { rep_percent: number; customer_percent: number };
  filler_words: { count: number; examples: string[] };
  sentiment: { overall: string; explanation: string };
  coaching_tips: string[];
  summary: string;
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setError("File too large — please upload a recording under 4MB. For reference, a 3-minute call at standard quality is usually under 3MB.");
      return;
    }

    setLoading(true);
    setError("");
    setReport(null);

    try {
      const form = new FormData();
      form.append("audio", file);

      const res = await fetch("/api/analyze", { method: "POST", body: form });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setTranscript(data.transcript);
      setReport(data.report);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const sentimentColor: Record<string, string> = {
    positive: "bg-green-100 text-green-800",
    neutral: "bg-gray-100 text-gray-700",
    negative: "bg-red-100 text-red-800",
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-medium mb-1">Convo Coach</h1>
      <p className="text-gray-500 mb-8 text-sm">Upload a sales call recording to get AI coaching insights.</p>

      <div className="border border-dashed border-gray-300 rounded-xl p-8 text-center mb-4">
        <input
          type="file"
          accept=".mp3,.wav,.m4a,.webm"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="hidden"
          id="upload"
        />
        <label htmlFor="upload" className="cursor-pointer">
          <p className="text-sm text-gray-500">{file ? file.name : "Click to upload (.mp3, .wav, .m4a · max 4MB)"}</p>
        </label>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!file || loading}
        className="w-full py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium disabled:opacity-40 mb-8"
      >
        {loading ? "Analyzing… this takes 15–30 seconds" : "Analyze call"}
      </button>

      {error && <p className="text-red-600 text-sm mb-6">{error}</p>}

      {report && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Rep talk time</p>
              <p className="text-2xl font-medium text-gray-900">{report.talk_ratio.rep_percent}%</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Filler words</p>
              <p className="text-2xl font-medium text-gray-900">{report.filler_words.count}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-2">Sentiment</p>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${sentimentColor[report.sentiment.overall]}`}>
              {report.sentiment.overall}
            </span>
            <p className="text-sm text-gray-600 mt-2">{report.sentiment.explanation}</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-2">Summary</p>
            <p className="text-sm text-gray-700">{report.summary}</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-3">Coaching tips</p>
            <ul className="space-y-2">
              {report.coaching_tips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-gray-400 font-medium">{i + 1}.</span> {tip}
                </li>
              ))}
            </ul>
          </div>

          <details className="bg-gray-50 rounded-xl p-4">
            <summary className="text-xs text-gray-400 cursor-pointer">View transcript</summary>
            <p className="text-sm text-gray-600 mt-3 whitespace-pre-wrap">{transcript}</p>
          </details>
        </div>
      )}
    </main>
  );
}