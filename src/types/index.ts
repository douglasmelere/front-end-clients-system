// Interface do usuário
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
  createdAt: string;
  updatedAt: string;
}

// Interfaces existentes dos clientes
export interface ClienteGerador {
  id: string;
  ownerName: string;
  cpfCnpj: string;
  sourceType: 'SOLAR' | 'HYDRO' | 'WIND' | 'BIOMASS';
  installedPower: number; // KW/h
  concessionaire: string;
  ucNumber: string;
  city: string;
  state: string;
  status: 'UNDER_ANALYSIS' | 'AWAITING_ALLOCATION';
  observations?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RepresentanteComercial {
  id: string;
  name: string;
  email: string;
  cpfCnpj: string;
  phone: string;
  city: string;
  state: string;
  commissionRate: number; // Taxa de comissão em %
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_APPROVAL';
  specializations: string[]; // Especializações (ex: "SOLAR", "HYDRO", "RESIDENTIAL")
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClienteConsumidor {
  id: string;
  name: string;
  cpfCnpj: string;
  ucNumber: string;
  concessionaire: string;
  city: string;
  state: string;
  consumerType: 'RESIDENTIAL' | 'COMMERCIAL' | 'RURAL' | 'INDUSTRIAL' | 'PUBLIC_POWER';
  phase: 'SINGLE' | 'TWO' | 'THREE';
  averageMonthlyConsumption: number; // KW/h
  discountOffered: number; // %
  status: 'AVAILABLE' | 'ALLOCATED';
  allocatedPercentage?: number; // %
  generatorId?: string;
  representanteId?: string; // ID do representante comercial
  createdAt: string;
  updatedAt: string;
}

export type Cliente = ClienteGerador | ClienteConsumidor;

export interface AppState {
  currentView: 'dashboard' | 'geradores' | 'consumidores' | 'representantes';
  loading: boolean;
  isAuthenticated: boolean;
}

// Interfaces para o dashboard
export interface DashboardSummary {
  totalGenerators: number;
  totalConsumers: number;
  totalInstalledPower: number;
  newClientsThisWeek: number;
  newGeneratorsThisWeek: number;
  newConsumersThisWeek: number;
}

export interface StateDistribution {
  state: string;
  generators: number;
  consumers: number;
}

export interface RecentActivity {
  id: string;
  type: 'generator' | 'consumer';
  subtype: string;
  name: string;
  createdAt: string;
}

export interface GeneratorStatus {
  underAnalysis: number;
  awaitingAllocation: number;
}

export interface CapacityUtilization {
  // Soma total da capacidade de todos os geradores cadastrados
  totalGeneratorsCapacity: number;
  
  // Capacidade dos geradores que estão em análise (status: 'UNDER_ANALYSIS')
  underAnalysisCapacity: number;
  
  // Soma total do consumo médio mensal de todos os consumidores
  totalConsumption: number;
}

export interface DashboardInsights {
  totalMonthlyConsumption: number;
  
  // Taxa de alocação baseada em KW/h alocados
  kwAllocationRate: number;
  
  // Média dos descontos oferecidos
  averageDiscountOffered: number;
  
  capacityUtilization: CapacityUtilization;
  generatorStatus: GeneratorStatus;
}

export interface DashboardData {
  summary: DashboardSummary;
  stateDistribution: StateDistribution[];
  recentActivity: RecentActivity[];
  insights: DashboardInsights;
}

// Exemplo de como calcular os valores no backend
export interface DashboardCalculations {
  // Para totalGeneratorsCapacity
  calculateTotalGeneratorsCapacity: (generators: ClienteGerador[]) => number;
  
  // Para underAnalysisCapacity
  calculateUnderAnalysisCapacity: (generators: ClienteGerador[]) => number;
  
  // Para totalConsumption
  calculateTotalConsumption: (consumers: ClienteConsumidor[]) => number;
  
  // Para kwAllocationRate
  calculateKWAllocationRate: (generators: ClienteGerador[], consumers: ClienteConsumidor[]) => number;
  
  // Para averageDiscountOffered
  calculateAverageDiscountOffered: (consumers: ClienteConsumidor[]) => number;
}

// Implementação de exemplo das funções de cálculo
export const dashboardCalculations: DashboardCalculations = {
  calculateTotalGeneratorsCapacity: (generators: ClienteGerador[]) => {
    return generators.reduce((total, generator) => total + generator.installedPower, 0);
  },
  
  calculateUnderAnalysisCapacity: (generators: ClienteGerador[]) => {
    return generators
      .filter(generator => generator.status === 'UNDER_ANALYSIS')
      .reduce((total, generator) => total + generator.installedPower, 0);
  },
  
  calculateTotalConsumption: (consumers: ClienteConsumidor[]) => {
    return consumers.reduce((total, consumer) => total + consumer.averageMonthlyConsumption, 0);
  },
  
  calculateKWAllocationRate: (generators: ClienteGerador[], consumers: ClienteConsumidor[]) => {
    const totalGeneratorCapacity = generators.reduce((total, generator) => total + generator.installedPower, 0);
    const totalAllocatedConsumption = consumers
      .filter(consumer => consumer.status === 'ALLOCATED')
      .reduce((total, consumer) => {
        const allocatedAmount = consumer.averageMonthlyConsumption * (consumer.allocatedPercentage || 0) / 100;
        return total + allocatedAmount;
      }, 0);
    
    return totalGeneratorCapacity > 0 ? (totalAllocatedConsumption / totalGeneratorCapacity) * 100 : 0;
  },
  
  calculateAverageDiscountOffered: (consumers: ClienteConsumidor[]) => {
    if (consumers.length === 0) return 0;
    
    const totalDiscount = consumers.reduce((total, consumer) => total + consumer.discountOffered, 0);
    return totalDiscount / consumers.length;
  }
};