import { useState, useCallback } from 'react';
import { useApi, useApiMutation } from './useApi';
import { clienteConsumidorService, ClienteConsumidorFilters } from '../types/services/clienteConsumidorService';
import { ClienteConsumidor } from '../types';

export function useClientesConsumidores(filters?: ClienteConsumidorFilters) {
  const [currentFilters, setCurrentFilters] = useState<ClienteConsumidorFilters>(filters || {});
  
  const {
    data: clientes,
    loading: listLoading,
    error: listError,
    refetch
  } = useApi(
    () => clienteConsumidorService.getAll(currentFilters),
    [currentFilters]
  );

  const createMutation = useApiMutation<ClienteConsumidor>();
  const updateMutation = useApiMutation<ClienteConsumidor>();
  const deleteMutation = useApiMutation<void>();
  const allocateMutation = useApiMutation<ClienteConsumidor>();
  const deallocateMutation = useApiMutation<ClienteConsumidor>();

  const updateFilters = useCallback((newFilters: ClienteConsumidorFilters) => {
    setCurrentFilters(newFilters);
  }, []);

  const createCliente = useCallback(async (cliente: Omit<ClienteConsumidor, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const result = await createMutation.mutate(() => 
        clienteConsumidorService.create(cliente)
      );
      await refetch();
      return result; // Retorna o cliente criado
    } catch (error) {
      console.error('Erro ao criar cliente consumidor:', error);
      throw error;
    }
  }, [createMutation, refetch]);

  const updateCliente = useCallback(async (cliente: Partial<ClienteConsumidor> & { id: string }) => {
    try {
      const { id, ...data } = cliente;
      const result = await updateMutation.mutate(() => 
        clienteConsumidorService.update(id, data)
      );
      await refetch();
      return result;
    } catch (error) {
      console.error('Erro ao atualizar cliente consumidor:', error);
      throw error;
    }
  }, [updateMutation, refetch]);

  const deleteCliente = useCallback(async (id: string) => {
    try {
      await deleteMutation.mutate(() => 
        clienteConsumidorService.delete(id)
      );
      await refetch();
    } catch (error) {
      console.error('Erro ao deletar cliente consumidor:', error);
      throw error;
    }
  }, [deleteMutation, refetch]);

  const allocateToGenerator = useCallback(async (clienteId: string, generatorId: string, percentage: number) => {
    try {
      const result = await allocateMutation.mutate(() => 
        clienteConsumidorService.allocate(clienteId, generatorId, percentage)
      );
      await refetch();
      return result;
    } catch (error) {
      console.error('Erro ao alocar cliente:', error);
      throw error;
    }
  }, [allocateMutation, refetch]);

  const deallocateFromGenerator = useCallback(async (clienteId: string) => {
    try {
      const result = await deallocateMutation.mutate(() => 
        clienteConsumidorService.deallocate(clienteId)
      );
      await refetch();
      return result;
    } catch (error) {
      console.error('Erro ao desalocar cliente:', error);
      throw error;
    }
  }, [deallocateMutation, refetch]);

  return {
    clientes: clientes || [],
    loading: listLoading || createMutation.loading || updateMutation.loading || deleteMutation.loading || allocateMutation.loading || deallocateMutation.loading,
    error: listError || createMutation.error || updateMutation.error || deleteMutation.error || allocateMutation.error || deallocateMutation.error,
    refetch,
    updateFilters,
    currentFilters,
    createCliente,
    updateCliente,
    deleteCliente,
    allocateToGenerator,
    deallocateFromGenerator,
  };
}