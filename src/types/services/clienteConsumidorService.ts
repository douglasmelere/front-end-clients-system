import { api } from './api';
import { ClienteConsumidor } from '../index';

export interface ClienteConsumidorFilters {
  search?: string;
  status?: string;
  consumerType?: string;
  city?: string;
  state?: string;
}

export const clienteConsumidorService = {
  async getAll(filters?: ClienteConsumidorFilters): Promise<ClienteConsumidor[]> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
    }
    
    const endpoint = `/consumers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return api.get(endpoint);
  },

  async getById(id: string): Promise<ClienteConsumidor> {
    return api.get(`/consumers/${id}`);
  },

  async create(cliente: Omit<ClienteConsumidor, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClienteConsumidor> {
    return api.post('/consumers', cliente);
  },

  async update(id: string, cliente: Partial<ClienteConsumidor>): Promise<ClienteConsumidor> {
    return api.patch(`/consumers/${id}`, cliente);
  },

  async delete(id: string): Promise<void> {
    return api.delete(`/consumers/${id}`);
  },

  async getStatistics(): Promise<any> {
    return api.get('/consumers/statistics');
  },

  async getByState(): Promise<Record<string, ClienteConsumidor[]>> {
    return api.get('/consumers/by-state');
  },
  
  // <<< MUDANÇA AQUI: Corrigindo o payload conforme a documentação da API
  // O endpoint é POST /consumers/{id}/allocate, e o corpo deve conter o ID do gerador.
  async allocate(clienteId: string, generatorId: string, percentage: number): Promise<ClienteConsumidor> {
    return api.post(`/consumers/${clienteId}/allocate`, {
      generatorId, // O corpo da requisição deve enviar o ID do gerador
      allocatedPercentage: percentage
    });
  },

  async deallocate(clienteId: string): Promise<ClienteConsumidor> {
    // A documentação indica um POST sem corpo para desalocar
    return api.post(`/consumers/${clienteId}/deallocate`, {});
  }
};