/**
 * Migration Script to Standardize All Candidate Data
 * This script validates and updates all generalInformation.json files
 * to match the standardized interface across all jobs.
 */

const fs = require('fs');
const path = require('path');

// The standardized interface structure
const requiredStructure = {
  personalInfo: {
    firstName: 'string',
    lastName: 'string',
    email: 'string',
    phone: 'string',
    location: {
      city: 'string',
      state: 'string',
      country: 'string'
    },
    dateOfBirth: 'string',
    linkedin: 'string',
    github: 'string'
  },
  education: 'array',
  experience: 'array',
  skills: {
    programming: 'array',
    frameworks: 'array',
    tools: 'array',
    cloud: 'array',
    databases: 'array',
    testing: 'array'
  },
  certifications: 'array',
  targetRole: 'string',
  applicationDate: 'string',
  status: 'string',
  yearsOfExperience: 'number'
};

/**
 * Flatten nested skills structure to match interface
 */
function flattenSkills(skills) {
  const flattened = {
    programming: [],
    frameworks: [],
    tools: [],
    cloud: [],
    databases: [],
    testing: []
  };

  if (!skills) return flattened;

  // If skills is already in correct format, use it
  if (Array.isArray(skills.programming)) {
    return {
      programming: skills.programming || [],
      frameworks: skills.frameworks || [],
      tools: skills.tools || [],
      cloud: skills.cloud || [],
      databases: skills.databases || [],
      testing: skills.testing || []
    };
  }

  // Otherwise, flatten nested structure
  Object.keys(skills).forEach(category => {
    const value = skills[category];
    
    if (Array.isArray(value)) {
      // Direct array - categorize it
      if (category === 'versionControl' || category === 'operatingSystems') {
        flattened.tools.push(...value);
      } else {
        flattened.tools.push(...value);
      }
    } else if (typeof value === 'object' && value !== null) {
      // Nested object - extract all arrays
      Object.values(value).forEach(nested => {
        if (Array.isArray(nested)) {
          // Categorize based on parent key
          if (category.includes('cloud') || category === 'iac' || category === 'containers') {
            flattened.cloud.push(...nested);
          } else if (category === 'scripting') {
            flattened.programming.push(...nested);
          } else if (category === 'cicd' || category === 'monitoring') {
            flattened.tools.push(...nested);
          } else if (category === 'security' || category === 'networking') {
            flattened.tools.push(...nested);
          } else {
            flattened.tools.push(...nested);
          }
        }
      });
    }
  });

  // Remove duplicates and clean up
  Object.keys(flattened).forEach(key => {
    flattened[key] = [...new Set(flattened[key])].filter(item => 
      typeof item === 'string' && item.trim().length > 0
    );
  });

  return flattened;
}

/**
 * Normalize candidate data to match the interface
 */
function normalizeCandidate(data) {
  const normalized = {
    personalInfo: {
      firstName: data.personalInfo?.firstName || '',
      lastName: data.personalInfo?.lastName || '',
      email: data.personalInfo?.email || '',
      phone: data.personalInfo?.phone || '',
      location: {
        city: data.personalInfo?.location?.city || '',
        state: data.personalInfo?.location?.state || '',
        country: data.personalInfo?.location?.country || ''
      },
      dateOfBirth: data.personalInfo?.dateOfBirth || '',
      linkedin: data.personalInfo?.linkedin || '',
      github: data.personalInfo?.github || ''
    },
    education: Array.isArray(data.education) ? data.education.map(edu => ({
      degree: edu.degree || '',
      field: edu.field || '',
      institution: edu.institution || '',
      startDate: edu.startDate || '',
      endDate: edu.endDate || '',
      gpa: edu.gpa || null,
      honors: Array.isArray(edu.honors) ? edu.honors : []
    })) : [],
    experience: Array.isArray(data.experience) ? data.experience.map(exp => ({
      title: exp.title || '',
      company: exp.company || '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || null,
      description: exp.description || ''
    })) : [],
    skills: flattenSkills(data.skills),
    certifications: Array.isArray(data.certifications) ? data.certifications : [],
    targetRole: data.targetRole || '',
    applicationDate: data.applicationDate || '',
    status: data.status || 'pending',
    yearsOfExperience: typeof data.yearsOfExperience === 'number' ? data.yearsOfExperience : 0
  };

  // Add optional fields if they exist
  if (data.personalInfo?.portfolio) {
    normalized.personalInfo.portfolio = data.personalInfo.portfolio;
  }
  if (Array.isArray(data.projects)) {
    normalized.projects = data.projects;
  }

  return normalized;
}

