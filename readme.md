# 🎯 HRM Onboarding Agent
 
An intelligent AI-powered Human Resource Management system that automates recruitment workflows, resume screening, and candidate evaluation. Powered by Google Gemini API, this system intelligently processes job descriptions, screens applications, and evaluates candidates to streamline the hiring process.
 
## ✨ Features
 
- **📋 Job Intake Agent** - Automatically analyze job descriptions and extract key requirements, skills, and qualifications
- **📄 Resume Screener Agent** - Intelligently screen resumes against job requirements with detailed match analysis
- **🔍 Evaluator Agent** - Comprehensive candidate evaluation and scoring based on job fit
- **📧 Email Integration** - Send automated emails to candidates with customizable templates
- **🌐 Web Dashboard** - Interactive HR dashboard for managing jobs and applications
- **📊 Data Management** - Structured JSON-based data storage for jobs and candidate applications
- **⚡ Real-time Processing** - Fast AI-powered analysis using Google Generative AI
 
## 🛠️ Tech Stack
 
- **Backend**: FastAPI (Python)
- **AI/ML**: Google Generative AI (Gemini)
- **Frontend**: JavaScript, HTML, CSS
- **Server**: Uvicorn
- **Environment Management**: Python Virtual Environment
 
## 📥 Installation
 
### Prerequisites
 
- Python 3.8 or higher
- Git
- Google Gemini API Key
- Gmail account with app password (for email features)
 
### Step 1: Clone the Repository
 
```bash
git clone https://github.com/yourusername/HRM_OnboardingAgent.git
cd HRM_OnboardingAgent
```
 
### Step 2: Create Virtual Environment
 
```bash
# On Windows (PowerShell)
python -m venv venv
.\venv\Scripts\Activate.ps1
 
# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
```
 
### Step 3: Install Dependencies
 
```bash
pip install -r requirements.txt
```
 
### Step 4: Configure Environment Variables
 
Create a `.env` file in the root directory with your API credentials:
 
```env
# Google Gemini API Configuration
GOOGLE_API_KEY=your_gemini_api_key_here
 
# Email Configuration (Optional)
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your_app_password_here
```
 
