from fastapi import FastAPI, Request, Form, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os
import json
from datetime import datetime
import shutil

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
    job_id: str
    job_description: str

# Request model for creating job
class CreateJobRequest(BaseModel):
    job_description: str

# Request model for sending bulk email
class BulkEmailRequest(BaseModel):
    recipients: list
    subject: str
    body: str

app = FastAPI()

# Mount static files directory
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/public", StaticFiles(directory="public"), name="public")

# Setup Jinja2 templates
templates = Jinja2Templates(directory="templates")

@app.get("/")
async def landing_page(request: Request):
    """Serve the landing page"""
    return templates.TemplateResponse("landing.html", {"request": request})

@app.get("/hr-portal")
async def hr_dashboard(request: Request):
    """Serve the HR dashboard"""
    return templates.TemplateResponse("hr_dashboard.html", {"request": request})

@app.get("/hr-job-upload")
async def hr_job_upload(request: Request):
    """Serve the HR job upload page"""
    return templates.TemplateResponse("hr_job_upload.html", {"request": request})

@app.get("/hr-send-email")
async def hr_send_email(request: Request):
    """Serve the HR send email page"""
    return templates.TemplateResponse("hr_send_email.html", {"request": request})

@app.get("/apply")
async def apply_page(request: Request):
    """Serve the application page"""
    return templates.TemplateResponse("apply.html", {"request": request})

@app.get("/api/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy", "message": "HR System API is running"}

@app.get("/api/jobs")
async def get_jobs():
    """Get all job folders"""
    try:
        jobs = []
        data_dir = "data"
        
        if not os.path.exists(data_dir):
            return JSONResponse(content={"jobs": [], "count": 0})
        
        for job_folder in os.listdir(data_dir):
            job_path = os.path.join(data_dir, job_folder)
            if os.path.isdir(job_path):
                job_desc_path = os.path.join(job_path, "jobDescription.txt")
                if os.path.exists(job_desc_path):
                    with open(job_desc_path, 'r', encoding='utf-8') as f:
                        description = f.read()
                    jobs.append({
                        "id": job_folder,
                        "name": job_folder,
                        "description": description
                    })
        
        return JSONResponse(content={"jobs": jobs, "count": len(jobs)})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/api/create-job")
async def create_job(request: CreateJobRequest):
    """
    Create a new job folder with job description.
    Counts existing job folders and creates the next one (e.g., Job4, Job5, etc.)
    """
    try:
        data_dir = "data"
        
        # Ensure data directory exists
        if not os.path.exists(data_dir):
            os.makedirs(data_dir)
        
        # Count existing job folders
        existing_jobs = []
        for folder_name in os.listdir(data_dir):
            folder_path = os.path.join(data_dir, folder_name)
            if os.path.isdir(folder_path) and folder_name.startswith("Job"):
                try:
                    # Extract job number
                    job_num = int(folder_name.replace("Job", ""))
                    existing_jobs.append(job_num)
                except ValueError:
                    continue
        
        # Determine next job number
        next_job_number = max(existing_jobs) + 1 if existing_jobs else 1
        new_job_id = f"Job{next_job_number}"
        new_job_path = os.path.join(data_dir, new_job_id)
        
        # Create job folder
        os.makedirs(new_job_path, exist_ok=True)
        
        # Create jobDescription.txt
        job_desc_path = os.path.join(new_job_path, "jobDescription.txt")
        with open(job_desc_path, 'w', encoding='utf-8') as f:
            f.write(request.job_description)
        
        # Create empty applications folder
        applications_path = os.path.join(new_job_path, "applications")
        os.makedirs(applications_path, exist_ok=True)
        
        return JSONResponse(content={
            "success": True,
            "job_id": new_job_id,
            "message": f"Job created successfully as {new_job_id}"
        })
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": f"Failed to create job: {str(e)}"
            }
        )

