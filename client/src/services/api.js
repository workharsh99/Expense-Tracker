import axios from 'axios'

let baseUrl = import.meta.env.VITE_API_URL || '/api';
if (baseUrl && baseUrl !== '/api' && !baseUrl.endsWith('/api')) {
  baseUrl = `${baseUrl.replace(/\/$/, '')}/api`;
}

const API = axios.create({
  baseURL: baseUrl
})

export default API
