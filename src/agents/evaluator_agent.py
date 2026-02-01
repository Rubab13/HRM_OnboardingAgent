# Evaluator Agent - Ranks and Shortlists Candidates
from typing import Dict, Any, List
from ..llm_provider import GeminiProvider
from ..prompts import EVALUATOR_PROMPT
from ..utils import extract_json_from_response
import json

class EvaluatorAgent:
    """Agent responsible for final evaluation and candidate ranking"""
    
    def __init__(self, llm_provider: GeminiProvider):
        self.llm = llm_provider
    
    def evaluate_and_rank(
        self, 
        screening_results: List[Dict[str, Any]], 
        job_description: str,
        min_score: int = 70
    ) -> Dict[str, Any]:
        """
        Evaluate all screening results and create ranked shortlist
        
        Args:
            screening_results: List of screening results from resume screener
            job_description: Original job description
            min_score: Minimum score for shortlisting (default: 70)
            
        Returns:
            Final evaluation with ranked shortlist
        """
        try:
            # Filter out candidates with errors
            valid_results = [r for r in screening_results if r.get('match_score', 0) > 0]
            
            if not valid_results:
                return {
                    'success': True,
                    'shortlisted_candidates': [],
                    'summary': {
                        'total_candidates_reviewed': len(screening_results),
                        'total_shortlisted': 0,
                        'message': 'No valid candidates found for evaluation'
                    }
                }
            
            # Format screening results for prompt
            screening_summary = self._format_screening_results(valid_results)
            
            # Format prompt
            prompt = EVALUATOR_PROMPT.format(
                job_description=job_description,
                screening_results=screening_summary
            )
            
            # Get response from LLM
            response = self.llm.generate_json_response(prompt)
            
            # Extract JSON from response
            evaluation_result = extract_json_from_response(response)
            
            # Filter by minimum score and add location/contact info
            shortlisted = []
            for candidate in evaluation_result.get('shortlisted_candidates', []):
                if candidate.get('match_score', 0) >= min_score:
                    # Find original screening result to get contact info
                    original = next(
                        (r for r in valid_results if r.get('candidate_name') == candidate.get('candidate_name')),
                        None
                    )
                    if original:
                        candidate['email'] = original.get('candidate_email', '')
                        candidate['phone'] = original.get('candidate_phone', '')
                    shortlisted.append(candidate)
            
            # Sort by match score
            shortlisted.sort(key=lambda x: x.get('match_score', 0), reverse=True)
            
            # Update ranks
            for idx, candidate in enumerate(shortlisted, 1):
                candidate['rank'] = idx
                
            temp = {
                'success': True,
                'shortlisted_candidates': shortlisted,
                'summary': evaluation_result.get('summary', {}),
                'total_reviewed': len(screening_results),
                'total_shortlisted': len(shortlisted)
            }
            
            print("this is my eval agent result: ", temp)
            
            return temp
            
        except Exception as e:
            # Fallback: Sort by score if AI evaluation fails
            valid_results = [r for r in screening_results if r.get('match_score', 0) >= min_score]
            valid_results.sort(key=lambda x: x.get('match_score', 0), reverse=True)
            
            shortlisted = []
            for idx, result in enumerate(valid_results[:10], 1):  # Top 10 max
                shortlisted.append({
                    'candidate_name': result.get('candidate_name', 'Unknown'),
                    'match_score': result.get('match_score', 0),
                    'rank': idx,
                    'email': result.get('candidate_email', ''),
                    'phone': result.get('candidate_phone', ''),
                    'key_strengths': result.get('strengths', [])[:3],
                    'recommendation_reason': result.get('overall_assessment', 'Candidate meets requirements'),
                })
            
            return {
                'success': True,
                'shortlisted_candidates': shortlisted,
                'summary': {
                    'total_candidates_reviewed': len(screening_results),
                    'total_shortlisted': len(shortlisted),
                    'note': 'Fallback ranking used due to evaluation error'
                },
                'error': str(e)
            }
    
    def _format_screening_results(self, screening_results: List[Dict[str, Any]]) -> str:
        """Format screening results for prompt"""
        formatted_results = []
        
        for result in screening_results:
            candidate_summary = {
                'name': result.get('candidate_name', 'Unknown'),
                'match_score': result.get('match_score', 0),
                'skills_match': result.get('skills_match', {}).get('match_percentage', 0),
                'experience_score': result.get('experience_match', {}).get('relevance_score', 0),
                'strengths': result.get('strengths', []),
                'weaknesses': result.get('weaknesses', []),
                'recommendation': result.get('recommendation', 'unknown'),
                'assessment': result.get('overall_assessment', '')
            }
            formatted_results.append(candidate_summary)
        
        return json.dumps(formatted_results, indent=2)
