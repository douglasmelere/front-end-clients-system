import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Users,
  MapPin,
  Activity,
  Edit,
  Trash2,
  TrendingDown,
  Link,
  Zap,
  Building,
  Calendar,
  BarChart3,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  X,
  Loader,
  Factory,
  Wind,
  Droplet,
  Leaf,
  Eye,
  ExternalLink,
  UserCheck
} from 'lucide-react';
import PagluzLogo from './common/PagluzLogo';
import { useApp } from '../context/AppContext';
import { useClientesConsumidores } from '../hooks/useClientesConsumidores';
import { useClientesGeradores } from '../hooks/useClientesGeradores';
import { useRepresentantesComerciais } from '../hooks/useRepresentantesComerciais';

type ClienteConsumidor = {
  id: string;
  name: string;
  cpfCnpj: string;
  ucNumber: string;
  concessionaire: string;
  city: string;
  state: string;
  consumerType: string;
  phase: string;
  averageMonthlyConsumption: number;
  discountOffered: number;
  status: string;
  generatorId?: string | null;
  allocatedPercentage?: number;
  representanteId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type ClienteGerador = {
  id: string;
  ownerName: string;
  cpfCnpj: string;
  sourceType: string;
  installedPower: number;
  concessionaire: string;
  ucNumber: string;
  city: string;
  state: string;
  status: string;
  observations?: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function ClientesConsumidores() {
  const { toast } = useApp();
  const {
    clientes: clientesConsumidores,
    loading,
    error,
    createCliente,
    updateCliente,
    deleteCliente,
    allocateToGenerator,
    deallocateFromGenerator
  } = useClientesConsumidores();
  
  const { clientes: geradores, loading: loadingGeradores } = useClientesGeradores();
  const { representantes } = useRepresentantesComerciais();

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<ClienteConsumidor | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterTipo, setFilterTipo] = useState<string>('todos');
  const [filterGerador, setFilterGerador] = useState<string>('todos'); // Novo filtro por gerador
  const [showGeneratorDetails, setShowGeneratorDetails] = useState<string | null>(null);

  const filteredClientes = (clientesConsumidores || []).filter(cliente => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    // Verifica se o termo de busca corresponde ao nome, CPF/CNPJ ou cidade do consumidor
    let matchesSearch = cliente.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                        cliente.cpfCnpj.includes(lowerCaseSearchTerm) ||
                        cliente.city.toLowerCase().includes(lowerCaseSearchTerm);

    // Se o consumidor estiver alocado a um gerador, verifica se o termo de busca corresponde ao nome do gerador
    if (cliente.generatorId) {
      const geradorAtrelado = geradores.find(g => g.id === cliente.generatorId);
      if (geradorAtrelado && geradorAtrelado.ownerName.toLowerCase().includes(lowerCaseSearchTerm)) {
        matchesSearch = true;
      }
    }
    
    const matchesStatusFilter = filterStatus === 'todos' || cliente.status === filterStatus;
    const matchesTipoFilter = filterTipo === 'todos' || cliente.consumerType === filterTipo;
    const matchesGeradorFilter = filterGerador === 'todos' || cliente.generatorId === filterGerador;
    
    return matchesSearch && matchesStatusFilter && matchesTipoFilter && matchesGeradorFilter;
  });

  // Stats para dashboard
  const stats = {
    total: clientesConsumidores?.length || 0,
    alocados: clientesConsumidores?.filter(c => c.status === 'ALLOCATED').length || 0,
    disponiveis: clientesConsumidores?.filter(c => c.status === 'AVAILABLE').length || 0,
    consumoTotal: clientesConsumidores?.reduce((acc, c) => acc + c.averageMonthlyConsumption, 0) || 0
  };

  const handleEdit = (cliente: ClienteConsumidor) => {
    setEditingClient(cliente);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente consumidor?')) {
      try {
        await deleteCliente(id);
        toast.showSuccess('Cliente consumidor excluído com sucesso!');
      } catch (error) {
        toast.showError('Erro ao excluir cliente consumidor.');
      }
    }
  };

  const handleAddNew = () => {
    setEditingClient(null);
    setShowModal(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'AVAILABLE': { 
        label: 'Disponível', 
        color: 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200',
        icon: <CheckCircle className="h-3 w-3" />
      },
      'ALLOCATED': { 
        label: 'Alocado', 
        color: 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200',
        icon: <Link className="h-3 w-3" />
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${config?.color || 'bg-gray-100 text-gray-800'}`}>
        {config?.icon}
        <span>{config?.label || status}</span>
      </span>
    );
  };

  const getTipoIcon = (tipo: string) => {
    const icons = {
      'RESIDENTIAL': { icon: '🏠', color: 'bg-green-100 text-green-600' },
      'COMMERCIAL': { icon: '🏢', color: 'bg-blue-100 text-blue-600' }, 
      'RURAL': { icon: '🌾', color: 'bg-yellow-100 text-yellow-600' },
      'INDUSTRIAL': { icon: '🏭', color: 'bg-purple-100 text-purple-600' },
      'PUBLIC_POWER': { icon: '🏛️', color: 'bg-indigo-100 text-indigo-600' }
    };
    const config = icons[tipo as keyof typeof icons] || { icon: '🏢', color: 'bg-gray-100 text-gray-600' };
    return { icon: config.icon, color: config.color };
  };

  const getGeneratorName = (generatorId: string, geradoresList: ClienteGerador[]) => {
    if (!generatorId || !geradoresList) return 'N/A';
    const gerador = geradoresList.find(g => g.id === generatorId);
    return gerador ? gerador.ownerName : 'ID não encontrado';
  };

  const renderGeneratorIcon = (sourceType: string, className: string) => {
    switch (sourceType) {
      case 'SOLAR':
        return <PagluzLogo className={className} width={16} height={16} />;
      case 'WIND':
        return <Wind className={className} />;
      case 'HYDRO':
        return <Droplet className={className} />;
      case 'BIOMASS':
        return <Leaf className={className} />;
      default:
        return <Factory className={className} />;
    }
  };

  const getGeneratorDetails = (generatorId: string) => {
    return geradores.find(g => g.id === generatorId);
  };

  // Estatísticas por gerador
  const getGeneratorStats = () => {
    const stats = geradores.map(gerador => {
      const consumidoresAlocados = clientesConsumidores.filter(c => c.generatorId === gerador.id);
      const totalAlocado = consumidoresAlocados.reduce((acc, c) => acc + (c.allocatedPercentage || 0), 0);
      const consumoTotal = consumidoresAlocados.reduce((acc, c) => acc + c.averageMonthlyConsumption, 0);
      
      return {
        ...gerador,
        consumidoresCount: consumidoresAlocados.length,
        percentualAlocado: totalAlocado,
        consumoTotal,
        capacidadeDisponivel: 100 - totalAlocado
      };
    });
    
    return stats.sort((a, b) => b.consumidoresCount - a.consumidoresCount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-slate-600">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header com gradiente da Pagluz */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-green-600 shadow-2xl">
        <div className="max-w-full mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <div className="flex items-center space-x-3 mb-2">
                <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Clientes Consumidores</h1>
                  <p className="text-slate-200 text-lg mt-1">Gestão inteligente de consumidores de energia solar</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleAddNew}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-2xl flex items-center space-x-3 transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl border border-white/20"
            >
              <Plus className="h-6 w-6" />
              <span className="font-semibold text-lg">Novo Consumidor</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-4 py-8 space-y-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-2">Total de Clientes</p>
                <p className="text-4xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <div className="h-16 w-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-2">Clientes Alocados</p>
                <p className="text-4xl font-bold text-blue-600">{stats.alocados}</p>
              </div>
              <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Link className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-2">Disponíveis</p>
                <p className="text-4xl font-bold text-emerald-600">{stats.disponiveis}</p>
              </div>
              <div className="h-16 w-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-2">Consumo Total</p>
                <p className="text-4xl font-bold text-orange-600">{stats.consumoTotal.toLocaleString()}</p>
                <p className="text-xs text-slate-500">kW/h por mês</p>
              </div>
              <div className="h-16 w-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas por Gerador */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
            <Factory className="h-6 w-6 mr-3 text-green-600" />
            Estatísticas por Gerador
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {getGeneratorStats().map((gerador) => {
                                          const iconColor = 'text-yellow-500';
              
              return (
                <div key={gerador.id} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                                              {renderGeneratorIcon(gerador.sourceType, `h-5 w-5 ${iconColor}`)}
                      <h4 className="font-semibold text-slate-900 truncate">{gerador.ownerName}</h4>
                    </div>
                    <button
                      onClick={() => setFilterGerador(gerador.id)}
                      className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      Filtrar
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Consumidores:</span>
                      <span className="font-semibold text-slate-900">{gerador.consumidoresCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Capacidade:</span>
                      <span className="font-semibold text-slate-900">{gerador.installedPower} kW</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Alocado:</span>
                      <span className="font-semibold text-blue-600">{gerador.percentualAlocado.toFixed(1)}%</span>
                    </div>
                    
                    {/* Barra de progresso */}
                    <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(gerador.percentualAlocado, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filtros e Busca aprimorados */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nome, CPF/CNPJ, cidade ou nome do gerador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white text-lg"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-slate-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-slate-200 rounded-xl px-4 py-4 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-slate-50 min-w-[140px]"
                >
                  <option value="todos">Todos os Status</option>
                  <option value="AVAILABLE">Disponível</option>
                  <option value="ALLOCATED">Alocado</option>
                </select>
              </div>
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className="border border-slate-200 rounded-xl px-4 py-4 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-slate-50 min-w-[140px]"
              >
                <option value="todos">Todos os Tipos</option>
                <option value="RESIDENTIAL">Residencial</option>
                <option value="COMMERCIAL">Comercial</option>
                <option value="RURAL">Rural</option>
                <option value="INDUSTRIAL">Industrial</option>
                <option value="PUBLIC_POWER">Poder Público</option>
              </select>
              
              {/* Novo filtro por gerador */}
              <select
                value={filterGerador}
                onChange={(e) => setFilterGerador(e.target.value)}
                className="border border-slate-200 rounded-xl px-4 py-4 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-slate-50 min-w-[160px]"
              >
                <option value="todos">Todos os Geradores</option>
                {geradores.map(gerador => (
                  <option key={gerador.id} value={gerador.id}>
                    {gerador.ownerName}
                  </option>
                ))}
              </select>
              
              {filterGerador !== 'todos' && (
                <button
                  onClick={() => setFilterGerador('todos')}
                  className="px-3 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Limpar filtro de gerador"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabela redesenhada com layout mais amplo */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-100 to-slate-200 border-b border-slate-300">
                  <th className="px-4 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Cliente</th>
                  <th className="px-4 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Tipo/Consumo</th>
                  <th className="px-4 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Localização</th>
                  <th className="px-4 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Representante</th>
                  <th className="px-4 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Gerador Vinculado</th>
                  <th className="px-4 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Desconto/Alocação</th>
                  <th className="px-4 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredClientes.map((cliente, index) => {
                  const tipoConfig = getTipoIcon(cliente.consumerType);
                  const geradorDetails = getGeneratorDetails(cliente.generatorId || '');
                  
                  return (
                    <tr key={cliente.id} className="hover:bg-slate-50 transition-all duration-200 group">
                      <td className="px-4 py-6">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-12 w-12 rounded-xl ${tipoConfig.color} flex items-center justify-center text-lg shadow-sm`}>
                            {tipoConfig.icon}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-bold text-slate-900 group-hover:text-green-600 transition-colors">
                              {cliente.name}
                            </div>
                            <div className="text-xs text-slate-500 font-mono">{cliente.cpfCnpj}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-6">
                        <div className="space-y-1">
                          <div className="text-xs text-slate-900 capitalize flex items-center">
                            <Building className="h-3 w-3 mr-1 text-slate-400" />
                            {cliente.consumerType.replace('_', ' ')}
                          </div>
                          <div className="text-xs text-slate-600 flex items-center">
                            <Activity className="h-3 w-3 mr-1 text-slate-400" />
                            <span className="font-semibold">{cliente.averageMonthlyConsumption.toLocaleString()}</span>
                            <span className="ml-1">kW/h</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-6">
                        <div className="space-y-1">
                          <div className="text-xs text-slate-900 flex items-center">
                            <MapPin className="h-3 w-3 mr-1 text-slate-400" />
                            {cliente.city}, {cliente.state}
                          </div>
                          <div className="text-xs text-slate-500 font-mono">{cliente.ucNumber}</div>
                        </div>
                      </td>
                      <td className="px-4 py-6">
                        {cliente.representanteId ? (
                          <div className="space-y-1">
                            <div className="text-xs text-slate-900 flex items-center">
                              <UserCheck className="h-3 w-3 mr-1 text-blue-600" />
                              <span className="font-medium">
                                {representantes.find(rep => rep.id === cliente.representanteId)?.name || 'Representante não encontrado'}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500">
                              {representantes.find(rep => rep.id === cliente.representanteId)?.city}, {representantes.find(rep => rep.id === cliente.representanteId)?.state}
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-400 italic">
                            Sem representante
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-6">
                        {cliente.generatorId && geradorDetails ? (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              {renderGeneratorIcon(geradorDetails.sourceType, 'h-4 w-4 text-yellow-500')}
                              <span className="text-xs font-semibold text-slate-900 truncate max-w-[100px]">
                                {geradorDetails.ownerName}
                              </span>
                              <button
                                onClick={() => setShowGeneratorDetails(showGeneratorDetails === cliente.id ? null : cliente.id)}
                                className="p-1 hover:bg-slate-100 rounded transition-colors"
                                title="Ver detalhes do gerador"
                              >
                                <Eye className="h-3 w-3 text-slate-400" />
                              </button>
                            </div>
                            <div className="text-xs text-slate-500">
                              {geradorDetails.city}, {geradorDetails.state}
                            </div>
                            <div className="text-xs text-slate-500">
                              {geradorDetails.installedPower} kW instalados
                            </div>
                            
                            {/* Detalhes expandidos do gerador */}
                            {showGeneratorDetails === cliente.id && (
                              <div className="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                                <div className="space-y-1 text-xs">
                                  <div className="flex justify-between">
                                    <span className="text-slate-600">Tipo:</span>
                                    <span className="font-medium">{geradorDetails.sourceType}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-600">Potência:</span>
                                    <span className="font-medium">{geradorDetails.installedPower} kW</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-600">Localização:</span>
                                    <span className="font-medium">{geradorDetails.city}/{geradorDetails.state}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-slate-400 italic">
                            Nenhum gerador vinculado
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-6">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <TrendingDown className="h-3 w-3 mr-1 text-green-600" />
                            <span className="text-xs font-bold text-green-600">{cliente.discountOffered}%</span>
                            <span className="text-xs text-slate-500 ml-1">desconto</span>
                          </div>
                          {cliente.status === 'ALLOCATED' && (
                            <div className="flex items-center">
                              <div className="w-full bg-slate-200 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(cliente.allocatedPercentage || 0, 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-slate-600 font-semibold min-w-[40px]">
                                {cliente.allocatedPercentage?.toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-6">
                        <div className="space-y-2">
                          {getStatusBadge(cliente.status)}
                        </div>
                      </td>
                      <td className="px-4 py-6">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleEdit(cliente)}
                            className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                            title="Editar cliente"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cliente.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Excluir cliente"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredClientes.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                <Users className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhum cliente encontrado</h3>
              <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                {searchTerm || filterStatus !== 'todos' || filterTipo !== 'todos' || filterGerador !== 'todos'
                  ? 'Tente ajustar os filtros de busca para encontrar os clientes desejados.' 
                  : 'Comece adicionando um novo cliente consumidor ao sistema.'}
              </p>
              {!searchTerm && filterStatus === 'todos' && filterTipo === 'todos' && filterGerador === 'todos' && (
                <button
                  onClick={handleAddNew}
                  className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Cliente
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal aprimorado */}
      {showModal && (
        <ConsumidorModal
          cliente={editingClient}
          onClose={() => setShowModal(false)}
          onSave={async (data, action) => {
            try {
              let successMessage = '';

              if (action === 'create') {
                const newClient = await createCliente(data.formData);
                if (newClient && newClient.id && data.formData.generatorId) {
                  await allocateToGenerator(newClient.id, data.formData.generatorId, data.formData.allocatedPercentage);
                  successMessage = 'Cliente cadastrado e alocado com sucesso!';
                } else {
                  successMessage = 'Cliente cadastrado com sucesso!';
                }
              } else if (action === 'update') {
                await updateCliente(data);
                successMessage = 'Cliente atualizado com sucesso!';
              } else if (action === 'reallocate') {
                await deallocateFromGenerator(data.id);
                await allocateToGenerator(data.id, data.generatorId, data.allocatedPercentage);
                successMessage = 'Cliente realocado com sucesso!';
              } else if (action === 'allocate') {
                await allocateToGenerator(data.id, data.generatorId, data.allocatedPercentage);
                successMessage = 'Cliente alocado com sucesso!';
              } else if (action === 'deallocate') {
                await deallocateFromGenerator(data.id);
                await updateCliente({ id: data.id, ...data.formData });
                successMessage = 'Cliente desalocado e atualizado com sucesso!';
              }
              
              toast.showSuccess(successMessage);
              setShowModal(false);
              setEditingClient(null);

            } catch (error) {
              console.error('Erro ao salvar:', error)
              toast.showError('Erro ao salvar cliente consumidor.');
            }
          }}
        />
      )}
    </div>
  );
}

// Modal Component aprimorado (mantém a mesma estrutura, mas com design atualizado)
function ConsumidorModal({ 
  cliente, 
  onClose, 
  onSave 
}: { 
  cliente: ClienteConsumidor | null; 
  onClose: () => void; 
  onSave: (data: any, action: 'create' | 'update' | 'allocate' | 'deallocate' | 'reallocate') => void;
}) {
  const { clientes: geradores, loading: loadingGeradores, error } = useClientesGeradores();
  const { clientes: todosConsumidores } = useClientesConsumidores();
  const { representantes, loading: loadingRepresentantes } = useRepresentantesComerciais();
  
  const [formData, setFormData] = useState({
    name: cliente?.name || '',
    cpfCnpj: cliente?.cpfCnpj || '',
    ucNumber: cliente?.ucNumber || '',
    concessionaire: cliente?.concessionaire || '',
    city: cliente?.city || '',
    state: cliente?.state || '',
    consumerType: cliente?.consumerType || 'RESIDENTIAL',
    phase: cliente?.phase || 'SINGLE',
    averageMonthlyConsumption: cliente?.averageMonthlyConsumption || 0,
    discountOffered: cliente?.discountOffered || 0,
    status: cliente?.status || 'AVAILABLE',
    generatorId: cliente?.generatorId || '',
    allocatedPercentage: cliente?.allocatedPercentage || 0,
    representanteId: cliente?.representanteId || ''
  });

  useEffect(() => {
    if (formData.generatorId && formData.averageMonthlyConsumption > 0) {
      const selectedGenerator = geradores.find(g => g.id === formData.generatorId);
      if (selectedGenerator && selectedGenerator.installedPower > 0) {
        const percentage = (formData.averageMonthlyConsumption / selectedGenerator.installedPower) * 100;
        const roundedPercentage = Math.round(percentage * 100) / 100;
        setFormData(prev => ({ ...prev, allocatedPercentage: roundedPercentage }));
      }
    }
  }, [formData.generatorId, formData.averageMonthlyConsumption, geradores]);

  const handleStatusChange = (newStatus: string) => {
    const updatedFormData = { ...formData, status: newStatus };
    if (newStatus === 'AVAILABLE') {
      updatedFormData.generatorId = '';
      updatedFormData.allocatedPercentage = 0;
    }
    setFormData(updatedFormData as any);
  };
  
  const calcularCapacidadeDisponivel = (geradorId: string) => {
    let totalAlocado = 0;
    todosConsumidores.forEach(consumidor => {
      if (consumidor.status === 'ALLOCATED' && 
          consumidor.generatorId === geradorId &&
          consumidor.id !== cliente?.id) {
        totalAlocado += consumidor.allocatedPercentage || 0;
      }
    });
    return 100 - totalAlocado;
  };

  const handleSubmit = () => {

    const phaseMapping = {
      SINGLE: 'MONOPHASIC',
      TWO: 'BIPHASIC',
      THREE: 'TRIPHASIC'
    };

    const dataToSend = {
      ...formData,
      phase: phaseMapping[formData.phase as keyof typeof phaseMapping] || formData.phase,
      generatorId: formData.status === 'ALLOCATED' && formData.generatorId ? formData.generatorId : null,
      allocatedPercentage: formData.status === 'ALLOCATED' ? formData.allocatedPercentage : null,
      representanteId: formData.representanteId || null
    };

    if (cliente) {
      const originalStatus = cliente.status;
      const newStatus = formData.status;
      const originalGeneratorId = cliente.generatorId;
      const newGeneratorId = formData.generatorId;

      if (newStatus === 'ALLOCATED' && originalStatus === 'ALLOCATED' && newGeneratorId && newGeneratorId !== originalGeneratorId) {
        onSave({ id: cliente.id, generatorId: newGeneratorId, allocatedPercentage: formData.allocatedPercentage }, 'reallocate');
      } else if (newStatus === 'ALLOCATED' && originalStatus === 'AVAILABLE' && newGeneratorId) {
        onSave({ id: cliente.id, generatorId: newGeneratorId, allocatedPercentage: formData.allocatedPercentage }, 'allocate');
      } else if (newStatus === 'AVAILABLE' && originalStatus === 'ALLOCATED') {
        onSave({ id: cliente.id, formData: dataToSend }, 'deallocate');
      } else {
        onSave({ id: cliente.id, ...dataToSend }, 'update');
      }
    } else {
      onSave({ formData: dataToSend }, 'create');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header do Modal */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <h2 className="text-2xl font-bold">
                {cliente ? 'Editar Cliente Consumidor' : 'Novo Cliente Consumidor'}
              </h2>
              <p className="text-green-100 mt-1">
                {cliente ? 'Atualize as informações do cliente' : 'Cadastre um novo cliente consumidor'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
          <div className="p-6 space-y-6">
            {/* Informações Básicas */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-600" />
                Informações Básicas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Cliente
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="Digite o nome completo"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CPF/CNPJ
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.cpfCnpj}
                    onChange={(e) => setFormData({...formData, cpfCnpj: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="000.000.000-00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número da UC
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ucNumber}
                    onChange={(e) => setFormData({...formData, ucNumber: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="Número da unidade consumidora"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Concessionária
                  </label>
                  <select
                    value={formData.concessionaire}
                    onChange={(e) => setFormData({...formData, concessionaire: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    required
                  >
                    <option value="">Selecione uma concessionária</option>
                    <optgroup label="Região Sul">
                      <option value="CELESC">CELESC - Santa Catarina</option>
                      <option value="COPEL">COPEL - Paraná</option>
                      <option value="CEEE">CEEE - Rio Grande do Sul</option>
                      <option value="RGE">RGE - Rio Grande do Sul</option>
                    </optgroup>
                    {/* Outras regiões... */}
                  </select>
                </div>
              </div>
            </div>

            {/* Localização */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-green-600" />
                Localização
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="Nome da cidade"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado (UF)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value.toUpperCase()})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="SC"
                  />
                </div>
              </div>
            </div>

            {/* Características Técnicas */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-green-600" />
                Características Técnicas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Consumidor
                  </label>
                  <select
                    value={formData.consumerType}
                    onChange={(e) => setFormData({...formData, consumerType: e.target.value as any})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="RESIDENTIAL">🏠 Residencial</option>
                    <option value="COMMERCIAL">🏢 Comercial</option>
                    <option value="RURAL">🌾 Rural</option>
                    <option value="INDUSTRIAL">🏭 Industrial</option>
                    <option value="PUBLIC_POWER">🏛️ Poder Público</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fase
                  </label>
                  <select
                    value={formData.phase}
                    onChange={(e) => setFormData({...formData, phase: e.target.value as any})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="SINGLE">Monofásico</option>
                    <option value="TWO">Bifásico</option>
                    <option value="THREE">Trifásico</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Consumo Médio Mensal (kW/h)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.averageMonthlyConsumption}
                    onChange={(e) => setFormData({...formData, averageMonthlyConsumption: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Desconto Oferecido (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={formData.discountOffered}
                    onChange={(e) => setFormData({...formData, discountOffered: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Status e Alocação */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Status e Alocação
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="AVAILABLE">✅ Disponível</option>
                    <option value="ALLOCATED">🔗 Alocado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Representante Comercial</label>
                  <select
                    value={formData.representanteId}
                    onChange={(e) => setFormData({ ...formData, representanteId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Sem representante</option>
                    {loadingRepresentantes && (
                      <option value="">Carregando representantes...</option>
                    )}
                    {!loadingRepresentantes && representantes.length > 0 && (
                      representantes
                        .filter(rep => rep.status === 'ACTIVE')
                        .map((representante) => (
                          <option key={representante.id} value={representante.id}>
                            {representante.name} - {representante.city}/{representante.state} ({representante.commissionRate}%)
                          </option>
                        ))
                    )}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Opcional: Vincule um representante comercial ativo
                  </p>
                </div>

                {formData.status === 'ALLOCATED' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gerador Vinculado</label>
                      <select
                        value={formData.generatorId}
                        onChange={(e) => setFormData({ ...formData, generatorId: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        disabled={loadingGeradores || geradores.length === 0}
                        required
                      >
                        {loadingGeradores && (
                          <option value="">Carregando geradores...</option>
                        )}
                        {!loadingGeradores && geradores.length === 0 && (
                          <option value="">Nenhum gerador encontrado</option>
                        )}
                        {!loadingGeradores && geradores.length > 0 && (
                          <>
                            <option value="">Selecione um gerador</option>
                            {geradores.map((gerador) => {
                              const name = gerador.ownerName || gerador.ownerName;
                              const location = gerador.city || gerador.state;
                              const capacity = gerador.installedPower || gerador.installedPower;
                              const capacidadeDisponivel = calcularCapacidadeDisponivel(gerador.id);
                              
                              return (
                                <option key={gerador.id} value={gerador.id}>
                                  {name} - {location} ({capacity} kW) - {capacidadeDisponivel.toFixed(1)}% disponível
                                </option>
                              );
                            })}
                          </>
                        )}
                      </select>
                      {error && <p className="text-xs text-red-600 mt-1">Erro ao carregar geradores.</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">% da Energia Alocada</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={formData.allocatedPercentage}
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-100 cursor-not-allowed transition-all duration-200"
                          readOnly
                          disabled
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                          <span className="text-gray-500 text-sm bg-green-100 px-2 py-1 rounded-lg">Automático</span>
                        </div>
                      </div>
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-700">
                          <span className="font-medium">Cálculo automático:</span> (Consumo ÷ Capacidade do Gerador) × 100
                        </p>
                        {formData.allocatedPercentage > 100 && (
                          <p className="text-xs text-red-600 mt-1 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            <span>Atenção: O consumo excede a capacidade do gerador!</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <span>{cliente ? 'Atualizar Cliente' : 'Cadastrar Cliente'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



