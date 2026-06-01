import os
import json
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Read the transcript from Phase 1
with open("transcript.txt", "r") as f:
    transcript = f.read()

# The prompt: tell the LLM exactly what to return
prompt = f"""
You are a sales call coach. Analyze the following sales call transcript and return ONLY a JSON object — no explanation, no markdown, just raw JSON.

The JSON must have exactly these fields:
{{
  "talk_ratio": {{
    "rep_percent": ,
    "customer_percent": 
  }},
  "filler_words": {{
    "count": ,
    "examples": []
  }},
  "sentiment": {{
    "overall": <"positive", "neutral", or "negative">,
    "explanation": 
  }},
  "coaching_tips": [
    ,
    ,
    
  ],
  "summary": 
}}

TRANSCRIPT:
{transcript}
"""

# Call the LLM
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": prompt}],
    temperature=0.3
)

# Extract the text response
raw = response.choices[0].message.content

# Parse JSON safely
try:
    data = json.loads(raw)
except json.JSONDecodeError:
    print("LLM didn't return clean JSON. Raw output:")
    print(raw)
    exit()

# Print results clearly
print("\n=== COACHING REPORT ===\n")
print(f"Talk ratio:  Rep {data['talk_ratio']['rep_percent']}% / Customer {data['talk_ratio']['customer_percent']}%")
print(f"Filler words: {data['filler_words']['count']} found — {', '.join(data['filler_words']['examples'])}")
print(f"Sentiment:   {data['sentiment']['overall']} — {data['sentiment']['explanation']}")
print(f"\nSummary: {data['summary']}")
print("\nCoaching tips:")
for i, tip in enumerate(data['coaching_tips'], 1):
    print(f"  {i}. {tip}")

# Save to file
with open("coaching_report.json", "w") as f:
    json.dump(data, f, indent=2)

print("\n✓ Saved to coaching_report.json")