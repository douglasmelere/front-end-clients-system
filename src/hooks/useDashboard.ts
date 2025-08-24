import { useApi } from './useApi';
import { dashboardService, DashboardData } from '../types/services/dashboardService';

export function useDashboard() {
  const {
    data: dashboardData,
    loading,
    error,
    refetch
  } = useApi<DashboardData>(() => dashboardService.getDashboardData());

  return {
    dashboardData,
    loading,
    error,
    refetch
  };
}

export function useGeneratorsBySource() {
  return useApi(() => dashboardService.getGeneratorsBySource());
}

export function useConsumersByType() {
  return useApi(() => dashboardService.getConsumersByType());
}