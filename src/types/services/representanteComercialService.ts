import { api } from './api';
import { RepresentanteComercial } from '../index';

export interface RepresentanteComercialFilters {
  search?: string;
  status?: string;
  city?: string;
  state?: string;
  specialization?: string;
}

export interface RepresentanteComercialCreate {
  name: string;
  email: string;
  cpfCnpj: string;
  phone: string;
  city: string;
  state: string;
  commissionRate: number;
  specializations: string[];
  notes?: string;
}

export interface RepresentanteComercialUpdate {
  name?: string;
  email?: string;
  cpfCnpj?: string;
  phone?: string;
  city?: string;
  state?: string;
  commissionRate?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING_APPROVAL';
  specializations?: string[];
  notes?: string;
}

export const representanteComercialService = {
  async getAll(filters?: RepresentanteComercialFilters): Promise<RepresentanteComercial[]> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
    }
    
    const endpoint = `/representatives${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return api.get(endpoint);
  },

  async getById(id: string): Promise<RepresentanteComercial> {
    return api.get(`/representatives/${id}`);
  },

  async create(representante: RepresentanteComercialCreate): Promise<RepresentanteComercial> {
    return api.post('/representatives', representante);
  },

  async update(id: string, representante: RepresentanteComercialUpdate): Promise<RepresentanteComercial> {
    return api.patch(`/representatives/${id}`, representante);
  },

  async delete(id: string): Promise<void> {
    return api.delete(`/representatives/${id}`);
  },

  async getStatistics(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byState: Record<string, number>;
    totalCommissionRate: number;
    averageCommissionRate: number;
  }> {
    return api.get('/representatives/statistics');
  },

  async getByState(): Promise<Record<string, RepresentanteComercial[]>> {
    return api.get('/representatives/by-state');
  },

  async getBySpecialization(): Promise<Record<string, RepresentanteComercial[]>> {
    return api.get('/representatives/by-specialization');
  },

  async getActiveRepresentatives(): Promise<RepresentanteComercial[]> {
    return api.get('/representatives/active');
  },

  async updateStatus(id: string, status: 'ACTIVE' | 'INACTIVE' | 'PENDING_APPROVAL'): Promise<RepresentanteComercial> {
    return api.patch(`/representatives/${id}/status`, { status });
  },

  async getConsumersByRepresentative(id: string): Promise<any[]> {
    return api.get(`/representatives/${id}/consumers`);
  }
};
