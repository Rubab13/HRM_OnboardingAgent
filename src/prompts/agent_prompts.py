# Prompts for AI Agents

JOB_INTAKE_PROMPT = """
You are an expert HR analyst. Analyze the following job description and extract key requirements.

Job Description:
{job_description}

Extract and return the following information in JSON format:
{{
    "required_skills": ["skill1", "skill2", ...],
    "preferred_skills": ["skill1", "skill2", ...],
    "experience_required": "X years",
    "education_required": ["degree1", "degree2", ...],
    "key_responsibilities": ["responsibility1", "responsibility2", ...],
    "role_type": "job title/role",
    "technical_requirements": ["requirement1", "requirement2", ...],
    "soft_skills": ["skill1", "skill2", ...]
}}

Be precise and extract only what is explicitly mentioned or strongly implied in the job description.
"""

RESUME_SCREENING_PROMPT = """
You are an expert resume screener. Evaluate the following candidate against the job requirements.

Job Requirements:
{job_requirements}

Candidate Information:
Name: {candidate_name}
Target Role: {target_role}
Years of Experience: {years_experience}
Education: {education}
Skills: {skills}
Experience: {experience}
Certifications: {certifications}

Evaluate this candidate on a scale of 0-100 and provide detailed analysis.

Return your evaluation in JSON format:
{{
    "match_score": 85,
    "skills_match": {{
        "matched_skills": ["skill1", "skill2"],
        "missing_skills": ["skill1", "skill2"],
        "match_percentage": 75
    }},
    "experience_match": {{
        "is_qualified": true,
        "years_gap": 0,
        "relevance_score": 90
    }},
    "education_match": {{
        "meets_requirements": true,
        "education_score": 85
    }},
    "strengths": ["strength1", "strength2", "strength3"],
    "weaknesses": ["weakness1", "weakness2"],
    "overall_assessment": "Brief assessment of the candidate",
    "recommendation": "strong_match/good_match/potential_match/not_recommended"
}}
"""

EVALUATOR_PROMPT = """
You are an expert hiring manager. Review the screening results and provide final recommendations.

Job Description:
{job_description}

Candidates Screening Results:
{screening_results}

Analyze all candidates and create a ranked shortlist. Return in JSON format:
{{
    "shortlisted_candidates": [
        {{
            "candidate_name": "Name",
            "match_score": 95,
            "rank": 1,
            "key_strengths": ["strength1", "strength2", "strength3"],
            "recommendation_reason": "Why this candidate is recommended",
            "interview_focus_areas": ["area1", "area2"]
        }}
    ],
    "summary": {{
        "total_candidates_reviewed": 5,
        "total_shortlisted": 3,
        "top_skills_found": ["skill1", "skill2"],
        "overall_candidate_quality": "excellent/good/fair/poor"
    }}
}}

Only include candidates with match_score >= 70. Rank them by match_score in descending order.
"""
