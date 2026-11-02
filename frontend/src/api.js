
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://afterward-api.onrender.com/api'
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('afterword_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const err = error =>
  error?.response?.data?.message ||
  error?.message ||
  'Something went wrong.';

export default api;
