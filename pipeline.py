import os
import json
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def transcribe(audio_path):
    print(f"Transcribing {audio_path}...")
    with open(audio_path, "rb") as f:
        result = client.audio.transcriptions.create(
            model="whisper-1",
            file=f,
            response_format="text"
        )
    return result

def analyze(transcript):
    print("Analyzing transcript...")
    prompt = f"""
You are a sales call coach. Analyze the following transcript and return ONLY a JSON object with these fields:
{{
  "talk_ratio": {{"rep_percent": , "customer_percent": }},
  "filler_words": {{"count": , "examples": []}},
  "sentiment": {{"overall": <"positive"|"neutral"|"negative">, "explanation": }},
  "coaching_tips": [, , ],
  "summary": 
}}

TRANSCRIPT:
{transcript}
"""
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )
    raw = response.choices[0].message.content
    raw = raw.strip().removeprefix("```json").removesuffix("```").strip()
    return json.loads(raw)

def run(audio_path):
    transcript = transcribe(audio_path)
    with open("transcript.txt", "w") as f:
        f.write(transcript)

    data = analyze(transcript)
    with open("coaching_report.json", "w") as f:
        json.dump(data, f, indent=2)

    print("\n=== COACHING REPORT ===")
    print(f"Talk ratio:  Rep {data['talk_ratio']['rep_percent']}% / Customer {data['talk_ratio']['customer_percent']}%")
    print(f"Filler words: {data['filler_words']['count']} — {', '.join(data['filler_words']['examples'])}")
    print(f"Sentiment:   {data['sentiment']['overall']} — {data['sentiment']['explanation']}")
    print(f"Summary:     {data['summary']}")
    print("\nCoaching tips:")
    for i, tip in enumerate(data['coaching_tips'], 1):
        print(f"  {i}. {tip}")
    print("\n✓ Saved transcript.txt and coaching_report.json")

if __name__ == "__main__":
    run("test_call_wws.mp3")