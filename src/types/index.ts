// Enums
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  OPERATOR = 'OPERATOR',
  REPRESENTATIVE = 'REPRESENTATIVE'
}

export enum RepresentativeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  SUSPENDED = 'SUSPENDED'
}

export enum ConsumerStatus {
  AVAILABLE = 'AVAILABLE',
  ALLOCATED = 'ALLOCATED',
  IN_PROCESS = 'IN_PROCESS',
  CONVERTED = 'CONVERTED'
}

export enum ConsumerType {
  RESIDENTIAL = 'RESIDENTIAL',
  COMMERCIAL = 'COMMERCIAL',
  INDUSTRIAL = 'INDUSTRIAL',
  RURAL = 'RURAL',
  PUBLIC_POWER = 'PUBLIC_POWER'
}

export enum PhaseType {
  MONOPHASIC = 'MONOPHASIC',
  BIPHASIC = 'BIPHASIC',
  TRIPHASIC = 'TRIPHASIC'
}

export enum SourceType {
  SOLAR = 'SOLAR',
  HYDRO = 'HYDRO',
  BIOMASS = 'BIOMASS',
  WIND = 'WIND'
}

export enum GeneratorStatus {
  UNDER_ANALYSIS = 'UNDER_ANALYSIS',
  AWAITING_ALLOCATION = 'AWAITING_ALLOCATION',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

// Interfaces de Autenticação
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    isActive: boolean;
  };
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'MANAGER' | 'OPERATOR';
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: string;
  loginCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interfaces de Representantes
export interface CreateRepresentativeRequest {
  name: string;
  email: string;
  password: string;
  cpfCnpj: string;
  phone: string;
  city: string;
  state: string;
  commissionRate?: number;
  specializations?: string[];
  notes?: string;
}

export interface Representative {
  id: string;
  name: string;
  email: string;
  cpfCnpj: string;
  phone: string;
  city: string;
  state: string;
  commissionRate: number;
  specializations: string[];
  status: RepresentativeStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  loginCount: number;
  _count: {
    Consumer: number;
  };
}

// Interfaces de Consumidores
export interface CreateConsumerRequest {
  name: string;
  cpfCnpj: string;
  ucNumber: string;
  concessionaire: string;
  city: string;
  state: string;
  consumerType: ConsumerType;
  phase: PhaseType;
  averageMonthlyConsumption: number;
  discountOffered: number;
  status?: ConsumerStatus;
  allocatedPercentage?: number;
  generatorId?: string;
  representativeId?: string;
}

export interface Consumer {
  id: string;
  name: string;
  cpfCnpj: string;
  ucNumber: string;
  concessionaire: string;
  city: string;
  state: string;
  consumerType: ConsumerType;
  phase: PhaseType;
  averageMonthlyConsumption: number;
  discountOffered: number;
  status: ConsumerStatus;
  allocatedPercentage: number | null;
  generatorId: string | null;
  representativeId: string | null;
  createdAt: string;
  updatedAt: string;
  generator?: Generator;
  Representative?: Representative;
}

// Interfaces de Geradores
export interface CreateGeneratorRequest {
  ownerName: string;
  cpfCnpj: string;
  sourceType: SourceType;
  installedPower: number;
  concessionaire: string;
  ucNumber: string;
  city: string;
  state: string;
  status?: GeneratorStatus;
  observations?: string;
}

export interface Generator {
  id: string;
  ownerName: string;
  cpfCnpj: string;
  sourceType: SourceType;
  installedPower: number;
  concessionaire: string;
  ucNumber: string;
  city: string;
  state: string;
  status: GeneratorStatus;
  observations: string | null;
  createdAt: string;
  updatedAt: string;
  consumers: Consumer[];
}

// Interfaces de Dashboard
export interface AdminDashboard {
  totalGenerators: number;
  totalConsumers: number;
  totalInstalledPower: number;
  totalMonthlyConsumption: number;
  allocationRate: number;
  generatorsBySource: Array<{
    sourceType: SourceType;
    count: number;
    totalPower: number;
  }>;
  consumersByType: Array<{
    consumerType: ConsumerType;
    count: number;
    totalConsumption: number;
  }>;
}

export interface RepresentativeDashboard {
  stats: {
    totalConsumers: number;
    totalKwh: number;
    allocatedKwh: number;
    pendingKwh: number;
    allocationRate: number;
    estimatedMonthlySavings: number;
  };
  consumersByStatus: {
    allocated: {
      count: number;
      totalKwh: number;
      consumers: Consumer[];
    };
    inProcess: {
      count: number;
      totalKwh: number;
      consumers: Consumer[];
    };
    converted: {
      count: number;
      totalKwh: number;
      consumers: Consumer[];
    };
    available: {
      count: number;
      totalKwh: number;
      consumers: Consumer[];
    };
  };
  geographicDistribution: Array<{
    state: string;
    count: number;
    totalKwh: number;
  }>;
  monthlyEvolution: Array<{
    month: string;
    newConsumers: number;
    totalKwh: number;
  }>;
  recentActivity: Consumer[];
}

// Interfaces de Auditoria
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  oldValues: any | null;
  newValues: any | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: any | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Estado da Aplicação
export interface AppState {
  currentView: 'dashboard' | 'geradores' | 'consumidores' | 'representantes' | 'usuarios' | 'logs';
  isLoading: boolean;
  error: string | null;
}

export interface AppAction {
  type: 'SET_VIEW' | 'SET_LOADING' | 'SET_ERROR' | 'CLEAR_ERROR';
  payload?: any;
}