**Getting Your API Keys:**
- **Google Gemini API**: Visit [Google AI Studio](https://aistudio.google.com/app/apikey) to get your API key
- **Gmail App Password**: Enable 2-factor authentication on your Google account and generate an [App Password](https://support.google.com/accounts/answer/185833)
 
## 🚀 Usage
 
### Starting the Application
 
```bash
# Ensure virtual environment is activated
python app.py
```
 
The application will start at `http://localhost:8000`
 
### Access the Dashboard
 
Open your browser and navigate to:
- **Main Landing Page**: `http://localhost:8000/`
- **HR Dashboard**: `http://localhost:8000/hr_dashboard`
- **Job Upload**: `http://localhost:8000/upload_job`
- **Send Email**: `http://localhost:8000/send_email`
 
### Workflow Example
 
#### 1. Upload a Job Description
 
```
1. Navigate to "Job Upload" page
2. Enter job title and description
3. Submit the form
4. System extracts requirements automatically
```
 
#### 2. Process Applications
 
```
1. Upload candidate applications for a job
2. System screens resumes against job requirements
3. View screening results and match percentages
```
 
#### 3. Evaluate Candidates
 
```
1. Review candidate profiles
2. System provides evaluation scores
3. Export candidate rankings
```
 
#### 4. Send Communications
 
```
1. Navigate to "Send Email" page
2. Select candidates and email template
3. System sends personalized emails
```
 
## ⚙️ Configuration & Parameters
 
### Application Settings
 
**File**: `app.py`
 
| Parameter | Default | Description |
|-----------|---------|-------------|
| `SMTP_SERVER` | smtp.gmail.com | Email server address |
| `SMTP_PORT` | 587 | Email server port |
| Host Port | 8000 | API server port (modify in startup command) |
 
### LLM Provider Configuration
 
**File**: `src/llm_provider/gemini_provider.py`
 
The Gemini provider automatically uses the `GOOGLE_API_KEY` from environment variables. Key settings:
 
- **Model**: `gemini-2.0-flash` (default)
- **Max Tokens**: Configurable per request
- **Temperature**: Adjusted for different agent types
 
### Agent Prompts
 
**File**: `src/prompts/agent_prompts.py`
 
Customize AI behavior by editing prompts for:
- Job intake analysis
- Resume screening criteria
- Candidate evaluation rubrics
 
### Data Storage
 
Jobs and applications are stored in the `data/` directory with structure:
 
```
data/
├── Job1/
│   ├── jobDescription.txt
│   └── applications/
│       ├── Candidate1/
│       │   └── generalInformation.json
│       └── Candidate2/
│           └── generalInformation.json
└── Job2/
    ├── jobDescription.txt
    └── applications/
        └── ...
```
 
## 📁 Project Structure
 
```
HRM_OnboardingAgent/
├── app.py                      # Main FastAPI application
├── requirements.txt            # Python dependencies
├── .env                        # Environment variables (create this)
│
├── src/
│   ├── agents/                 # AI agents for different tasks
│   │   ├── intake_agent.py     # Job requirement extraction
│   │   ├── resume_screener_agent.py  # Resume screening
│   │   └── evaluator_agent.py  # Candidate evaluation
│   │
│   ├── llm_provider/           # LLM integration
│   │   └── gemini_provider.py  # Google Gemini API wrapper
│   │
│   ├── prompts/                # AI prompts and templates
│   │   └── agent_prompts.py    # Customizable prompts
│   │
│   └── utils/                  # Utility functions
│       └── helpers.py          # Helper functions
│
├── templates/                  # HTML templates
│   ├── landing.html
│   ├── hr_dashboard.html
│   ├── hr_job_upload.html
│   └── hr_send_email.html
│
├── static/                     # Static files
│   ├── hr_script.js            # Frontend logic
│   └── styles/                 # CSS stylesheets
│
└── data/                       # Job and application data (auto-created)
    └── JobN/
        ├── jobDescription.txt
        └── applications/
            └── CandidateName/
```
 
## 🔐 Security Best Practices
 
1. **Never commit `.env` file** - Add it to `.gitignore`
2. **Use App Passwords** - Enable 2FA and generate app-specific passwords for Gmail
3. **Validate Inputs** - The system validates all file uploads
4. **Secure API Keys** - Keep Gemini API keys private and rotate regularly
5. **CORS Configuration** - Configure CORS settings for production deployment
 
## 🐛 Troubleshooting
 
### Email Configuration Issues
 
**Error**: "Email credentials not configured!"
 
**Solution**: Set environment variables correctly
```powershell
$env:SMTP_EMAIL='your-email@gmail.com'
$env:SMTP_PASSWORD='your_app_password'
```
 
### Gemini API Errors
 
**Error**: "Invalid API Key"
 
**Solution**:
1. Verify your API key is correct in `.env`
2. Check your API quota at [Google Cloud Console](https://console.cloud.google.com)
 
### Virtual Environment Issues
 
**Error**: "Command not found: python"
 
**Solution**:
- Ensure Python is in your PATH
- Try `python3` instead of `python`
- Recreate the virtual environment
 
### Port Already in Use
 
**Error**: "Address already in use"
 
**Solution**: Change the port in the startup command
```bash
python app.py --port 8001
```
 
## 📖 API Endpoints
 
### Core Endpoints
 
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Landing page |
| GET | `/hr_dashboard` | HR dashboard |
| GET | `/upload_job` | Job upload form |
| GET | `/send_email` | Email sender interface |
| POST | `/api/upload_job` | Upload job description |
| POST | `/api/process_application` | Screen resume |
| POST | `/api/send_email` | Send email to candidate |
 
## 🤝 Contributing
 
Contributions are welcome! Please follow these steps:
 
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
 
## 📝 License
 
This project is licensed under the MIT License - see the LICENSE file for details.
 
## 📧 Contact Information
 
**Project Maintainer**: [Your Name]  
**Email**: your-email@example.com  
**GitHub**: [Your GitHub Profile](https://github.com/yourusername)  
**LinkedIn**: [Your LinkedIn Profile](https://linkedin.com/in/yourprofile)  
 
For issues, feature requests, or questions:
- 📌 Open an issue on GitHub
- 💬 Contact via email
- 🔗 Check project wiki for detailed documentation
 
## 🙏 Acknowledgments
 
- **Google Generative AI** - Powering intelligent candidate analysis
- **FastAPI** - Modern web framework for building APIs
- **Community Contributors** - Thank you for your support!
 
## ⭐ Show Your Support
 
If you find this project helpful, please consider giving it a star on GitHub!
 
---
 
**Last Updated**: February 11, 2026  
**Version**: 1.0.0