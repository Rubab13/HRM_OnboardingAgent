# Intake Agent - Processes Job Descriptions
from typing import Dict, Any
from ..llm_provider import GeminiProvider
from ..prompts import JOB_INTAKE_PROMPT
from ..utils import extract_json_from_response

class IntakeAgent:
    """Agent responsible for analyzing job descriptions and extracting requirements"""
    
    def __init__(self, llm_provider: GeminiProvider):
        self.llm = llm_provider
    
    def process_job_description(self, job_description: str) -> Dict[str, Any]:
        """
        Process job description and extract key requirements
        
        Args:
            job_description: Raw job description text
            
        Returns:
            Dictionary with extracted job requirements
        """
        try:
            # Format prompt with job description
            prompt = JOB_INTAKE_PROMPT.format(job_description=job_description)
            
            # Get response from LLM
            response = self.llm.generate_json_response(prompt)
            
            # Extract JSON from response
            job_requirements = extract_json_from_response(response)
            
            # Validate required fields
            required_fields = ['required_skills', 'role_type']
            for field in required_fields:
                if field not in job_requirements:
                    job_requirements[field] = [] if field.endswith('skills') else "Not specified"
            
            return {
                'success': True,
                'job_requirements': job_requirements,
                'raw_description': job_description
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'job_requirements': None
            }
    
    def get_requirement_summary(self, job_requirements: Dict[str, Any]) -> str:
        """Generate a human-readable summary of job requirements"""
        summary_parts = []
        
        if 'role_type' in job_requirements:
            summary_parts.append(f"Role: {job_requirements['role_type']}")
        
        if 'required_skills' in job_requirements:
            skills = ", ".join(job_requirements['required_skills'][:5])
            summary_parts.append(f"Required Skills: {skills}")
        
        if 'experience_required' in job_requirements:
            summary_parts.append(f"Experience: {job_requirements['experience_required']}")
        
        return " | ".join(summary_parts)
