from fastapi import FastAPI, Request, Form, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os
import json
from datetime import datetime

# Import AI Agents
from src.llm_provider import GeminiProvider
from src.agents import IntakeAgent, ResumeScreenerAgent, EvaluatorAgent

app = FastAPI()

# Initialize LLM Provider and Agents
llm_provider = None
intake_agent = None
screener_agent = None
evaluator_agent = None

def initialize_agents():
    """Initialize AI agents with Gemini API"""
    global llm_provider, intake_agent, screener_agent, evaluator_agent
    
    try:
        llm_provider = GeminiProvider()
        intake_agent = IntakeAgent(llm_provider)
        screener_agent = ResumeScreenerAgent(llm_provider)
        evaluator_agent = EvaluatorAgent(llm_provider)
        print("✅ AI Agents initialized successfully")
    except Exception as e:
        print(f"⚠️ Warning: Could not initialize AI agents: {str(e)}")
        print("💡 Set GEMINI_API_KEY environment variable to enable AI features")

# Try to initialize agents on startup
initialize_agents()

# Request model for shortlisting
class ShortlistRequest(BaseModel):
    job_description: str

app = FastAPI()

# Mount static files directory
app.mount("/static", StaticFiles(directory="static"), name="static")

# Setup Jinja2 templates
templates = Jinja2Templates(directory="templates")

@app.get("/")
async def landing_page(request: Request):
    """Serve the landing page"""
    return templates.TemplateResponse("landing.html", {"request": request})

@app.get("/hr")
async def hr_dashboard(request: Request):
    """Serve the HR dashboard"""
    return templates.TemplateResponse("hr_dashboard.html", {"request": request})

@app.get("/student")
async def student_upload(request: Request):
    """Serve the student upload page"""
    return templates.TemplateResponse("student_upload.html", {"request": request})

@app.post("/api/student/upload")
async def upload_student_data(
    request: Request,
    resume: UploadFile = File(...),
    data: str = Form(...)
):
    """Handle student data upload"""
    try:
        # Parse the JSON data
        student_data = json.loads(data)
        
        # Create directory for student
        student_name = f"{student_data['personalInfo']['firstName']}_{student_data['personalInfo']['lastName']}"
        student_dir = os.path.join("data", "applications", student_name)
        os.makedirs(student_dir, exist_ok=True)
        
        # Save resume
        resume_path = os.path.join(student_dir, "resume.pdf")
        with open(resume_path, "wb") as f:
            content = await resume.read()
            f.write(content)
        
        # Add application metadata
        student_data["applicationDate"] = datetime.now().strftime("%Y-%m-%d")
        student_data["status"] = "pending"
        
        # Save JSON data
        json_path = os.path.join(student_dir, "generalInformation.json")
        with open(json_path, "w") as f:
            json.dump(student_data, f, indent=2)
        
        return JSONResponse(content={
            "success": True,
            "message": "Application submitted successfully!",
            "student_name": student_name
        })
    
    except Exception as e:
        return JSONResponse(
            status_code=400,
            content={"success": False, "message": str(e)}
        )

@app.get("/api/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy", "message": "HR System API is running"}

@app.get("/api/candidates")
async def get_candidates():
    """Get all candidates from data/applications folder"""
    try:
        candidates = []
        applications_dir = os.path.join("data", "applications")
        
        # Check if directory exists
        if not os.path.exists(applications_dir):
            return JSONResponse(content={"candidates": [], "count": 0})
        
        # Iterate through each student folder
        for student_folder in os.listdir(applications_dir):
            student_path = os.path.join(applications_dir, student_folder)
            
            # Check if it's a directory
            if os.path.isdir(student_path):
                json_file = os.path.join(student_path, "generalInformation.json")
                
                # Check if generalInformation.json exists
                if os.path.exists(json_file):
                    try:
                        with open(json_file, 'r', encoding='utf-8') as f:
                            candidate_data = json.load(f)
                            # Add folder name for reference
                            candidate_data['folderName'] = student_folder
                            candidates.append(candidate_data)
                    except Exception as e:
                        print(f"Error reading {json_file}: {str(e)}")
                        continue
        
        return JSONResponse(content={
            "candidates": candidates,
            "count": len(candidates)
        })
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "candidates": [], "count": 0}
        )

@app.post("/api/shortlist")
async def shortlist_candidates(request: ShortlistRequest):
    """
    AI-powered candidate shortlisting endpoint
    Uses three agents: Intake -> Resume Screener -> Evaluator
    """
    try:
        # Check if agents are initialized
        if not all([intake_agent, screener_agent, evaluator_agent]):
            return JSONResponse(
                status_code=503,
                content={
                    "success": False,
                    "error": "AI agents not initialized. Please set GEMINI_API_KEY environment variable."
                }
            )
        
        job_description = request.job_description
        
        if not job_description or len(job_description.strip()) < 10:
            return JSONResponse(
                status_code=400,
                content={"success": False, "error": "Job description is too short"}
            )
        
        # Step 1: Get all candidates
        candidates_response = await get_candidates()
        candidates_data = json.loads(candidates_response.body)
        candidates = candidates_data.get('candidates', [])
        
        if not candidates:
            return JSONResponse(content={
                "success": True,
                "shortlisted_candidates": [],
                "message": "No candidates found in the system"
            })
        
        # Step 2: Intake Agent - Process job description
        print(f"🔍 Processing job description with Intake Agent...")
        intake_result = intake_agent.process_job_description(job_description)
        
        if not intake_result['success']:
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "error": f"Job analysis failed: {intake_result.get('error')}"
                }
            )
        
        job_requirements = intake_result['job_requirements']
        print(f"✅ Job requirements extracted: {intake_agent.get_requirement_summary(job_requirements)}")
        
        # Step 3: Resume Screener Agent - Screen all candidates
        print(f"📋 Screening {len(candidates)} candidates...")
        screening_results = screener_agent.screen_candidates_batch(candidates, job_requirements)
        print(f"✅ Screening complete. {len(screening_results)} candidates evaluated.")
        
        # Step 4: Evaluator Agent - Rank and shortlist
        print(f"🏆 Evaluating and ranking candidates...")
        evaluation_result = evaluator_agent.evaluate_and_rank(
            screening_results, 
            job_description,
            min_score=70
        )
        
        if not evaluation_result['success']:
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "error": "Evaluation failed"
                }
            )
        
        shortlisted = evaluation_result['shortlisted_candidates']
        print(f"✅ Shortlisting complete. {len(shortlisted)} candidates shortlisted.")
        
        return JSONResponse(content={
            "success": True,
            "shortlisted_candidates": shortlisted,
            "summary": evaluation_result.get('summary', {}),
            "job_requirements": job_requirements,
            "total_candidates_reviewed": len(candidates),
            "total_shortlisted": len(shortlisted)
        })
    
    except Exception as e:
        print(f"❌ Error in shortlisting: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": str(e)
            }
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
