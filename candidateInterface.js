/**
 * Candidate Application Data Interface
 * This is the standardized structure that ALL candidates must follow
 * across Job1, Job2, Job3, and any future jobs.
 */

/**
 * @typedef {Object} Location
 * @property {string} city - City name
 * @property {string} state - State/Province
 * @property {string} country - Country name
 */

/**
 * @typedef {Object} PersonalInfo
 * @property {string} firstName - First name
 * @property {string} lastName - Last name
 * @property {string} email - Email address
 * @property {string} phone - Phone number
 * @property {Location} location - Location details
 * @property {string} dateOfBirth - Date of birth (YYYY-MM-DD format)
 * @property {string} linkedin - LinkedIn profile URL
 * @property {string} github - GitHub profile URL
 * @property {string} [portfolio] - Portfolio website URL (optional)
 */

/**
 * @typedef {Object} Education
 * @property {string} degree - Degree name
 * @property {string} field - Field of study
 * @property {string} institution - Institution name
 * @property {string} startDate - Start date (YYYY-MM format)
 * @property {string} endDate - End date (YYYY-MM format)
 * @property {number} [gpa] - GPA (optional)
 * @property {string[]} [honors] - Honors and awards (optional)
 */

/**
 * @typedef {Object} Experience
 * @property {string} title - Job title
 * @property {string} company - Company name
 * @property {string} startDate - Start date (YYYY-MM format)
 * @property {string|null} endDate - End date (YYYY-MM format) or "Present" or null
 * @property {string} description - Job description
 */

/**
 * @typedef {Object} Skills
 * @property {string[]} programming - Programming languages
 * @property {string[]} frameworks - Frameworks and libraries
 * @property {string[]} tools - Development tools
 * @property {string[]} [cloud] - Cloud platforms (optional)
 * @property {string[]} [databases] - Database technologies (optional)
 * @property {string[]} [testing] - Testing frameworks (optional)
 */

/**
 * @typedef {Object} CandidateApplication
 * @property {PersonalInfo} personalInfo - Personal information
 * @property {Education[]} education - Education history (at least 1 required)
 * @property {Experience[]} experience - Work experience (at least 1 required)
 * @property {Skills} skills - Skills and expertise
 * @property {string[]} [certifications] - Professional certifications (optional)
 * @property {string[]} [projects] - Notable projects (optional)
 * @property {string} targetRole - Desired job role
 * @property {string} applicationDate - Application date (YYYY-MM-DD format)
 * @property {string} status - Application status (default: "pending")
 * @property {number} yearsOfExperience - Years of professional experience
 */

/**
 * Template for a new candidate application
 * @type {CandidateApplication}
 */
const candidateTemplate = {
  personalInfo: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: {
      city: "",
      state: "",
      country: ""
    },
    dateOfBirth: "",
    linkedin: "",
    github: "",
    portfolio: ""
  },
  education: [
    {
      degree: "",
      field: "",
      institution: "",
      startDate: "",
      endDate: "",
      gpa: 0,
      honors: []
    }
  ],
  experience: [
    {
      title: "",
      company: "",
      startDate: "",
      endDate: "",
      description: ""
    }
  ],
  skills: {
    programming: [],
    frameworks: [],
    tools: [],
    cloud: [],
    databases: [],
    testing: []
  },
  certifications: [],
  projects: [],
  targetRole: "",
  applicationDate: "",
  status: "pending",
  yearsOfExperience: 0
};

module.exports = {
  candidateTemplate
};
