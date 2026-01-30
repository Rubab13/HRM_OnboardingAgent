// Global variables
let allCandidates = [];

// Load candidates on page load
document.addEventListener('DOMContentLoaded', () => {
    loadCandidates();
    setupEventListeners();
});

async function loadCandidates() {
    const container = document.getElementById('candidatesContainer');
    const countBadge = document.getElementById('candidateCount');
    
    try {
        // Fetch candidates from API
        const response = await fetch('/api/candidates');
        const data = await response.json();
        
        allCandidates = data.candidates || [];
        
        // Update count
        countBadge.textContent = `${allCandidates.length} Candidate${allCandidates.length !== 1 ? 's' : ''}`;
        
        // Clear loading message
        container.innerHTML = '';
        
        if (allCandidates.length === 0) {
            container.innerHTML = '<div class="col-span-full text-center py-8 text-gray-500">No candidates found. Candidates can submit applications at <a href="/student" class="text-blue-600 hover:underline">/student</a></div>';
            return;
        }
        
        // Create candidate cards
        allCandidates.forEach((candidate, index) => {
            const card = createCandidateCard(candidate, index);
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading candidates:', error);
        container.innerHTML = '<div class="col-span-full text-center py-8 text-red-500">Error loading candidates. Please refresh the page.</div>';
    }
}

function createCandidateCard(candidate, index) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow';
    
    const personalInfo = candidate.personalInfo || {};
    const firstName = personalInfo.firstName || 'Unknown';
    const lastName = personalInfo.lastName || '';
    const email = personalInfo.email || 'N/A';
    const phone = personalInfo.phone || 'N/A';
    const location = personalInfo.location || {};
    const locationStr = `${location.city || ''}, ${location.state || ''}`.trim().replace(/^,\s*|,\s*$/g, '') || 'N/A';
    
    const initials = `${firstName[0] || ''}${lastName[0] || ''}`;
    
    // Get skills from the skills object
    const allSkills = [];
    if (candidate.skills) {
        if (Array.isArray(candidate.skills.programming)) {
            allSkills.push(...candidate.skills.programming);
        }
        if (Array.isArray(candidate.skills.frameworks)) {
            allSkills.push(...candidate.skills.frameworks);
        }
        if (Array.isArray(candidate.skills.tools)) {
            allSkills.push(...candidate.skills.tools);
        }
        if (Array.isArray(candidate.skills.cloud)) {
            allSkills.push(...candidate.skills.cloud);
        }
    }
    const displaySkills = allSkills.slice(0, 6);
    
    // Get education info
    const education = candidate.education && candidate.education.length > 0 
        ? candidate.education[0] 
        : {};
    const educationStr = education.degree 
        ? `${education.degree} in ${education.field || ''} - ${education.institution || ''}`.trim()
        : 'N/A';
    
    // Get recent experience
    const experience = candidate.experience && candidate.experience.length > 0
        ? candidate.experience[0]
        : {};
    const experienceStr = experience.title
        ? `${experience.title} at ${experience.company || ''}`.trim()
        : 'N/A';
    
    const yearsOfExperience = candidate.yearsOfExperience || 0;
    const targetRole = candidate.targetRole || 'Not specified';
    const certifications = candidate.certifications || [];
    
    card.innerHTML = `
        <div class="flex items-start gap-3 mb-4 pb-4 border-b border-gray-100">
            <div class="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                ${initials}
            </div>
            <div class="flex-1 min-w-0">
                <h3 class="text-base font-semibold text-gray-900 truncate">${firstName} ${lastName}</h3>
                <p class="text-sm text-gray-600 truncate">${targetRole}</p>
            </div>
        </div>
        
        <div class="space-y-2 mb-4 text-sm text-gray-600">
            <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <span class="truncate">${email}</span>
            </div>
            ${phone !== 'N/A' ? `
            <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <span class="truncate">${phone}</span>
            </div>
            ` : ''}
            <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span class="truncate">${locationStr}</span>
            </div>
            <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <span class="truncate">${yearsOfExperience} years experience</span>
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
            <div class="flex flex-wrap gap-1.5">
                ${certifications.slice(0, 2).map(cert => 
                    `<span class="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">${cert}</span>`
                ).join('')}
                ${certifications.length > 2 ? 
                    `<span class="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded">+${certifications.length - 2} more</span>` 
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
    
    console.log('🎯 Setting up event listeners');
    console.log('Button found:', shortlistBtn ? 'Yes' : 'No');
    console.log('Textarea found:', jobDescription ? 'Yes' : 'No');
    
    if (shortlistBtn) {
        shortlistBtn.addEventListener('click', () => {
            console.log('🖱️ Button clicked!');
            handleShortlist();
        });
    }
    
    // Enable/disable button based on job description
    if (jobDescription) {
        jobDescription.addEventListener('input', (e) => {
            const isValid = e.target.value.trim().length >= 10;
            shortlistBtn.disabled = !isValid;
            console.log('📝 Job description length:', e.target.value.trim().length, '- Button enabled:', isValid);
        });
    }
    
    // Initial state
    shortlistBtn.disabled = true;
}

async function handleShortlist() {
    console.log('🔵 handleShortlist function called');
    
    const jobDescription = document.getElementById('jobDescription').value.trim();
    const shortlistBtn = document.getElementById('shortlistBtn');
    const resultsSection = document.getElementById('resultsSection');
    
    console.log('📝 Job Description:', jobDescription);
    console.log('👥 Total Candidates:', allCandidates.length);
    
    if (!jobDescription) {
        console.log('❌ No job description provided');
        alert('Please enter a job description first!');
        return;
    }
    
    if (allCandidates.length === 0) {
        console.log('❌ No candidates available');
        alert('No candidates available to shortlist!');
        return;
    }
    
    // Disable button and show loading state
    shortlistBtn.disabled = true;
    shortlistBtn.textContent = 'Analyzing with AI...';
    
    console.log('🚀 Making API call to /api/shortlist...');
    
    try {
        // Call the AI-powered shortlist API
        const response = await fetch('/api/shortlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                job_description: jobDescription
            })
        });

        console.log('📡 Response status:', response.status);
        
        const result = await response.json();
        console.log("hi from rubab")
        console.log("this is the result:", result);
        
        if (!result.success) {
            console.log('❌ API returned error:', result.error);
            alert('Error: ' + (result.error || 'Failed to analyze candidates'));
            return;
        }
        
        console.log('✅ API call successful');
        
        // Display results
        displayShortlistedCandidates(result.shortlisted_candidates);
        resultsSection.classList.remove('hidden');
        
        // Smooth scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Log summary
        console.log('Shortlisting Summary:', result.summary);
        console.log(`Total Reviewed: ${result.total_candidates_reviewed}`);
        console.log(`Total Shortlisted: ${result.total_shortlisted}`);
        
    } catch (error) {
        console.error('❌ Error in handleShortlist:', error);
        alert('An error occurred while processing candidates. Please check if GEMINI_API_KEY is set.');
    } finally {
        // Reset button
        shortlistBtn.disabled = false;
        shortlistBtn.textContent = 'Analyze & Shortlist';
        console.log('🔵 handleShortlist function completed');
    }
}

function displayShortlistedCandidates(shortlisted) {
    const container = document.getElementById('shortlistedCandidates');
    
    if (shortlisted.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">No candidates matched the job description criteria (minimum 70% match required).</p>';
        return;
    }
    
    container.innerHTML = shortlisted.map(candidate => {
        const name = candidate.candidate_name || 'Unknown';
        const email = candidate.email || 'N/A';
        const phone = candidate.phone || 'N/A';
        const matchScore = candidate.match_score || 0;
        const rank = candidate.rank || 0;
        const targetRole = candidate.target_role || 'Not specified';
        const strengths = candidate.key_strengths || [];
        const reason = candidate.recommendation_reason || 'Matches job requirements';
        const interviewAreas = candidate.interview_focus_areas || [];
        
        return `
            <div class="border-2 border-green-500 bg-green-50 rounded-lg p-5">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                            #${rank}
                        </div>
                        <div>
                            <h3 class="text-lg font-bold text-gray-900">${name}</h3>
                            <p class="text-sm text-gray-600">${targetRole}</p>
                        </div>
                    </div>
                    <span class="px-4 py-2 bg-green-600 text-white text-base font-bold rounded-full">${matchScore}%</span>
                </div>
                
                <div class="text-sm text-gray-700 space-y-1 mb-3">
                    <div><span class="font-semibold">📧 Email:</span> ${email}</div>
                    ${phone !== 'N/A' ? `<div><span class="font-semibold">📞 Phone:</span> ${phone}</div>` : ''}
                </div>
                
                <div class="bg-white rounded-lg p-3 mb-3 border border-green-200">
                    <p class="text-xs font-bold text-green-800 mb-1">💡 WHY THIS CANDIDATE</p>
                    <p class="text-sm text-gray-800">${reason}</p>
                </div>
                
                ${strengths.length > 0 ? `
                <div class="mb-3">
                    <p class="text-xs font-bold text-gray-700 mb-2">⭐ KEY STRENGTHS</p>
                    <div class="flex flex-wrap gap-1.5">
                        ${strengths.map(strength => 
                            `<span class="px-3 py-1 bg-white text-green-700 text-xs font-medium rounded-full border-2 border-green-300">${strength}</span>`
                        ).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${interviewAreas.length > 0 ? `
                <div>
                    <p class="text-xs font-bold text-gray-700 mb-2">🎯 INTERVIEW FOCUS AREAS</p>
                    <div class="flex flex-wrap gap-1.5">
                        ${interviewAreas.map(area => 
                            `<span class="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200">${area}</span>`
                        ).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// Add console info for developers
console.log('%c🎯 HR Dashboard', 'color: #2563eb; font-size: 16px; font-weight: bold;');
console.log('Candidates loaded from: /api/candidates');
console.log('Total candidates:', allCandidates.length);
