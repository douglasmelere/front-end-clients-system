import { useState, useCallback } from 'react';
import { useApi, useApiMutation } from './useApi';
import { clienteGeradorService, ClienteGeradorFilters } from '../types/services/clienteGeradorService';
import { ClienteGerador } from '../types';

export function useClientesGeradores(filters?: ClienteGeradorFilters) {
  const [currentFilters, setCurrentFilters] = useState<ClienteGeradorFilters>(filters || {});
  
  // Query para listar clientes
  const {
    data: clientes,
    loading: listLoading,
    error: listError,
    refetch
  } = useApi(
    () => clienteGeradorService.getAll(currentFilters),
    [currentFilters]
  );

  // Mutations
  const createMutation = useApiMutation<ClienteGerador>();
  const updateMutation = useApiMutation<ClienteGerador>();
  const deleteMutation = useApiMutation<void>();

  const updateFilters = useCallback((newFilters: ClienteGeradorFilters) => {
    setCurrentFilters(newFilters);
  }, []);

  const createCliente = useCallback(async (cliente: Omit<ClienteGerador, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const result = await createMutation.mutate(() => 
        clienteGeradorService.create(cliente)
      );
      // Recarrega a lista após criar
      await refetch();
      return result;
    } catch (error) {
      console.error('Erro ao criar cliente gerador:', error);
      throw error;
    }
  }, [createMutation, refetch]);

  const updateCliente = useCallback(async (cliente: Partial<ClienteGerador> & { id: string }) => {
    try {
      const { id, ...data } = cliente;
      const result = await updateMutation.mutate(() => 
        clienteGeradorService.update(id, data)
      );
      // Recarrega a lista após atualizar
      await refetch();
      return result;
    } catch (error) {
      console.error('Erro ao atualizar cliente gerador:', error);
      throw error;
    }
  }, [updateMutation, refetch]);

  const deleteCliente = useCallback(async (id: string) => {
    try {
      await deleteMutation.mutate(() => 
        clienteGeradorService.delete(id)
      );
      // Recarrega a lista após deletar
      await refetch();
    } catch (error) {
      console.error('Erro ao deletar cliente gerador:', error);
      throw error;
    }
  }, [deleteMutation, refetch]);

  return {
    // Dados
    clientes: clientes || [],
    loading: listLoading || createMutation.loading || updateMutation.loading || deleteMutation.loading,
    error: listError || createMutation.error || updateMutation.error || deleteMutation.error,
    
    // Funções
    refetch,
    updateFilters,
    currentFilters,
    createCliente,
    updateCliente,
    deleteCliente,
    
    // Estados individuais de loading
    createLoading: createMutation.loading,
    updateLoading: updateMutation.loading,
    deleteLoading: deleteMutation.loading
  };
}

// Hook para estatísticas
export function useClienteGeradorStats() {
  return useApi(() => clienteGeradorService.getStatistics());
}