import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - Backend might not be running');
    } else if (error.response) {
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      console.error('No response received - Is backend running?');
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;