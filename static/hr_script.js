// Global variables
let allCandidates = [];
let allJobs = [];
let selectedJobId = null;

// Load jobs and setup on page load
document.addEventListener('DOMContentLoaded', () => {
    loadJobs();
    setupEventListeners();
});

async function loadJobs() {
    const jobSelect = document.getElementById('jobSelect');
    
    try {
        const response = await fetch('/api/jobs');
        const data = await response.json();
        
        allJobs = data.jobs || [];
        
        jobSelect.innerHTML = '<option value="">Select a job position...</option>';
        allJobs.forEach(job => {
            const option = document.createElement('option');
            option.value = job.id;
            option.textContent = job.id.replace(/_/g, ' ').replace(/job(\d+)/, 'Job Position $1');
            jobSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading jobs:', error);
        jobSelect.innerHTML = '<option value="">Error loading jobs</option>';
    }
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
    card.className = 'bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow';
    
    const personalInfo = candidate.personalInformation || candidate.personalInfo || {};
    const fullName = personalInfo.fullName || `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.trim() || 'Unknown';
    const email = personalInfo.email || 'N/A';
    const phone = personalInfo.phone || 'N/A';
    const location = personalInfo.location || 'N/A';
    
    const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    
    const skills = candidate.skills || {};
    const allSkills = [
        ...(skills.technical || []),
        ...(skills.programming || []),
        ...(skills.frameworks || []),
        ...(skills.tools || []),
        ...(skills.cloud || [])
    ];
    const displaySkills = allSkills.slice(0, 6);
    
    const education = candidate.education && candidate.education.length > 0 ? candidate.education[0] : {};
    const workExperience = candidate.workExperience || candidate.experience || [];
    const latestJob = workExperience.length > 0 ? workExperience[0] : {};
    const jobTitle = latestJob.jobTitle || latestJob.title || 'N/A';
    
    const certifications = candidate.certifications || [];
    
    card.innerHTML = `
        <div class="flex items-start gap-3 mb-4 pb-4 border-b border-gray-100">
            <div class="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                ${initials}
            </div>
            <div class="flex-1 min-w-0">
                <h3 class="text-base font-semibold text-gray-900 truncate">${fullName}</h3>
                <p class="text-sm text-gray-600 truncate">${jobTitle}</p>
            </div>
        </div>
        
        <div class="space-y-2 mb-4 text-sm text-gray-600">
            <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <span class="truncate">${email}</span>
            </div>
            <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <span class="truncate">${phone}</span>
            </div>
            <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    `<span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">${skill}</span>`
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
    const jobSelect = document.getElementById('jobSelect');
    const jobDescription = document.getElementById('jobDescription');
    const shortlistBtn = document.getElementById('shortlistBtn');
    
    jobSelect.addEventListener('change', (e) => {
        const jobId = e.target.value;
        selectedJobId = jobId;
        
        if (jobId) {
            const selectedJob = allJobs.find(j => j.id === jobId);
            if (selectedJob) {
                jobDescription.value = selectedJob.description;
                loadCandidates(jobId);
            }
        } else {
            jobDescription.value = '';
            document.getElementById('candidatesContainer').innerHTML = '<div class="col-span-full text-center py-8 text-gray-500">Select a job to view candidates</div>';
            document.getElementById('candidateCount').textContent = '';
            shortlistBtn.disabled = true;
        }
    });
    
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
        return;
    }
    
    container.innerHTML = candidates.map((candidate, index) => {
        const personalInfo = candidate.candidate_info?.personalInformation || candidate.candidate_info?.personalInfo || {};
        const fullName = personalInfo.fullName || `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.trim() || 'Unknown';
        const email = personalInfo.email || 'N/A';
        
        return `
            <div class="border border-gray-200 rounded-lg p-5 hover:border-blue-300 transition-colors">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
                            ${index + 1}
                        </div>
                        <div>
                            <h3 class="font-semibold text-gray-900">${fullName}</h3>
                            <p class="text-sm text-gray-600">${email}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-2xl font-bold text-green-600">${candidate.match_score}%</div>
                        <div class="text-xs text-gray-500">Match Score</div>
                    </div>
                </div>
                
                <div class="grid grid-cols-3 gap-3 mb-3 text-sm">
                    <div>
                        <p class="text-gray-500 text-xs">Skills Match</p>
                        <p class="font-medium text-gray-900">${candidate.skills_match || 'N/A'}</p>
                    </div>
                    <div>
                        <p class="text-gray-500 text-xs">Experience</p>
                        <p class="font-medium text-gray-900">${candidate.experience_match || 'N/A'}</p>
                    </div>
                    <div>
                        <p class="text-gray-500 text-xs">Education</p>
                        <p class="font-medium text-gray-900">${candidate.education_match || 'N/A'}</p>
                    </div>
                </div>
                
                ${candidate.strengths && candidate.strengths.length > 0 ? `
                <div class="mb-3">
                    <p class="text-xs font-medium text-gray-700 mb-1">Strengths:</p>
                    <ul class="text-sm text-gray-600 space-y-1">
                        ${candidate.strengths.map(s => `<li>• ${s}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                
                ${candidate.interview_focus && candidate.interview_focus.length > 0 ? `
                <div>
                    <p class="text-xs font-medium text-gray-700 mb-1">Interview Focus:</p>
                    <ul class="text-sm text-gray-600 space-y-1">
                        ${candidate.interview_focus.map(f => `<li>• ${f}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
            </div>
        `;
    }).join('');
}
