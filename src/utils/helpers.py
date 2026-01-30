# Utility Functions
import json
import re
from typing import Dict, Any, List

def extract_json_from_response(response: str) -> Dict[str, Any]:
    """Extract JSON from LLM response that might have markdown formatting"""
    try:
        # Try to parse directly first
        return json.loads(response)
    except json.JSONDecodeError:
        # Try to extract JSON from markdown code blocks
        json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', response, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(1))
        
        # Try to find JSON object in the response
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(0))
        
        raise ValueError("No valid JSON found in response")

def format_candidate_info(candidate: Dict[str, Any]) -> str:
    """Format candidate information for prompts"""
    personal_info = candidate.get('personalInfo', {})
    
    # Format education
    education_list = []
    for edu in candidate.get('education', []):
        edu_str = f"{edu.get('degree', '')} in {edu.get('field', '')} from {edu.get('institution', '')}"
        education_list.append(edu_str)
    education_str = "; ".join(education_list) if education_list else "Not specified"
    
    # Format experience
    experience_list = []
    for exp in candidate.get('experience', []):
        exp_str = f"{exp.get('title', '')} at {exp.get('company', '')}: {exp.get('description', '')}"
        experience_list.append(exp_str)
    experience_str = "; ".join(experience_list) if experience_list else "Not specified"
    
    # Format skills
    skills = candidate.get('skills', {})
    all_skills = []
    for skill_category in ['programming', 'frameworks', 'tools', 'cloud', 'databases']:
        if skill_category in skills and isinstance(skills[skill_category], list):
            all_skills.extend(skills[skill_category])
    skills_str = ", ".join(all_skills) if all_skills else "Not specified"
    
    # Format certifications
    certifications = candidate.get('certifications', [])
    cert_str = ", ".join(certifications) if certifications else "None"
    
    return {
        'name': f"{personal_info.get('firstName', '')} {personal_info.get('lastName', '')}",
        'target_role': candidate.get('targetRole', 'Not specified'),
        'years_experience': str(candidate.get('yearsOfExperience', 0)),
        'education': education_str,
        'skills': skills_str,
        'experience': experience_str,
        'certifications': cert_str
    }

def calculate_overall_score(skills_match: Dict, experience_match: Dict, education_match: Dict) -> int:
    """Calculate overall candidate score"""
    skills_score = skills_match.get('match_percentage', 0) * 0.4
    experience_score = experience_match.get('relevance_score', 0) * 0.4
    education_score = education_match.get('education_score', 0) * 0.2
    
    return int(skills_score + experience_score + education_score)
