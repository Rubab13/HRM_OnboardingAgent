// Global variables
let allCandidates = [];
let allJobs = [];
let selectedJobId = null;
let selectedCandidatesForEmail = new Set();

// Load jobs and setup on page load
document.addEventListener('DOMContentLoaded', () => {
    loadJobs();
    setupEventListeners();
});

async function loadJobs() {
    const jobListContainer = document.getElementById('jobListContainer');
    
    try {
        const response = await fetch('/api/jobs');
        const data = await response.json();
        
        allJobs = data.jobs || [];
        
        if (allJobs.length === 0) {
            jobListContainer.innerHTML = '<div class="text-center text-gray-500 py-8">No jobs available</div>';
            return;
        }
        
        jobListContainer.innerHTML = '';
        allJobs.forEach((job, index) => {
            const jobTitle = extractJobTitle(job.description);
            
            const jobCard = document.createElement('div');
            jobCard.className = 'job-card border-2 border-gray-200 rounded-lg p-4 cursor-pointer transition-all duration-300 animate-slide-in';
            jobCard.style.animationDelay = `${index * 0.1}s`;
            jobCard.setAttribute('data-job-id', job.id);
            
            jobCard.innerHTML = `
                <div class="flex items-start gap-3">
                    <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style="background-color: #D4AF37;">
                        <svg class="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                        <h4 class="font-semibold text-gray-900 mb-1">${jobTitle}</h4>
                        <p class="text-xs text-gray-500 font-mono">${job.id}</p>
                    </div>
                </div>
            `;
            
            jobCard.addEventListener('click', () => selectJob(job));
            
            jobListContainer.appendChild(jobCard);
        });
    } catch (error) {
        console.error('Error loading jobs:', error);
        jobListContainer.innerHTML = '<div class="text-center text-red-500 py-8">Error loading jobs</div>';
    }
}

