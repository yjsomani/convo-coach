import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

audio_file_path = "test_call_wws.mp3"

with open(audio_file_path, "rb") as audio_file:
    transcript = client.audio.transcriptions.create(
        model="whisper-1",
        file=audio_file,
        response_format="text"
    )

print("=== TRANSCRIPT ===")
print(transcript)

with open("transcript.txt", "w") as f:
    f.write(transcript)

print("\n✓ Saved to transcript.txt")