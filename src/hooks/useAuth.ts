import { useState, useEffect } from 'react';
import { authService, LoginCredentials } from '../types/services/authService';
import { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    validateStoredToken();
  }, []);

  const validateStoredToken = async () => {
    const token = authService.getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const userData = await authService.validateToken();
      setUser(userData);
    } catch (error) {
      console.error('Token inválido:', error);
      authService.clearToken();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      return response;
    } catch (error: any) {
      let errorMessage = 'Erro ao fazer login';
      
      // Verificar se é erro 401 (credenciais inválidas)
      if (error.message.includes('401') || error.message.toLowerCase().includes('unauthorized')) {
        errorMessage = 'Credenciais incorretas. Verifique seu email e senha.';
      } else if (error.message.includes('400')) {
        errorMessage = 'Dados inválidos. Verifique os campos preenchidos.';
      } else if (error.message.includes('500')) {
        errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setUser(null);
      authService.clearToken();
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user
  };
}