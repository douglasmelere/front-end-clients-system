import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import LoadingSpinner from './common/LoadingSpinner';
import ErrorMessage from './common/ErrorMessage';
import { 
  Users, 
  Factory, 
  TrendingUp, 
  Zap,
  Calendar,
  MapPin,
  Activity,
  BarChart3,
  Wind,
  Droplet,
  Leaf,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Loader
} from 'lucide-react';
import PagluzLogo from './common/PagluzLogo';
import { useClientesGeradores } from '../hooks/useClientesGeradores';
import { useClientesConsumidores } from '../hooks/useClientesConsumidores';
import { useRepresentantesComerciais } from '../hooks/useRepresentantesComerciais';

export default function Dashboard() {
  const { dashboardData, loading, error, refetch } = useDashboard();
  const { clientes: geradores, loading: loadingGeradores } = useClientesGeradores();
  const { clientes: clientesConsumidores } = useClientesConsumidores();
  const { representantes, statistics: representantesStats } = useRepresentantesComerciais();

  // Função para formatar números com separadores de milhares
  const formatarNumero = (numero: number) => {
    return numero.toLocaleString('pt-BR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  // Capacidade Não Alocada = Total de KWh de todas as usinas - Total alocado
  const calcularCapacidadeNaoAlocada = () => {
    // 1. Calcular capacidade total de todos os geradores
    const capacidadeTotal = geradores.reduce((total, gerador) => {
      return total + (gerador.installedPower || 0);
    }, 0);
    
    // 2. Calcular total alocado
    let totalAlocado = 0;
    clientesConsumidores.forEach(cliente => {
      if (cliente.status === 'ALLOCATED' && cliente.generatorId) {
        const gerador = geradores.find(g => g.id === cliente.generatorId);
        if (gerador) {
          // Total alocado = % alocada * potência instalada do gerador
          const alocacaoCliente = ((cliente.allocatedPercentage || 0) / 100) * (gerador.installedPower || 0);
          totalAlocado += alocacaoCliente;
        }
      }
    });
    
    // 3. Capacidade não alocada = Total - Alocado
    return capacidadeTotal - totalAlocado;
  };

  // Consumo Total dos Consumidores = Soma do consumo de todos os clientes consumidores
  const calcularConsumoTotalConsumidores = () => {
    // Soma total do consumo de todos os consumidores
    const consumoTotalConsumidores = clientesConsumidores.reduce((total, cliente) => {
      return total + (cliente.averageMonthlyConsumption || 0);
    }, 0);

    return consumoTotalConsumidores;
  };

  // Consumidores Não Alocados = Quantidade e total de KW/h de consumidores sem gerador
  const calcularConsumidoresNaoAlocados = () => {
    const consumidoresNaoAlocados = clientesConsumidores.filter(
      cliente => cliente.status !== 'ALLOCATED'
    );
    
    const quantidade = consumidoresNaoAlocados.length;
    
    const totalKwhNaoAlocado = consumidoresNaoAlocados.reduce((total, cliente) => {
      return total + (cliente.averageMonthlyConsumption || 0);
    }, 0);
    
    return {
      quantidade,
      totalKwh: totalKwhNaoAlocado
    };
  };

  const calcularMediaDesconto = () => {
    if (!clientesConsumidores || clientesConsumidores.length === 0) return 0;
    const totalDesconto = clientesConsumidores.reduce((total, cliente) => total + (cliente.discountOffered || 0), 0);
    return totalDesconto / clientesConsumidores.length;
  };

  const mediaDesconto = calcularMediaDesconto();
  const capacidadeNaoAlocada = calcularCapacidadeNaoAlocada();
  const consumoTotalConsumidores = calcularConsumoTotalConsumidores();
  const dadosConsumidoresNaoAlocados = calcularConsumidoresNaoAlocados();

  const totalCapacity = geradores.reduce((total, gerador) => total + (gerador.installedPower || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-green-600 mx-auto mb-6" />
          <p className="text-slate-600 text-lg">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorMessage message={error} onRetry={refetch} />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-6">
        <ErrorMessage message="Dados do dashboard não encontrados" onRetry={refetch} />
      </div>
    );
  }

  const stats = [
    {
      title: 'Clientes Geradores',
      value: dashboardData.summary.totalGenerators,
      icon: Factory,
      color: 'blue',
      change: '+12%',
      description: 'Total de geradores cadastrados',
      trend: 'up'
    },
    {
      title: 'Clientes Consumidores', 
      value: dashboardData.summary.totalConsumers,
      icon: Users,
      color: 'green',
      change: '+8%',
      description: 'Total de consumidores cadastrados',
      trend: 'up'
    },
    {
      title: 'Potência Instalada',
      value: `${formatarNumero(dashboardData.summary.totalInstalledPower ?? 0)} kW`,
      icon: Zap,
      color: 'yellow',
      change: '+15%',
      description: 'Capacidade total de geração',
      trend: 'up'
    },
    {
      title: 'Novos esta Semana',
      value: dashboardData.summary.newClientsThisWeek,
      icon: TrendingUp,
      color: 'purple',
      change: '+25%',
      description: 'Clientes cadastrados recentemente',
      trend: 'up',
      // Adiciona detalhes dos novos clientes
      details: {
        generators: dashboardData.summary.newGeneratorsThisWeek,
        consumers: dashboardData.summary.newConsumersThisWeek
      }
    }
  ];

  // Função para obter ícone baseado no tipo
  const getActivityIcon = (type: string, subtype: string) => {
    if (type === 'generator') {
      switch (subtype) {
        case 'SOLAR': return <PagluzLogo className="h-4 w-4 text-yellow-500" width={16} height={16} />;
        case 'WIND': return <Wind className="h-4 w-4 text-blue-500" />;
        case 'HYDRO': return <Droplet className="h-4 w-4 text-cyan-500" />;
        case 'BIOMASS': return <Leaf className="h-4 w-4 text-green-500" />;
        default: return <Factory className="h-4 w-4 text-gray-500" />;
      }
    }
    return <Users className="h-4 w-4 text-green-500" />;
  };

  // Função para formatar tempo relativo
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes} minutos atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} horas atrás`;
    return `${Math.floor(diffInMinutes / 1440)} dias atrás`;
  };

  // Função para obter descrição da atividade
  const getActivityDescription = (activity: any) => {
    if (activity.type === 'generator') {
      return `Novo gerador ${activity.subtype.toLowerCase()} cadastrado`;
    }
    return `Novo consumidor ${activity.subtype.toLowerCase()} cadastrado`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header com gradiente da Pagluz */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-green-600 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <div className="flex items-center space-x-3 mb-2">
                <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg">
                  <BarChart3 className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Dashboard</h1>
                  <p className="text-slate-200 text-lg mt-1">Visão geral do sistema de energia solar</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-slate-200 bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-sm border border-white/20">
              <Calendar className="h-5 w-5" />
              <span className="font-medium">{new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const colorClasses = {
              blue: 'from-blue-500 to-indigo-500',
              green: 'from-green-500 to-emerald-500', 
              yellow: 'from-yellow-500 to-orange-500',
              purple: 'from-purple-500 to-pink-500'
            };

            return (
              <div key={stat.title} className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-4 rounded-2xl bg-gradient-to-r ${colorClasses[stat.color as keyof typeof colorClasses]} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</h3>
                  <p className="text-lg font-semibold text-slate-700 mb-2">{stat.title}</p>
                  
                  {/* Mostra detalhes para o card "Novos esta Semana" */}
                  {stat.details ? (
                    <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 flex items-center">
                          <Factory className="h-4 w-4 mr-2" />
                          Geradores:
                        </span>
                        <span className="font-bold text-slate-900">{stat.details.generators}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          Consumidores:
                        </span>
                        <span className="font-bold text-slate-900">{stat.details.consumers}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">{stat.description}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Estatísticas de Representantes */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg mr-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Representantes Comerciais</h2>
              <p className="text-slate-600">Visão geral da equipe comercial</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {representantes?.length || 0}
              </div>
              <div className="text-sm font-medium text-blue-700">Total</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {representantes?.filter(rep => rep.status === 'ACTIVE').length || 0}
              </div>
              <div className="text-sm font-medium text-green-700">Ativos</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {representantes?.filter(rep => rep.status === 'PENDING_APPROVAL').length || 0}
              </div>
              <div className="text-sm font-medium text-yellow-700">Pendentes</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {representantesStats?.averageCommissionRate?.toFixed(1) || 0}%
              </div>
              <div className="text-sm font-medium text-purple-700">Taxa Média</div>
            </div>
          </div>
          
          {/* Representantes por Estado */}
          {representantes && representantes.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Distribuição por Estado</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from(new Set(representantes.map(rep => rep.state))).slice(0, 8).map(state => {
                  const count = representantes.filter(rep => rep.state === state).length;
                  return (
                    <div key={state} className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="text-lg font-bold text-slate-700">{count}</div>
                      <div className="text-xs text-slate-500">{state}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Distribuição por Estado */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                <MapPin className="h-6 w-6 mr-3 text-green-600" />
                Distribuição por Estado
              </h2>
            </div>
            <div className="space-y-4">
              {dashboardData.stateDistribution.map((state) => {
                const total = state.generators + state.consumers;
                const totalAll = dashboardData.stateDistribution.reduce((sum, s) => sum + s.generators + s.consumers, 0);
                const percentage = totalAll > 0 ? ((total / totalAll) * 100).toFixed(0) : 0;
                
                return (
                  <div key={state.state} className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-slate-900">{state.state}</span>
                      <span className="text-lg font-bold text-slate-900">{percentage}%</span>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-slate-600 mb-3">
                      <span className="flex items-center">
                        <Factory className="h-4 w-4 mr-2 text-blue-600" />
                        {state.generators} geradores
                      </span>
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-green-600" />
                        {state.consumers} consumidores
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              {dashboardData.stateDistribution.length === 0 && (
                <p className="text-slate-500 text-center py-8 text-lg">
                  Nenhum dado de distribuição disponível
                </p>
              )}
            </div>
          </div>

          {/* Atividade Recente */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                <Activity className="h-6 w-6 mr-3 text-green-600" />
                Atividade Recente
              </h2>
            </div>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {dashboardData.recentActivity.length > 0 ? (
                dashboardData.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-200">
                    <div className="mt-1 p-2 bg-white rounded-lg shadow-sm">
                      {getActivityIcon(activity.type, activity.subtype)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 font-semibold">
                        {getActivityDescription(activity)}
                      </p>
                      <p className="text-sm text-slate-700 font-medium">{activity.name}</p>
                      <p className="text-xs text-slate-500 mt-1 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {getRelativeTime(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-center py-8 text-lg">
                  Nenhuma atividade recente
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Insights Rápidos */}
        <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-green-600 rounded-2xl p-8 shadow-2xl border border-slate-200 text-white">
          <div className="flex items-center mb-8">
            <Target className="h-8 w-8 text-white mr-4" />
            <h2 className="text-3xl font-bold">Insights do Sistema</h2>
          </div>
          
          {/* Métricas principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-slate-200 mb-3">Média da Porcentagem de Desconto</h3>
              <div className="flex items-center space-x-3">
                <TrendingDown className="h-8 w-8 text-green-400" />
                <p className="text-4xl font-bold text-white">
                  {formatarNumero(mediaDesconto)}%
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-slate-200 mb-3">Eficiência de Alocação</h3>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-8 w-8 text-green-400" />
                <p className="text-4xl font-bold text-white">
                  {totalCapacity > 0 ? ((totalCapacity - capacidadeNaoAlocada) / totalCapacity * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          </div>

          {/* Utilização da Capacidade */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Capacidade Total de Geradores</h4>
              <p className="text-2xl font-bold text-white">
                {formatarNumero(totalCapacity)} kW
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Capacidade Não Alocada</h4>
              <p className="text-2xl font-bold text-white">
                {formatarNumero(capacidadeNaoAlocada)} kW
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Consumo Total</h4>
              <p className="text-2xl font-bold text-white">
                {formatarNumero(consumoTotalConsumidores)} kW/h
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Demanda Não Alocada</h4>
              <p className="text-2xl font-bold text-white">
                {formatarNumero(dadosConsumidoresNaoAlocados.totalKwh)} kW/h
              </p>
              <p className="text-xs text-slate-300 mt-1">
                {dadosConsumidoresNaoAlocados.quantidade} consumidores
              </p>
            </div>
          </div>

          {/* Status dos Geradores */}
          {dashboardData.insights?.generatorStatus && (
            <div className="mt-8 flex items-center justify-center space-x-8 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-400 rounded-full shadow-lg"></div>
                <span className="text-slate-200 font-medium">
                  {dashboardData.insights.generatorStatus.underAnalysis} em análise
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-400 rounded-full shadow-lg"></div>
                <span className="text-slate-200 font-medium">
                  {dashboardData.insights.generatorStatus.awaitingAllocation} aguardando alocação
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-400 rounded-full shadow-lg"></div>
                <span className="text-slate-200 font-medium">
                  {stats.find(s => s.title === 'Clientes Geradores')?.value || 0 - dashboardData.insights.generatorStatus.underAnalysis - dashboardData.insights.generatorStatus.awaitingAllocation} totalmente alocados
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

