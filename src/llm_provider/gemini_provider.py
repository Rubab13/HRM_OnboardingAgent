# LLM Provider Configuration
from google import genai
from google.genai import types
import os
from typing import Optional
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

class GeminiProvider:
    def __init__(self, api_key: Optional[str] = None):
        """Initialize Gemini API"""
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("Gemini API key not found. Set GEMINI_API_KEY environment variable.")
        
        self.client = genai.Client(api_key=self.api_key)
    
    def generate_json_response(self, prompt: str, max_retries: int = 3) -> str:
        """Generate JSON formatted response with retry logic
        
        Args:
            prompt: The prompt to send to the model
            max_retries: Maximum number of retry attempts (default: 3)
            
        Returns:
            JSON string response from the model
        """
        last_error = None
        
        for attempt in range(max_retries):
            try:
                response = self.client.models.generate_content(
                    model='models/gemini-2.5-flash',
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        temperature=0.0,  # Zero temperature for deterministic output
                        max_output_tokens=8192,  # Increased for detailed reasoning
                    )
                )
                
                # Validate response is not empty
                if not response.text or response.text.strip() == "":
                    raise ValueError("Empty response from model")
                
                # Validate JSON structure
                try:
                    json.loads(response.text)
                except json.JSONDecodeError:
                    # Try to extract JSON from response
                    import re
                    json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
                    if json_match:
                        json.loads(json_match.group(0))  # Validate it's valid JSON
                
                return response.text
                
            except Exception as e:
                last_error = e
                if attempt < max_retries - 1:
                    print(f"⚠️  Attempt {attempt + 1}/{max_retries} failed: {str(e)}")
                    print("   Retrying...")
                continue
        
        raise Exception(f"Error generating JSON response after {max_retries} attempts: {str(last_error)}")