@app.post("/api/submit-application")
async def submit_application(applicationData: str = Form(...), resume: UploadFile = File(...)):
    """
    Submit a new candidate application with resume.
    Creates folder structure: data/JobX/applications/FirstName_LastName/
    Saves generalInformation.json and resume.pdf following candidateInterface.js
    """
    try:
        # Parse application data
        try:
            application = json.loads(applicationData)
        except json.JSONDecodeError as e:
            return JSONResponse(
                status_code=400,
                content={"success": False, "error": f"Invalid JSON data: {str(e)}"}
            )
        
        # Extract jobId
        job_id = application.get('jobId')
        if not job_id:
            return JSONResponse(
                status_code=400,
                content={"success": False, "error": "jobId is required"}
            )
        
        # Validate job exists
        job_path = os.path.join("data", job_id)
        if not os.path.exists(job_path):
            return JSONResponse(
                status_code=404,
                content={"success": False, "error": f"Job '{job_id}' not found"}
            )
        
        # Validate resume file
        if not resume.filename.endswith('.pdf'):
            return JSONResponse(
                status_code=400,
                content={"success": False, "error": "Resume must be a PDF file"}
            )
        
        # Extract candidate name
        first_name = application.get('personalInfo', {}).get('firstName', '')
        last_name = application.get('personalInfo', {}).get('lastName', '')
        
        if not first_name or not last_name:
            return JSONResponse(
                status_code=400,
                content={"success": False, "error": "First name and last name are required"}
            )
        
        # Create candidate folder name: FirstName_LastName
        candidate_folder_name = f"{first_name}_{last_name}".replace(" ", "_")
        
        # Create applications directory if not exists
        applications_dir = os.path.join(job_path, "applications")
        os.makedirs(applications_dir, exist_ok=True)
        
        # Create candidate directory
        candidate_dir = os.path.join(applications_dir, candidate_folder_name)
        
        # Handle duplicate names by adding timestamp
        if os.path.exists(candidate_dir):
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            candidate_folder_name = f"{first_name}_{last_name}_{timestamp}".replace(" ", "_")
            candidate_dir = os.path.join(applications_dir, candidate_folder_name)
        
        os.makedirs(candidate_dir, exist_ok=True)
        
        # Save resume.pdf
        resume_path = os.path.join(candidate_dir, "resume.pdf")
        with open(resume_path, "wb") as buffer:
            shutil.copyfileobj(resume.file, buffer)
        
        # Remove jobId from data before saving (not part of interface)
        application_to_save = {k: v for k, v in application.items() if k != 'jobId'}
        
        # Validate and ensure data follows candidateInterface.js structure
        required_fields = ['personalInfo', 'education', 'experience', 'skills', 'targetRole', 
                          'applicationDate', 'status', 'yearsOfExperience']
        
        for field in required_fields:
            if field not in application_to_save:
                return JSONResponse(
                    status_code=400,
                    content={"success": False, "error": f"Missing required field: {field}"}
                )
        
        # Ensure skills has correct structure
        if 'skills' in application_to_save:
            skills = application_to_save['skills']
            required_skill_fields = ['programming', 'frameworks', 'tools', 'cloud', 'databases', 'testing']
            for skill_field in required_skill_fields:
                if skill_field not in skills:
                    skills[skill_field] = []
        
        # Save generalInformation.json
        json_file_path = os.path.join(candidate_dir, "generalInformation.json")
        with open(json_file_path, 'w', encoding='utf-8') as f:
            json.dump(application_to_save, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Application saved: {candidate_folder_name} for {job_id}")
        print(f"   📁 Folder: {candidate_dir}")
        print(f"   📄 Resume: resume.pdf")
        print(f"   📄 Data: generalInformation.json")
        
        return JSONResponse(content={
            "success": True,
            "message": "Application submitted successfully",
            "candidateId": candidate_folder_name,
            "jobId": job_id
        })
        
    except Exception as e:
        print(f"❌ Error submitting application: {str(e)}")
        import traceback
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": "Failed to submit application",
                "details": str(e)
            }
        )

@app.get("/api/candidates/{job_id}")
async def get_candidates(job_id: str):
    """Get all candidates for a specific job"""
    try:
        candidates = []
        applications_dir = os.path.join("data", job_id, "applications")
        
        if not os.path.exists(applications_dir):
            return JSONResponse(content={"candidates": [], "count": 0})
        
        for student_folder in os.listdir(applications_dir):
            student_path = os.path.join(applications_dir, student_folder)
            
            if os.path.isdir(student_path):
                json_file = os.path.join(student_path, "generalInformation.json")
                
                if os.path.exists(json_file):
                    try:
                        with open(json_file, 'r', encoding='utf-8') as f:
                            candidate_data = json.load(f)
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
        
        job_id = request.job_id
        job_description = request.job_description
        
        if not job_description or len(job_description.strip()) < 10:
            return JSONResponse(
                status_code=400,
                content={"success": False, "error": "Job description is too short"}
            )
        
        # Step 1: Get all candidates for this job
        candidates_response = await get_candidates(job_id)
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

@app.post("/api/send-bulk-email")
async def send_bulk_email(request: BulkEmailRequest):
    """
    Send bulk emails to selected candidates
    Note: This is a mock implementation. In production, integrate with an email service like SendGrid, AWS SES, or SMTP.
    """
    try:
        recipients = request.recipients
        subject = request.subject
        body = request.body
        
        if not recipients or len(recipients) == 0:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "error": "No recipients specified"
                }
            )
        
        if not subject or not body:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "error": "Subject and body are required"
                }
            )
        
        # Mock email sending (in production, use actual email service)
        print(f"\n📧 Sending emails to {len(recipients)} candidates...")
        print(f"Subject: {subject}")
        print(f"Body preview: {body[:100]}...")
        
        sent_count = 0
        failed_emails = []
        
        for recipient in recipients:
            try:
                name = recipient.get('name', 'Unknown')
                email = recipient.get('email', 'N/A')
                
                # Personalize the email body by replacing placeholder if exists
                personalized_body = body.replace('[Candidate Name]', name)
                
                # Mock sending (log to console)
                print(f"  ✉️  Sending to: {name} <{email}>")
                
                # In production, replace this with actual email sending:
                # await send_email_via_service(email, subject, personalized_body)
                
                sent_count += 1
                
            except Exception as e:
                print(f"  ❌ Failed to send to {email}: {str(e)}")
                failed_emails.append(email)
        
        print(f"✅ Email sending complete. Sent: {sent_count}, Failed: {len(failed_emails)}")
        
        response_data = {
            "success": True,
            "sent_count": sent_count,
            "failed_count": len(failed_emails),
            "message": f"Successfully sent emails to {sent_count} candidate(s)"
        }
        
        if failed_emails:
            response_data["failed_emails"] = failed_emails
        
        return JSONResponse(content=response_data)
        
    except Exception as e:
        print(f"❌ Error sending bulk emails: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": f"Failed to send emails: {str(e)}"
            }
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
