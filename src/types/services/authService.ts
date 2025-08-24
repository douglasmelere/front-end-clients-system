import { api } from './api';
import { User } from '../index';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  access_token: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await api.post('/auth/login', credentials);
      
      // Salvar token no localStorage
      if (response.access_token) {
        localStorage.setItem('accessToken', response.access_token);
      }
      
      return response;
    } catch (error) {
      // Remover qualquer token inválido
      this.clearToken();
      throw error;
    }
  },

/*  async logout(): Promise<void> {
    try {
      // Tentar fazer logout na API (se o endpoint existir)
      await api.post('/auth/logout', {});
    } catch (error) {
      console.error('Erro ao fazer logout na API:', error);
    } finally {
      this.clearToken();
    }
  },
*/

  async logout(): Promise<void> {
  // Como não há endpoint de logout, apenas limpar o token
  this.clearToken();
},

  async validateToken(): Promise<User> {
    try {
      const response = await api.get('/auth/profile');
      return response;
    } catch (error) {
      this.clearToken();
      throw error;
    }
  },

  getStoredToken(): string | null {
    return localStorage.getItem('accessToken');
  },

  clearToken(): void {
    localStorage.removeItem('accessToken');
  }
};