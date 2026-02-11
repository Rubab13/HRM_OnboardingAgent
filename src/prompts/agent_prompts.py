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

CRITICAL INSTRUCTIONS TO PREVENT HALLUCINATION:
- Extract ONLY information that is EXPLICITLY STATED in the job description text above
- Use the EXACT wording from the job description whenever possible
- If a field has no explicitly mentioned information, use an empty array [] or empty string ""
- Do NOT infer, assume, or add standard/typical requirements that are not written in the text
- Do NOT use your general knowledge about similar roles - only use what is directly stated
- For experience_required: extract only if explicitly stated (e.g., "3 years", "5+ years"). If not mentioned, use "Not specified"
- Distinguish between "required" (must-have, mandatory) and "preferred" (nice-to-have, bonus) based on the language used
- If the distinction between required/preferred is unclear, place items in required_skills
- Do NOT fabricate or embellish any information
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

CRITICAL INSTRUCTIONS TO PREVENT HALLUCINATION:
- Base your evaluation ONLY on the candidate information and job requirements provided above
- For matched_skills: include ONLY skills that appear in BOTH the candidate's skills AND the job requirements
- For missing_skills: include ONLY required skills from job requirements that are NOT in the candidate's profile
- Do NOT assume the candidate has skills that are not explicitly listed in their profile
- Do NOT invent or assume qualifications, experiences, or skills not present in the provided data
- Calculate match_percentage as: (number of matched_skills / total required_skills) * 100
- For experience_match: compare ONLY the years_experience provided with the experience_required from job requirements
- Set is_qualified to true only if candidate's years meet or exceed the requirement
- For strengths: list ONLY strengths that are DIRECTLY EVIDENT from the candidate's actual listed skills, experience, and education
- For weaknesses: list ONLY gaps that are FACTUALLY PRESENT when comparing candidate profile to job requirements
- For overall_assessment: summarize ONLY based on the factual comparison - do not add opinions or assumptions
- Use recommendation categories based strictly on match_score: strong_match (85-100), good_match (70-84), potential_match (50-69), not_recommended (0-49)
- Do NOT use external knowledge about industries, roles, or typical qualifications
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

CRITICAL INSTRUCTIONS TO PREVENT HALLUCINATION:
- Use ONLY the information from the screening results provided above
- For candidate_name and match_score: extract the EXACT values from the screening results
- For rank: assign based strictly on match_score in descending order (highest score = rank 1)
- For key_strengths: use ONLY the strengths that are EXPLICITLY LISTED in that candidate's screening result
- Do NOT add strengths that are not in the screening results, even if they seem logical
- For recommendation_reason: base it ONLY on the factual data from the screening result (match_score, matched skills, strengths listed)
- For interview_focus_areas: derive ONLY from the weaknesses or missing_skills in the screening results for that candidate
- Do NOT invent interview topics that are not grounded in the actual screening data
- For total_candidates_reviewed: count the EXACT number of candidates in the screening results
- For total_shortlisted: count ONLY candidates with match_score >= 70
- For top_skills_found: list ONLY skills that actually appear in the matched_skills of the shortlisted candidates
- For overall_candidate_quality: base assessment strictly on the match_score distribution: excellent (avg >= 85), good (avg 70-84), fair (avg 50-69), poor (avg < 50)
- Do NOT fabricate, embellish, or assume any information not present in the screening results
- If a screening result is missing data for a field, acknowledge it rather than making up information
"""