/**
 * Check if data matches the interface EXACTLY
 */
function validateStructure(data) {
  const issues = [];

  if (!data.personalInfo) issues.push('Missing personalInfo');
  if (!Array.isArray(data.education) || data.education.length === 0) issues.push('Missing or empty education array');
  if (!Array.isArray(data.experience) || data.experience.length === 0) issues.push('Missing or empty experience array');
  if (!data.skills) issues.push('Missing skills');
  
  // Check skills structure - must be flat arrays, not nested objects
  if (data.skills) {
    if (!Array.isArray(data.skills.programming)) issues.push('skills.programming must be an array');
    if (!Array.isArray(data.skills.frameworks)) issues.push('skills.frameworks must be an array');
    if (!Array.isArray(data.skills.tools)) issues.push('skills.tools must be an array');
    if (!Array.isArray(data.skills.cloud)) issues.push('skills.cloud must be an array');
    if (!Array.isArray(data.skills.databases)) issues.push('skills.databases must be an array');
    if (!Array.isArray(data.skills.testing)) issues.push('skills.testing must be an array');
  }
  
  if (!data.targetRole) issues.push('Missing targetRole');
  if (!data.applicationDate) issues.push('Missing applicationDate');
  if (typeof data.yearsOfExperience !== 'number') issues.push('Missing or invalid yearsOfExperience');

  return { valid: issues.length === 0, issues };
}

/**
 * Process all candidates in all job folders
 */
function processAllCandidates() {
  const dataDir = path.join(__dirname, 'data');
  
  if (!fs.existsSync(dataDir)) {
    console.log('❌ Data directory not found');
    return;
  }

  console.log('🔍 Scanning all candidate files...\n');
  
  let totalCandidates = 0;
  let updatedCandidates = 0;
  let validCandidates = 0;

  const jobFolders = fs.readdirSync(dataDir).filter(item => {
    const itemPath = path.join(dataDir, item);
    return fs.statSync(itemPath).isDirectory();
  });

  for (const jobFolder of jobFolders) {
    console.log(`\n📁 Processing ${jobFolder}...`);
    
    const applicationsDir = path.join(dataDir, jobFolder, 'applications');
    
    if (!fs.existsSync(applicationsDir)) {
      console.log(`   ⚠️  No applications folder found`);
      continue;
    }

    const candidates = fs.readdirSync(applicationsDir).filter(item => {
      const itemPath = path.join(applicationsDir, item);
      return fs.statSync(itemPath).isDirectory();
    });

    for (const candidate of candidates) {
      const jsonPath = path.join(applicationsDir, candidate, 'generalInformation.json');
      
      if (!fs.existsSync(jsonPath)) {
        console.log(`   ❌ ${candidate}: generalInformation.json not found`);
        continue;
      }

      totalCandidates++;

      try {
        // Read existing data
        const rawData = fs.readFileSync(jsonPath, 'utf8');
        const data = JSON.parse(rawData);

        // Validate structure
        const validation = validateStructure(data);

        if (validation.valid) {
          console.log(`   ✅ ${candidate}: Already valid`);
          validCandidates++;
        } else {
          console.log(`   🔄 ${candidate}: Normalizing data...`);
          console.log(`      Issues: ${validation.issues.join(', ')}`);

          // Normalize data
          const normalized = normalizeCandidate(data);

          // Create backup
          const backupPath = jsonPath + '.backup';
          fs.writeFileSync(backupPath, rawData, 'utf8');

          // Save normalized data
          fs.writeFileSync(jsonPath, JSON.stringify(normalized, null, 2), 'utf8');

          console.log(`   ✅ ${candidate}: Updated successfully`);
          console.log(`      Backup saved: generalInformation.json.backup`);
          updatedCandidates++;
        }
      } catch (error) {
        console.log(`   ❌ ${candidate}: Error - ${error.message}`);
      }
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('MIGRATION SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Candidates: ${totalCandidates}`);
  console.log(`Already Valid: ${validCandidates}`);
  console.log(`Updated: ${updatedCandidates}`);
  console.log(`Success Rate: ${totalCandidates > 0 ? ((validCandidates + updatedCandidates) / totalCandidates * 100).toFixed(1) : 0}%`);
  console.log('='.repeat(80) + '\n');
}

// Run the migration
processAllCandidates();
