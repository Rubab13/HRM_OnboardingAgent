# Resume Screener Agent - Evaluates Individual Candidates
from typing import Dict, Any, List
from ..llm_provider import GeminiProvider
from ..prompts import RESUME_SCREENING_PROMPT
from ..utils import extract_json_from_response, format_candidate_info

class ResumeScreenerAgent:
    """Agent responsible for screening individual candidate resumes"""
    
    def __init__(self, llm_provider: GeminiProvider):
        self.llm = llm_provider
    
    def screen_candidate(
        self, 
        candidate: Dict[str, Any], 
        job_requirements: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Screen a single candidate against job requirements
        
        Args:
            candidate: Candidate data from generalInformation.json
            job_requirements: Extracted job requirements from intake agent
            
        Returns:
            Screening results with match score and analysis
        """
        try:
            # Format candidate information
            candidate_info = format_candidate_info(candidate)
            
            # Format job requirements as string
            job_req_str = self._format_job_requirements(job_requirements)
            
            # Format prompt
            prompt = RESUME_SCREENING_PROMPT.format(
                job_requirements=job_req_str,
                candidate_name=candidate_info['name'],
                target_role=candidate_info['target_role'],
                years_experience=candidate_info['years_experience'],
                education=candidate_info['education'],
                skills=candidate_info['skills'],
                experience=candidate_info['experience'],
                certifications=candidate_info['certifications']
            )
            
            # Get response from LLM
            response = self.llm.generate_json_response(prompt)
            
            # Extract JSON from response
            screening_result = extract_json_from_response(response)
            
            # Add candidate basic info to result
            screening_result['candidate_name'] = candidate_info['name']
            screening_result['candidate_email'] = candidate.get('personalInfo', {}).get('email', '')
            screening_result['candidate_phone'] = candidate.get('personalInfo', {}).get('phone', '')
            screening_result['target_role'] = candidate_info['target_role']
            screening_result['years_experience'] = candidate_info['years_experience']
            
            return {
                'success': True,
                'screening_result': screening_result
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'candidate_name': candidate.get('personalInfo', {}).get('firstName', 'Unknown'),
                'screening_result': None
            }
    
    def screen_candidates_batch(
        self, 
        candidates: List[Dict[str, Any]], 
        job_requirements: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Screen multiple candidates in batch
        
        Args:
            candidates: List of candidate data
            job_requirements: Extracted job requirements
            
        Returns:
            List of screening results
        """
        results = []
        
        for candidate in candidates:
            result = self.screen_candidate(candidate, job_requirements)
            if result['success']:
                results.append(result['screening_result'])
            else:
                # Include failed screenings with error info
                results.append({
                    'candidate_name': result.get('candidate_name', 'Unknown'),
                    'match_score': 0,
                    'error': result.get('error', 'Screening failed'),
                    'recommendation': 'error'
                })
        
        return results
    
    def _format_job_requirements(self, job_requirements: Dict[str, Any]) -> str:
        """Format job requirements for prompt"""
        parts = []
        
        if 'role_type' in job_requirements:
            parts.append(f"Role: {job_requirements['role_type']}")
        
        if 'required_skills' in job_requirements:
            parts.append(f"Required Skills: {', '.join(job_requirements['required_skills'])}")
        
        if 'preferred_skills' in job_requirements:
            parts.append(f"Preferred Skills: {', '.join(job_requirements['preferred_skills'])}")
        
        if 'experience_required' in job_requirements:
            parts.append(f"Experience Required: {job_requirements['experience_required']}")
        
        if 'education_required' in job_requirements:
            parts.append(f"Education Required: {', '.join(job_requirements['education_required'])}")
        
        return "\n".join(parts)