function selectJob(job) {
    selectedJobId = job.id;
    
    // Remove active state from all job cards
    document.querySelectorAll('[data-job-id]').forEach(card => {
        card.classList.remove('selected');
        card.classList.add('border-gray-200');
    });
    
    // Add active state to selected job card
    const selectedCard = document.querySelector(`[data-job-id="${job.id}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
        selectedCard.classList.remove('border-gray-200');
    }
    
    // Update job description
    document.getElementById('jobDescription').value = job.description;
    
    // Load candidates for this job
    loadCandidates(job.id);
}

function extractJobTitle(description) {
    // Extract job title from "JOB TITLE: [Title]" format
    const match = description.match(/JOB TITLE:\s*(.+)/i);
    return match ? match[1].trim() : 'Unknown Position';
}

async function loadCandidates(jobId) {
    const container = document.getElementById('candidatesContainer');
    const countBadge = document.getElementById('candidateCount');
    const shortlistBtn = document.getElementById('shortlistBtn');
    
    try {
        const response = await fetch(`/api/candidates/${jobId}`);
        const data = await response.json();
        
        allCandidates = data.candidates || [];
        
        countBadge.textContent = `${allCandidates.length} Candidate${allCandidates.length !== 1 ? 's' : ''}`;
        
        container.innerHTML = '';
        
        if (allCandidates.length === 0) {
            container.innerHTML = '<div class="col-span-full text-center py-8 text-gray-500">No candidates found for this position.</div>';
            shortlistBtn.disabled = true;
            return;
        }
        
        shortlistBtn.disabled = false;
        
        allCandidates.forEach((candidate, index) => {
            const card = createCandidateCard(candidate, index);
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading candidates:', error);
        container.innerHTML = '<div class="col-span-full text-center py-8 text-red-500">Error loading candidates.</div>';
    }
}

function createCandidateCard(candidate, index) {
    const card = document.createElement('div');
    card.className = 'candidate-card bg-white rounded-xl shadow-sm border-2 border-gray-200 p-5 animate-fade-in';
    card.style.animationDelay = `${index * 0.05}s`;
    
    const personalInfo = candidate.personalInformation || candidate.personalInfo || {};
    const fullName = personalInfo.fullName || `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.trim() || 'Unknown';
    const email = personalInfo.email || 'N/A';
    const phone = personalInfo.phone || 'N/A';
    
    // Handle location as either object or string
    let location = 'N/A';
    if (personalInfo.location) {
        if (typeof personalInfo.location === 'object') {
            const loc = personalInfo.location;
            location = [loc.city, loc.state, loc.country].filter(Boolean).join(', ');
        } else {
            location = personalInfo.location;
        }
    }
    
    const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    
    // Extract skills from nested structure
    const skills = candidate.skills || {};
    let allSkills = [];
    
    // Recursively extract all skill arrays from nested objects
    function extractSkills(obj) {
        for (let key in obj) {
            if (Array.isArray(obj[key])) {
                allSkills.push(...obj[key]);
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                extractSkills(obj[key]);
            }
        }
    }
    
    extractSkills(skills);
    const displaySkills = allSkills.slice(0, 6);
    
    const education = candidate.education && candidate.education.length > 0 ? candidate.education[0] : {};
    const workExperience = candidate.workExperience || candidate.experience || [];
    const latestJob = workExperience.length > 0 ? workExperience[0] : {};
    const jobTitle = latestJob.jobTitle || latestJob.title || 'N/A';
    
    const certifications = candidate.certifications || [];
    
    card.innerHTML = `
        <div class="flex items-start gap-3 mb-4 pb-4 border-b border-gray-100">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-black font-semibold flex-shrink-0 shadow-md" style="background-color: #D4AF37;">
                ${initials}
            </div>
            <div class="flex-1 min-w-0">
                <h3 class="text-base font-semibold text-gray-900 truncate">${fullName}</h3>
                <p class="text-sm text-gray-600 truncate">${jobTitle}</p>
            </div>
        </div>
        
        <div class="space-y-2 mb-4 text-sm text-gray-600">
            <div class="flex items-center gap-2">
                <svg class="w-4 h-4 flex-shrink-0" style="color: #D4AF37;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <span class="truncate">${email}</span>
            </div>
            <div class="flex items-center gap-2">
                <svg class="w-4 h-4 flex-shrink-0" style="color: #D4AF37;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <span class="truncate">${phone}</span>
            </div>
            <div class="flex items-center gap-2">
                <svg class="w-4 h-4 flex-shrink-0" style="color: #D4AF37;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span class="truncate">${location}</span>
            </div>
        </div>
        
        ${displaySkills.length > 0 ? `
        <div class="mb-3">
            <p class="text-xs font-medium text-gray-500 mb-2">Skills</p>
            <div class="flex flex-wrap gap-1.5">
                ${displaySkills.map(skill => 
                    `<span class="px-2 py-1 text-xs rounded-md font-medium border" style="background-color: #FFF9E6; color: #8B7500; border-color: #D4AF37;">${skill}</span>`
                ).join('')}
            </div>
        </div>
        ` : ''}
        
        ${certifications.length > 0 ? `
        <div>
            <p class="text-xs font-medium text-gray-500 mb-2">Certifications</p>
            <p class="text-xs text-gray-600">${certifications.slice(0, 2).join(', ')}</p>
        </div>
        ` : ''}
    `;
    
    return card;
}

function setupEventListeners() {
    const shortlistBtn = document.getElementById('shortlistBtn');
    shortlistBtn.addEventListener('click', handleShortlist);
}

async function handleShortlist() {
    console.log('Shortlist button clicked');
    
    const jobDescription = document.getElementById('jobDescription').value.trim();
    const shortlistBtn = document.getElementById('shortlistBtn');
    const resultsSection = document.getElementById('resultsSection');
    
    if (!selectedJobId) {
        alert('Please select a job position first');
        return;
    }
    
    if (!jobDescription || jobDescription.length < 10) {
        alert('Please select a valid job position');
        return;
    }
    
    shortlistBtn.disabled = true;
    shortlistBtn.textContent = 'Analyzing...';
    resultsSection.classList.add('hidden');
    
    try {
        console.log('Sending request to /api/shortlist');
        console.log('Job ID:', selectedJobId);
        console.log('Job Description length:', jobDescription.length);
        
        const response = await fetch('/api/shortlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                job_id: selectedJobId,
                job_description: jobDescription
            })
        });
        
        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (response.ok && data.success) {
            displayShortlistedCandidates(data.shortlisted_candidates);
            resultsSection.classList.remove('hidden');
        } else {
            alert(`Error: ${data.error || 'Unknown error occurred'}`);
        }
    } catch (error) {
        console.error('Error during shortlisting:', error);
        alert(`Failed to analyze candidates: ${error.message}`);
    } finally {
        shortlistBtn.disabled = false;
        shortlistBtn.textContent = 'Analyze & Shortlist';
    }
}

