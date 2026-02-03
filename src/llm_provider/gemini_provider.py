# LLM Provider Configuration
from google import genai
from google.genai import types
import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class GeminiProvider:
    def __init__(self, api_key: Optional[str] = None):
        """Initialize Gemini API"""
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("Gemini API key not found. Set GEMINI_API_KEY environment variable.")
        
        self.client = genai.Client(api_key=self.api_key)
    
    def generate_json_response(self, prompt: str) -> str:
        """Generate JSON formatted response"""
        try:
            response = self.client.models.generate_content(
                model='models/gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.3,
                    max_output_tokens=4096,
                )
            )
            return response.text
        except Exception as e:
            raise Exception(f"Error generating JSON response: {str(e)}")
