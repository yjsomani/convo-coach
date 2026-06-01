import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("audio") as File;

  if (!file) {
    return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
  }

  // Step 1: Transcribe with Whisper
  const transcription = await client.audio.transcriptions.create({
    model: "whisper-1",
    file: file,
    response_format: "text",
  });

  // Step 2: Analyze with GPT
  const prompt = `
You are a sales call coach. Analyze this transcript and return ONLY a JSON object with no markdown:
{
  "talk_ratio": { "rep_percent": , "customer_percent":  },
  "filler_words": { "count": , "examples": [] },
  "sentiment": { "overall": <"positive"|"neutral"|"negative">, "explanation":  },
  "coaching_tips": [, , ],
  "summary": 
}

TRANSCRIPT:
${transcription}
`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  let raw = response.choices[0].message.content ?? "";
  raw = raw.trim().replace(/^```json/, "").replace(/```$/, "").trim();

  const data = JSON.parse(raw);
  return NextResponse.json({ transcript: transcription, report: data });
}