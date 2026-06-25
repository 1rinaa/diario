// frontend/src/services/api.js
import axios from 'axios';

// Usar variable de entorno o valor por defecto
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos máximo de espera
});

// Interceptor para agregar el token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirigir al login si es necesario
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ========== MÉTODOS DE AUTENTICACIÓN ==========

export const authService = {
  // Registrar nuevo usuario (solo primera vez)
  register: async (username, password) => {
    const response = await api.post('/setup', { username, password });
    return response.data;
  },

  // Iniciar sesión
  login: async (username, password) => {
    const response = await api.post('/login', { username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Cerrar sesión
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

// ========== MÉTODOS DEL DIARIO EMOCIONAL ==========

export const emotionalService = {
  // Guardar una entrada emocional
  create: async (data) => {
    const response = await api.post('/emotional', data);
    return response.data;
  },

  // Obtener todas las entradas emocionales
  getAll: async () => {
    const response = await api.get('/emotional');
    return response.data;
  },

  // Obtener una entrada por fecha específica
  getByDate: async (date) => {
    const entries = await emotionalService.getAll();
    return entries.find(entry => entry.date === date);
  },

  // Obtener las últimas N entradas
  getLatest: async (limit = 7) => {
    const entries = await emotionalService.getAll();
    return entries.slice(0, limit);
  },
};

// ========== MÉTODOS DEL DIARIO DEL DÍA ==========

export const dailyService = {
  // Guardar una entrada del día
  create: async (data) => {
    const response = await api.post('/daily', data);
    return response.data;
  },

  // Obtener todas las entradas del día
  getAll: async () => {
    const response = await api.get('/daily');
    return response.data;
  },

  // Obtener entrada por fecha específica
  getByDate: async (date) => {
    const entries = await dailyService.getAll();
    return entries.find(entry => entry.date === date);
  },
};

// ========== SERVICIO DE PDFs ==========

export const pdfService = {
  // Subir PDF
  upload: async (file) => {
    const formData = new FormData();
    formData.append('pdf', file);
    
    const response = await api.post('/pdfs/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Obtener todos los PDFs
  getAll: async () => {
    const response = await api.get('/pdfs');
    return response.data;
  },

  // Obtener URL de un PDF (ruta pública para visualización)
  getUrl: (pdfId) => {
    return `http://localhost:3001/api/pdfs/view/${pdfId}`; // Usa la ruta pública
  },

  // Eliminar PDF
  delete: async (pdfId) => {
    const response = await api.delete(`/pdfs/${pdfId}`);
    return response.data;
  },

  // Obtener anotaciones de un PDF
  getAnnotations: async (pdfId) => {
    const response = await api.get(`/pdfs/${pdfId}/annotations`);
    return response.data;
  },

  // Guardar anotación
  saveAnnotation: async (pdfId, annotation) => {
    const response = await api.post(`/pdfs/${pdfId}/annotations`, annotation);
    return response.data;
  },
};

// Exportar el api para uso directo si es necesario
export default api;
