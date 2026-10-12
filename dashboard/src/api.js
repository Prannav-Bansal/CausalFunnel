import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_BASE });

export const fetchSessions = (limit = 50, skip = 0) =>
  api.get(`/sessions?limit=${limit}&skip=${skip}`).then(res => res.data);

export const fetchSessionEvents = (sessionId) =>
  api.get(`/sessions/${sessionId}/events`).then(res => res.data);

export const fetchPages = () =>
  api.get('/pages').then(res => res.data);

export const fetchHeatmapData = (pageUrl) =>
  api.get(`/heatmap?page_url=${encodeURIComponent(pageUrl)}`).then(res => res.data);
