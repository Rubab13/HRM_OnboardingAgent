// Sample candidate data - replace with API calls later
const candidates = [
    {
        firstName: "Sarah",
        lastName: "Chen",
        email: "sarah.chen@email.com",
        phone: "(555) 123-4567",
        location: "San Francisco, CA",
        targetRole: "Data Scientist",
        yearsOfExperience: 2,
        education: "MS in Data Science - UC Berkeley",
        skills: ["Python", "Machine Learning", "TensorFlow", "AWS", "SQL", "Deep Learning"],
        recentRole: "Data Science Intern at TechCorp",
        certifications: ["AWS ML Specialty", "TensorFlow Developer"]
    },
    {
        firstName: "Marcus",
        lastName: "Johnson",
        email: "marcus.johnson@email.com",
        phone: "(555) 234-5678",
        location: "Seattle, WA",
        targetRole: "Senior Cloud Engineer",
        yearsOfExperience: 3,
        education: "BS in Computer Engineering - Georgia Tech",
        skills: ["AWS", "Kubernetes", "Terraform", "Docker", "Python", "CI/CD"],
        recentRole: "Cloud Engineer at CloudScale Inc.",
        certifications: ["AWS Solutions Architect Pro", "CKA", "Azure Expert"]
    },
    {
        firstName: "Priya",
        lastName: "Patel",
        email: "priya.patel@email.com",
        phone: "(555) 345-6789",
        location: "Austin, TX",
        targetRole: "Senior Platform Engineer",
        yearsOfExperience: 3.5,
        education: "BTech in IT - IIT Bombay",
        skills: ["Kubernetes", "ArgoCD", "Terraform", "Python", "Go", "GitOps"],
        recentRole: "Platform Engineer at DevTools Corp",
        certifications: ["CKAD", "CKA", "AWS DevOps Pro"]
    },
    {
        firstName: "Alex",
        lastName: "Rodriguez",
        email: "alex.rodriguez@email.com",
        phone: "(555) 456-7890",
        location: "Miami, FL",
        targetRole: "Senior Full Stack Developer",
        yearsOfExperience: 4,
        education: "BS in Computer Science - University of Florida",
        skills: ["React", "Node.js", "TypeScript", "AWS", "PostgreSQL", "Docker"],
        recentRole: "Senior Full Stack Developer at WebSolutions",
        certifications: ["AWS Developer Associate", "Meta Frontend Pro"]
    },
    {
        firstName: "Emily",
        lastName: "Thompson",
        email: "emily.thompson@email.com",
        phone: "(555) 567-8901",
        location: "Boston, MA",
        targetRole: "Senior Business Analyst",
        yearsOfExperience: 3,
        education: "MBA - Boston University",
        skills: ["Business Analysis", "SQL", "Tableau", "Power BI", "JIRA", "Agile"],
        recentRole: "Business Analyst at Enterprise Solutions",
        certifications: ["PSM I", "Power BI Analyst", "Six Sigma Yellow Belt"]
    }
];

// Load candidates on page load
document.addEventListener('DOMContentLoaded', () => {
    loadCandidates();
    setupEventListeners();
});

function loadCandidates() {
    const container = document.getElementById('candidatesContainer');
    const countBadge = document.getElementById('candidateCount');
    
    // Update count
    countBadge.textContent = `${candidates.length} Candidates`;
    
    // Clear loading message
    container.innerHTML = '';
    
    // Create candidate cards
    candidates.forEach((candidate, index) => {
        const card = createCandidateCard(candidate, index);
        container.appendChild(card);
    });
}

