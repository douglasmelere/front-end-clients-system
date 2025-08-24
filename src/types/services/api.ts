const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://supabase-pagluz-backend-new.ztdny5.easypanel.host';

// Configuração base do fetch
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('accessToken');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // Se for erro 401, remover token inválido
    if (response.status === 401) {
      localStorage.removeItem('accessToken');
    }
    
    const message = Array.isArray(errorData.message) 
      ? errorData.message.join(', ') 
      : errorData.message || `HTTP error! status: ${response.status}`;
    
    throw new Error(message);
  }
  
  return response.json();
};

export const api = {
  get: (endpoint: string) => apiRequest(endpoint),
  post: (endpoint: string, data: any) => apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  put: (endpoint: string, data: any) => apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  patch: (endpoint: string, data: any) => apiRequest(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (endpoint: string) => apiRequest(endpoint, {
    method: 'DELETE',
  }),
};