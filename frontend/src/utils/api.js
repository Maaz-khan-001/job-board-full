import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401 responses
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  getProfile: () => api.get('/auth/profile/'),
  refreshToken: (refreshToken) => api.post('/auth/token/refresh/', { refresh: refreshToken }),
};

// Jobs API calls
export const jobsAPI = {
  getJobs: (params = {}) => api.get('/jobs/jobs/', { params }),
  getJob: (id) => api.get(`/jobs/jobs/${id}/`),
  createJob: (jobData) => api.post('/jobs/jobs/', jobData),
  updateJob: (id, jobData) => api.put(`/jobs/jobs/${id}/`, jobData),
  deleteJob: (id) => api.delete(`/jobs/jobs/${id}/`),
  getJobApplications: (jobId) => api.get(`/jobs/jobs/${jobId}/applications/`),
};

// Applications API calls
export const applicationsAPI = {
  getApplications: (params = {}) => api.get('/jobs/applications/', { params }),
  getApplication: (id) => api.get(`/jobs/applications/${id}/`),
  createApplication: (applicationData) => {
    const formData = new FormData();
    Object.keys(applicationData).forEach(key => {
      if (applicationData[key] !== null && applicationData[key] !== undefined) {
        formData.append(key, applicationData[key]);
      }
    });
    return api.post('/jobs/applications/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  updateApplication: (id, applicationData) => api.put(`/jobs/applications/${id}/`, applicationData),
  deleteApplication: (id) => api.delete(`/jobs/applications/${id}/`),
};

// Companies API calls
export const companiesAPI = {
  getCompanies: (params = {}) => api.get('/jobs/companies/', { params }),
  getCompany: (id) => api.get(`/jobs/companies/${id}/`),
  createCompany: (companyData) => api.post('/jobs/companies/', companyData),
  updateCompany: (id, companyData) => api.put(`/jobs/companies/${id}/`, companyData),
  deleteCompany: (id) => api.delete(`/jobs/companies/${id}/`),
};

// Interviews API calls
export const interviewsAPI = {
  getInterviews: (params = {}) => api.get('/jobs/interviews/', { params }),
  getInterview: (id) => api.get(`/jobs/interviews/${id}/`),
  createInterview: (interviewData) => api.post('/jobs/interviews/', interviewData),
  updateInterview: (id, interviewData) => api.put(`/jobs/interviews/${id}/`, interviewData),
  deleteInterview: (id) => api.delete(`/jobs/interviews/${id}/`),
};

export default api;