function displayShortlistedCandidates(candidates) {
    const container = document.getElementById('shortlistedCandidates');
    
    if (!candidates || candidates.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">No candidates meet the minimum requirements.</p>';
        updateEmailButtonVisibility();
        return;
    }
    
    // Clear selected candidates when new shortlist is displayed
    selectedCandidatesForEmail.clear();
    updateEmailButtonVisibility();
    
    container.innerHTML = candidates.map((candidate, index) => {
        // Use candidate_name directly from the response
        const fullName = candidate.candidate_name || 'Unknown';
        const email = candidate.email || 'N/A';
        const phone = candidate.phone || 'N/A';
        const candidateId = `${fullName}_${email}`.replace(/\s+/g, '_');
        
        return `
            <div class="border border-gray-200 rounded-lg p-5 hover:border-yellow-500 transition-colors animate-fade-in" style="animation-delay: ${index * 0.1}s">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center gap-3">
                        <input 
                            type="checkbox" 
                            id="candidate_${candidateId}"
                            class="w-5 h-5 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500 cursor-pointer"
                            onchange="toggleCandidateSelection('${candidateId}', '${fullName.replace(/'/g, "\\'").replace(/"/g, '&quot;')}', '${email}')"
                        />
                        <div class="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
                            ${index + 1}
                        </div>
                        <div>
                            <h3 class="font-semibold text-gray-900">${fullName}</h3>
                            <p class="text-sm text-gray-600">${email}</p>
                            ${phone !== 'N/A' ? `<p class="text-sm text-gray-600">${phone}</p>` : ''}
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-2xl font-bold text-green-600">${candidate.match_score}%</div>
                        <div class="text-xs text-gray-500">Match Score</div>
                    </div>
                </div>
                
                ${candidate.recommendation_reason ? `
                <div class="mb-3 p-3 rounded-lg" style="background-color: #FFF9E6;">
                    <p class="text-xs font-medium mb-1" style="color: #8B7500;">Recommendation:</p>
                    <p class="text-sm" style="color: #6B5A00;">${candidate.recommendation_reason}</p>
                </div>
                ` : ''}
                
                ${candidate.key_strengths && candidate.key_strengths.length > 0 ? `
                <div class="mb-3">
                    <p class="text-xs font-medium text-gray-700 mb-2">Key Strengths:</p>
                    <ul class="text-sm text-gray-600 space-y-1">
                        ${candidate.key_strengths.map(s => `<li class="flex items-start"><span class="text-green-600 mr-2">✓</span><span>${s}</span></li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                
                ${candidate.interview_focus_areas && candidate.interview_focus_areas.length > 0 ? `
                <div>
                    <p class="text-xs font-medium text-gray-700 mb-2">Interview Focus Areas:</p>
                    <ul class="text-sm text-gray-600 space-y-1">
                        ${candidate.interview_focus_areas.map(f => `<li class="flex items-start"><span class="mr-2" style="color: #D4AF37;">→</span><span>${f}</span></li>`).join('')}
                    </ul>
                </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function toggleCandidateSelection(candidateId, name, email) {
    const checkbox = document.getElementById(`candidate_${candidateId}`);
    
    if (checkbox.checked) {
        selectedCandidatesForEmail.add(JSON.stringify({ id: candidateId, name, email }));
    } else {
        selectedCandidatesForEmail.delete(JSON.stringify({ id: candidateId, name, email }));
    }
    
    updateEmailButtonVisibility();
}

function updateEmailButtonVisibility() {
    const sendEmailBtn = document.getElementById('sendEmailBtn');
    const selectedCount = document.getElementById('selectedCount');
    
    if (selectedCandidatesForEmail.size > 0) {
        sendEmailBtn.classList.remove('hidden');
        selectedCount.textContent = selectedCandidatesForEmail.size;
    } else {
        sendEmailBtn.classList.add('hidden');
    }
}

function goToSendEmail() {
    if (selectedCandidatesForEmail.size === 0) return;
    
    // Convert Set to Array
    const candidates = Array.from(selectedCandidatesForEmail).map(c => JSON.parse(c));
    
    // Store in sessionStorage
    sessionStorage.setItem('selectedCandidates', JSON.stringify(candidates));
    
    // Navigate to send email page
    window.location.href = '/hr-send-email';
}