function createCandidateCard(candidate, index) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow';
    
    const initials = `${candidate.firstName[0]}${candidate.lastName[0]}`;
    const displaySkills = candidate.skills.slice(0, 6);
    
    card.innerHTML = `
        <div class="flex items-start gap-3 mb-4 pb-4 border-b border-gray-100">
            <div class="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                ${initials}
            </div>
            <div class="flex-1 min-w-0">
                <h3 class="text-base font-semibold text-gray-900 truncate">${candidate.firstName} ${candidate.lastName}</h3>
                <p class="text-sm text-gray-600 truncate">${candidate.targetRole}</p>
            </div>
        </div>
        
        <div class="space-y-2 mb-4 text-sm text-gray-600">
            <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <span class="truncate">${candidate.email}</span>
            </div>
            <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span class="truncate">${candidate.location}</span>
            </div>
            <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <span class="truncate">${candidate.yearsOfExperience} years</span>
            </div>
        </div>
        
        <div class="mb-3">
            <p class="text-xs font-medium text-gray-500 mb-2">Skills</p>
            <div class="flex flex-wrap gap-1.5">
                ${displaySkills.map(skill => 
                    `<span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">${skill}</span>`
                ).join('')}
            </div>
        </div>
        
        ${candidate.certifications && candidate.certifications.length > 0 ? `
            <div>
                <p class="text-xs font-medium text-gray-500 mb-2">Certifications</p>
                <div class="flex flex-wrap gap-1.5">
                    ${candidate.certifications.slice(0, 2).map(cert => 
                        `<span class="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">${cert}</span>`
                    ).join('')}
                    ${candidate.certifications.length > 2 ? 
                        `<span class="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded">+${candidate.certifications.length - 2} more</span>` 
                        : ''}
                </div>
            </div>
        ` : ''}
    `;
    
    return card;
}

function setupEventListeners() {
    const shortlistBtn = document.getElementById('shortlistBtn');
    const jobDescription = document.getElementById('jobDescription');
    
    shortlistBtn.addEventListener('click', handleShortlist);
    
    // Enable/disable button based on job description
    jobDescription.addEventListener('input', (e) => {
        shortlistBtn.disabled = e.target.value.trim().length < 10;
    });
    
    // Initial state
    shortlistBtn.disabled = true;
}

async function handleShortlist() {
    const jobDescription = document.getElementById('jobDescription').value.trim();
    const shortlistBtn = document.getElementById('shortlistBtn');
    const resultsSection = document.getElementById('resultsSection');
    const shortlistedContainer = document.getElementById('shortlistedCandidates');
    
    if (!jobDescription) {
        alert('Please enter a job description first!');
        return;
    }
    textContent = 'Analyzing...';
    
    try {
        // TODO: Replace with actual API call to backend
        // const response = await fetch('/api/shortlist', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //         jobDescription: jobDescription,
        //         candidates: candidates
        //     })
        // });
        // const result = await response.json();
        
        // Simulate API call with timeout (remove this when backend is ready)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock shortlisted results (replace with actual API response)
        const mockShortlisted = [
            {
                ...candidates[0],
                matchScore: 95,
                reason: "Strong match with ML/AI expertise, Python proficiency, and AWS cloud experience"
            },
            {
                ...candidates[1],
                matchScore: 88,
                reason: "Excellent cloud infrastructure skills with Kubernetes and AWS expertise"
            },
            {
                ...candidates[3],
                matchScore: 82,
                reason: "Solid full-stack development experience with modern tech stack"
            }
        ];
        
        // Display results
        displayShortlistedCandidates(mockShortlisted);
        resultsSection.classList.remove('hidden');
        
        // Smooth scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while processing candidates. Please try again.');
    } finally {
        // Reset button
        shortlistBtn.disabled = false;
        shortlistBtn.textContent = 'Analyze & Shortlist'
        // Reset button
        shortlistBtn.disabled = false;
        shortlistBtn.innerHTML = '<span class="btn-icon">✨</span> Analyze & Shortlist Candidates';
    }
}

function displayShortlistedCandidates(shortlisted) {
    const container = document.getElementById('shortlistedCandidates');
    
    if (shortlisted.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">No candidates matched the job description criteria.</p>';
        return;
    }
    
    container.innerHTML = shortlisted.map(candidate => `
        <div class="border border-green-200 bg-green-50 rounded-lg p-4">
            <div class="flex justify-between items-start mb-3">
                <div>
                    <h3 class="text-base font-semibold text-gray-900">${candidate.firstName} ${candidate.lastName}</h3>
                    <p class="text-sm text-gray-600">${candidate.targetRole}</p>
                </div>
                <span class="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded-full">${candidate.matchScore}%</span>
            </div>
            
            <div class="text-sm text-gray-700 space-y-1 mb-3">
                <div><span class="font-medium">Email:</span> ${candidate.email}</div>
                <div><span class="font-medium">Phone:</span> ${candidate.phone}</div>
                <div><span class="font-medium">Location:</span> ${candidate.location}</div>
            </div>
            
            <div class="bg-white rounded p-3 mb-3">
                <p class="text-xs font-medium text-gray-500 mb-1">Match Reason</p>
                <p class="text-sm text-gray-700">${candidate.reason}</p>
            </div>
            
            <div>
                <p class="text-xs font-medium text-gray-500 mb-2">Top Skills</p>
                <div class="flex flex-wrap gap-1.5">
                    ${candidate.skills.slice(0, 5).map(skill => 
                        `<span class="px-2 py-1 bg-white text-gray-700 text-xs rounded border border-gray-200">${skill}</span>`
                    ).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// Add some console info for developers
console.log('%c🎯 HR Candidate Shortlisting System', 'color: #667eea; font-size: 20px; font-weight: bold;');
console.log('%cBackend API Integration Points:', 'color: #764ba2; font-size: 14px; font-weight: bold;');
console.log('1. POST /api/shortlist - Send job description and get shortlisted candidates');
console.log('2. GET /api/candidates - Fetch all candidates from database');
console.log('3. GET /api/candidate/:id - Get detailed candidate information');
