import { useState, useEffect, useCallback } from 'react';
import { RepresentanteComercial } from '../types';
import { representanteComercialService, RepresentanteComercialFilters, RepresentanteComercialCreate, RepresentanteComercialUpdate } from '../types/services/representanteComercialService';
import { useToast } from './useToast';

export function useRepresentantesComerciais() {
  const [representantes, setRepresentantes] = useState<RepresentanteComercial[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<RepresentanteComercialFilters>({});
  const [statistics, setStatistics] = useState<any>(null);
  const { showToast } = useToast();

  // Buscar todos os representantes
  const fetchRepresentantes = useCallback(async (filters?: RepresentanteComercialFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await representanteComercialService.getAll(filters);
      setRepresentantes(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar representantes';
      setError(message);
      showToast('error', message);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Buscar estatísticas
  const fetchStatistics = useCallback(async () => {
    try {
      const data = await representanteComercialService.getStatistics();
      setStatistics(data);
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err);
    }
  }, []);

  // Criar representante
  const createRepresentante = useCallback(async (representante: RepresentanteComercialCreate) => {
    try {
      setLoading(true);
      const newRepresentante = await representanteComercialService.create(representante);
      setRepresentantes(prev => [...prev, newRepresentante]);
      showToast('success', 'Representante criado com sucesso!');
      return newRepresentante;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar representante';
      setError(message);
      showToast('error', message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Atualizar representante
  const updateRepresentante = useCallback(async (id: string, updates: RepresentanteComercialUpdate) => {
    try {
      setLoading(true);
      const updatedRepresentante = await representanteComercialService.update(id, updates);
      setRepresentantes(prev => 
        prev.map(rep => rep.id === id ? updatedRepresentante : rep)
      );
      showToast('success', 'Representante atualizado com sucesso!');
      return updatedRepresentante;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar representante';
      setError(message);
      showToast('error', message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Deletar representante
  const deleteRepresentante = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await representanteComercialService.delete(id);
      setRepresentantes(prev => prev.filter(rep => rep.id !== id));
      showToast('success', 'Representante removido com sucesso!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao remover representante';
      setError(message);
      showToast('error', message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Atualizar status
  const updateStatus = useCallback(async (id: string, status: 'ACTIVE' | 'INACTIVE' | 'PENDING_APPROVAL') => {
    try {
      const updatedRepresentante = await representanteComercialService.updateStatus(id, status);
      setRepresentantes(prev => 
        prev.map(rep => rep.id === id ? updatedRepresentante : rep)
      );
      showToast('success', `Status atualizado para ${status}`);
      return updatedRepresentante;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar status';
      setError(message);
      showToast('error', message);
      throw err;
    }
  }, [showToast]);

  // Aplicar filtros
  const applyFilters = useCallback((newFilters: RepresentanteComercialFilters) => {
    setFilters(newFilters);
    fetchRepresentantes(newFilters);
  }, [fetchRepresentantes]);

  // Limpar filtros
  const clearFilters = useCallback(() => {
    setFilters({});
    fetchRepresentantes();
  }, [fetchRepresentantes]);

  // Buscar representante por ID
  const getRepresentanteById = useCallback(async (id: string) => {
    try {
      return await representanteComercialService.getById(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar representante';
      setError(message);
      showToast('error', message);
      throw err;
    }
  }, [showToast]);

  // Buscar representantes ativos
  const getActiveRepresentantes = useCallback(async () => {
    try {
      return await representanteComercialService.getActiveRepresentantes();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar representantes ativos';
      setError(message);
      showToast('error', message);
      throw err;
    }
  }, [showToast]);

  // Carregar dados iniciais
  useEffect(() => {
    fetchRepresentantes();
    fetchStatistics();
  }, [fetchRepresentantes, fetchStatistics]);

  return {
    representantes,
    loading,
    error,
    filters,
    statistics,
    fetchRepresentantes,
    createRepresentante,
    updateRepresentante,
    deleteRepresentante,
    updateStatus,
    applyFilters,
    clearFilters,
    getRepresentanteById,
    getActiveRepresentantes,
    setError
  };
}
