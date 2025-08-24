import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useClientesGeradores } from '../hooks/useClientesGeradores';
import { useClientesConsumidores } from '../hooks/useClientesConsumidores';
import { ClienteGerador } from '../types';
import {
  Plus,
  Search,
  Filter,
  Factory,
  MapPin,
  Zap,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Wind,
  Droplet,
  Leaf,
  Users,
  BarChart3,
  TrendingUp,
  Activity,
  X,
  Loader
} from 'lucide-react';
import PagluzLogo from './common/PagluzLogo';

export default function ClientesGeradores() {
  const { toast } = useApp();
  const {
    clientes: clientesGeradores,
    loading,
    error,
    createCliente,
    updateCliente,
    deleteCliente
  } = useClientesGeradores();
  
  const { clientes: clientesConsumidores } = useClientesConsumidores();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<ClienteGerador | null>(null);
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterSourceType, setFilterSourceType] = useState('todos');

  // Função para calcular a porcentagem alocada de cada gerador
  const calcularPorcentagemAlocada = (geradorId: string) => {
    let totalAlocado = 0;
    
    clientesConsumidores.forEach(cliente => {
      if (cliente.status === 'ALLOCATED' && cliente.generatorId === geradorId) {
        totalAlocado += cliente.allocatedPercentage || 0;
      }
    });
    
    return totalAlocado;
  };

  // Função para determinar o status real do gerador baseado na alocação
  const getStatusReal = (cliente: ClienteGerador) => {
    const porcentagemAlocada = calcularPorcentagemAlocada(cliente.id);
    
    if (porcentagemAlocada >= 100) {
      return 'FULLY_ALLOCATED';
    }
    
    return cliente.status;
  };

  const filteredClientes = (clientesGeradores || []).filter(cliente => {
    const matchesSearch = cliente.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cliente.cpfCnpj.includes(searchTerm) ||
                         cliente.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusReal = getStatusReal(cliente);
    const matchesStatusFilter = filterStatus === 'todos' || statusReal === filterStatus;
    const matchesSourceFilter = filterSourceType === 'todos' || cliente.sourceType === filterSourceType;
    
    return matchesSearch && matchesStatusFilter && matchesSourceFilter;
  });

  // Stats para dashboard
  const stats = {
    total: clientesGeradores?.length || 0,
    emAnalise: clientesGeradores?.filter(c => c.status === 'UNDER_ANALYSIS').length || 0,
    aguardandoAlocacao: clientesGeradores?.filter(c => getStatusReal(c) === 'AWAITING_ALLOCATION').length || 0,
    totalmenteAlocados: clientesGeradores?.filter(c => getStatusReal(c) === 'FULLY_ALLOCATED').length || 0,
    potenciaTotal: clientesGeradores?.reduce((acc, c) => acc + (c.installedPower || 0), 0) || 0
  };

  const handleEdit = (cliente: ClienteGerador) => {
    setEditingClient(cliente);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente gerador?')) {
      try {
        await deleteCliente(id);
        toast.showSuccess('Cliente gerador excluído com sucesso!');
      } catch (error) {
        toast.showError('Erro ao excluir cliente gerador.');
      }
    }
  };

  const handleAddNew = () => {
    setEditingClient(null);
    setShowModal(true);
  };

  const getStatusBadge = (cliente: ClienteGerador) => {
    const statusReal = getStatusReal(cliente);
    const porcentagemAlocada = calcularPorcentagemAlocada(cliente.id);
    
    const statusConfig = {
      'UNDER_ANALYSIS': { 
        label: 'Em Análise', 
        color: 'bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-700 border border-yellow-200',
        icon: <Activity className="h-3 w-3" />
      },
      'AWAITING_ALLOCATION': { 
        label: `Aguardando Alocação (${porcentagemAlocada.toFixed(1)}%)`, 
        color: 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200',
        icon: <BarChart3 className="h-3 w-3" />
      },
      'FULLY_ALLOCATED': { 
        label: 'Totalmente Alocada', 
        color: 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200',
        icon: <CheckCircle className="h-3 w-3" />
      }
    };
    
    const config = statusConfig[statusReal as keyof typeof statusConfig];
    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${config?.color || 'bg-gray-100 text-gray-800'}`}>
        {config?.icon}
        <span>{config?.label || statusReal}</span>
      </span>
    );
  };

  const renderSourceTypeIcon = (sourceType: string, className: string) => {
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

  const getConsumidoresVinculados = (geradorId: string) => {
    return clientesConsumidores.filter(c => c.generatorId === geradorId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-slate-600">Carregando geradores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header com gradiente da Pagluz */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-green-600 shadow-2xl">
        <div className="max-w-full mx-auto px-4 py-8"> {/* Alterado de max-w-7xl px-6 para max-w-full px-4 */}
          <div className="flex items-center justify-between">
            <div className="text-white">
              <div className="flex items-center space-x-3 mb-2">
                <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg">
                  <Factory className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Clientes Geradores</h1>
                  <p className="text-slate-200 text-lg mt-1">Gestão inteligente de geradores de energia renovável</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleAddNew}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-2xl flex items-center space-x-3 transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl border border-white/20"
            >
              <Plus className="h-6 w-6" />
              <span className="font-semibold text-lg">Novo Gerador</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-4 py-8 space-y-8"> {/* Alterado de max-w-7xl px-6 para max-w-full px-4 */}
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-2">Total de Geradores</p>
                <p className="text-4xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <div className="h-16 w-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Factory className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-2">Em Análise</p>
                <p className="text-4xl font-bold text-yellow-600">{stats.emAnalise}</p>
              </div>
              <div className="h-16 w-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Activity className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-2">Aguardando Alocação</p>
                <p className="text-4xl font-bold text-blue-600">{stats.aguardandoAlocacao}</p>
              </div>
              <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-2">Totalmente Alocados</p>
                <p className="text-4xl font-bold text-green-600">{stats.totalmenteAlocados}</p>
              </div>
              <div className="h-16 w-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-2">Potência Total</p>
                <p className="text-4xl font-bold text-purple-600">{stats.potenciaTotal.toLocaleString()}</p>
                <p className="text-xs text-slate-500">kW instalados</p>
              </div>
              <div className="h-16 w-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nome, CPF/CNPJ ou cidade..."
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
                  className="border border-slate-200 rounded-xl px-4 py-4 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-slate-50 min-w-[160px]"
                >
                  <option value="todos">Todos os Status</option>
                  <option value="UNDER_ANALYSIS">Em Análise</option>
                  <option value="AWAITING_ALLOCATION">Aguardando Alocação</option>
                  <option value="FULLY_ALLOCATED">Totalmente Alocada</option>
                </select>
              </div>
              <select
                value={filterSourceType}
                onChange={(e) => setFilterSourceType(e.target.value)}
                className="border border-slate-200 rounded-xl px-4 py-4 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-slate-50 min-w-[140px]"
              >
                <option value="todos">Todas as Fontes</option>
                <option value="SOLAR">☀️ Solar</option>
                <option value="WIND">💨 Eólica</option>
                <option value="HYDRO">💧 Hídrica</option>
                <option value="BIOMASS">🌱 Biomassa</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Clientes */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-100 to-slate-200 border-b border-slate-300">
                  <th className="px-4 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Gerador</th> {/* Alterado de px-6 para px-4 */}
                  <th className="px-4 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Tipo/Potência</th> {/* Alterado de px-6 para px-4 */}
                  <th className="px-4 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Localização</th> {/* Alterado de px-6 para px-4 */}
                  <th className="px-4 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Consumidores</th> {/* Alterado de px-6 para px-4 */}
                  <th className="px-4 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Alocação</th> {/* Alterado de px-6 para px-4 */}
                  <th className="px-4 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Status</th> {/* Alterado de px-6 para px-4 */}
                  <th className="px-4 py-5 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">Ações</th> {/* Alterado de px-6 para px-4 */}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredClientes.map((cliente) => {
                  const porcentagemAlocada = calcularPorcentagemAlocada(cliente.id);
                                              const sourceConfig = { color: 'text-yellow-500', bg: 'bg-yellow-100' };
                  const consumidoresVinculados = getConsumidoresVinculados(cliente.id);
                  
                  return (
                    <tr key={cliente.id} className="hover:bg-slate-50 transition-all duration-200 group">
                      <td className="px-4 py-6"> {/* Alterado de px-6 para px-4 */}
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-14 w-14 rounded-2xl ${sourceConfig.bg} flex items-center justify-center shadow-lg`}>
                            {renderSourceTypeIcon(cliente.sourceType, `h-7 w-7 ${sourceConfig.color}`)}
                          </div>
                          <div className="ml-4">
                            <div className="text-lg font-bold text-slate-900 group-hover:text-green-600 transition-colors">
                              {cliente.ownerName}
                            </div>
                            <div className="text-sm text-slate-500 font-mono">{cliente.cpfCnpj}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-6"> {/* Alterado de px-6 para px-4 */}
                        <div className="space-y-2">
                          <div className="text-sm text-slate-900 capitalize flex items-center">
                            {renderSourceTypeIcon(cliente.sourceType, `h-4 w-4 mr-2 ${sourceConfig.color}`)}
                            {cliente.sourceType.toLowerCase()}
                          </div>
                          <div className="text-sm text-slate-600 flex items-center">
                            <Zap className="h-4 w-4 mr-2 text-slate-400" />
                            <span className="font-semibold">{cliente.installedPower?.toLocaleString()}</span>
                            <span className="ml-1">kW</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-6"> {/* Alterado de px-6 para px-4 */}
                        <div className="space-y-2">
                          <div className="text-sm text-slate-900 flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                            {cliente.city}, {cliente.state}
                          </div>
                          <div className="text-sm text-slate-500 font-mono">{cliente.ucNumber}</div>
                          <div className="text-sm text-slate-500">{cliente.concessionaire}</div>
                        </div>
                      </td>
                      <td className="px-4 py-6"> {/* Alterado de px-6 para px-4 */}
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-slate-400" />
                            <span className="text-sm font-semibold text-slate-900">
                              {consumidoresVinculados.length} consumidores
                            </span>
                          </div>
                          {consumidoresVinculados.length > 0 && (
                            <div className="text-xs text-slate-500">
                              {consumidoresVinculados.slice(0, 2).map(c => c.name).join(', ')}
                              {consumidoresVinculados.length > 2 && ` +${consumidoresVinculados.length - 2} outros`}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-6"> {/* Alterado de px-6 para px-4 */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-900">
                              {porcentagemAlocada.toFixed(1)}%
                            </span>
                            <span className="text-xs text-slate-500">
                              {(100 - porcentagemAlocada).toFixed(1)}% livre
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-3">
                            <div 
                              className={`h-3 rounded-full transition-all duration-300 ${
                                porcentagemAlocada >= 100 
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                                  : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                              }`}
                              style={{ width: `${Math.min(porcentagemAlocada, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-6"> {/* Alterado de px-6 para px-4 */}
                        {getStatusBadge(cliente)}
                      </td>
                      <td className="px-4 py-6"> {/* Alterado de px-6 para px-4 */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(cliente)}
                            className="p-3 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Editar gerador"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(cliente.id)}
                            className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Excluir gerador"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredClientes.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-6">
                <Factory className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Nenhum gerador encontrado</h3>
              <p className="text-slate-500 mb-8 max-w-md mx-auto text-lg">
                {searchTerm || filterStatus !== 'todos' || filterSourceType !== 'todos'
                  ? 'Tente ajustar os filtros de busca para encontrar os geradores desejados.' 
                  : 'Comece adicionando um novo gerador ao sistema.'}
              </p>
              {!searchTerm && filterStatus === 'todos' && filterSourceType === 'todos' && (
                <button
                  onClick={handleAddNew}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Adicionar Primeiro Gerador
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <GeradorModal
          cliente={editingClient}
          onClose={() => setShowModal(false)}
          onSave={async (clienteData) => {
            try {
              if (editingClient) {
                await updateCliente(clienteData);
                toast.showSuccess('Cliente gerador atualizado com sucesso!');
              } else {
                await createCliente(clienteData);
                toast.showSuccess('Cliente gerador cadastrado com sucesso!');
              }
              setShowModal(false);
            } catch (error) {
              toast.showError('Erro ao salvar cliente gerador.');
            }
          }}
        />
      )}
    </div>
  );
}

// Modal Component para Gerador
function GeradorModal({ 
  cliente, 
  onClose, 
  onSave 
}: { 
  cliente: ClienteGerador | null; 
  onClose: () => void; 
  onSave: (cliente: any) => void;
}) {
  const [formData, setFormData] = useState({
    ownerName: cliente?.ownerName || '',
    cpfCnpj: cliente?.cpfCnpj || '',
    sourceType: cliente?.sourceType || 'SOLAR',
    installedPower: cliente?.installedPower || 0,
    concessionaire: cliente?.concessionaire || '',
    ucNumber: cliente?.ucNumber || '',
    city: cliente?.city || '',
    state: cliente?.state || '',
    status: cliente?.status || 'UNDER_ANALYSIS',
    observations: cliente?.observations || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cliente) {
      // Para atualização, inclui o ID
      onSave({
        id: cliente.id,
        ...formData
      });
    } else {
      // Para criação, envia apenas os dados do formulário
      onSave(formData);
    }
  };



  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl border border-slate-200">
        {/* Header do Modal */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-green-600 p-8">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <h2 className="text-3xl font-bold">
                {cliente ? 'Editar Cliente Gerador' : 'Novo Cliente Gerador'}
              </h2>
              <p className="text-slate-200 mt-2 text-lg">
                {cliente ? 'Atualize as informações do gerador' : 'Cadastre um novo gerador de energia'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-3 rounded-xl transition-colors duration-200"
            >
              <X className="h-7 w-7" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto max-h-[calc(95vh-140px)]">
          {/* Informações Básicas */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 border border-slate-200">
            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
              <Factory className="h-6 w-6 mr-3 text-green-600" />
              Informações Básicas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Nome do Proprietário/Empresa
                </label>
                <input
                  type="text"
                  required
                  value={formData.ownerName}
                  onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                  className="w-full px-4 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                  placeholder="Nome do proprietário ou empresa"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  CPF/CNPJ
                </label>
                <input
                  type="text"
                  required
                  value={formData.cpfCnpj}
                  onChange={(e) => setFormData({...formData, cpfCnpj: e.target.value})}
                  className="w-full px-4 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                  placeholder="000.000.000-00"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Tipo de Fonte
                </label>
                <select
                  value={formData.sourceType}
                  onChange={(e) => setFormData({...formData, sourceType: e.target.value as any})}
                  className="w-full px-4 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                >
                  <option value="SOLAR">☀️ Solar</option>
                  <option value="WIND">💨 Eólica</option>
                  <option value="HYDRO">💧 Hídrica</option>
                  <option value="BIOMASS">🌱 Biomassa</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Potência Instalada (kW)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.installedPower}
                  onChange={(e) => setFormData({...formData, installedPower: parseFloat(e.target.value)})}
                  className="w-full px-4 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                  placeholder="0.0"
                />
              </div>
            </div>
          </div>

          {/* Localização e Concessionária */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 border border-slate-200">
            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
              <MapPin className="h-6 w-6 mr-3 text-green-600" />
              Localização e Concessionária
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Concessionária
                </label>
                <select
                  value={formData.concessionaire}
                  onChange={(e) => setFormData({...formData, concessionaire: e.target.value})}
                  className="w-full px-4 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                  required
                >
                  <option value="">Selecione uma concessionária</option>
                  <optgroup label="Região Sul">
                    <option value="CELESC">CELESC - Santa Catarina</option>
                    <option value="COPEL">COPEL - Paraná</option>
                    <option value="CEEE">CEEE - Rio Grande do Sul</option>
                    <option value="RGE">RGE - Rio Grande do Sul</option>
                  </optgroup>
                  <optgroup label="Região Sudeste">
                    <option value="CEMIG">CEMIG - Minas Gerais</option>
                    <option value="CPFL">CPFL - São Paulo</option>
                    <option value="ELEKTRO">ELEKTRO - São Paulo</option>
                    <option value="ELETROPAULO">ELETROPAULO - São Paulo</option>
                    <option value="LIGHT">LIGHT - Rio de Janeiro</option>
                    <option value="ENEL RJ">ENEL RJ - Rio de Janeiro</option>
                    <option value="EDP ES">EDP ES - Espírito Santo</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Número da UC Geradora
                </label>
                <input
                  type="text"
                  required
                  value={formData.ucNumber}
                  onChange={(e) => setFormData({...formData, ucNumber: e.target.value})}
                  className="w-full px-4 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                  placeholder="Número da unidade consumidora"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Cidade
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full px-4 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                  placeholder="Nome da cidade"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Estado (UF)
                </label>
                <input
                  type="text"
                  required
                  maxLength={2}
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value.toUpperCase()})}
                  className="w-full px-4 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                  placeholder="SC"
                />
              </div>
            </div>
          </div>

          {/* Status e Observações */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 border border-slate-200">
            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
              <Activity className="h-6 w-6 mr-3 text-green-600" />
              Status e Observações
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  className="w-full px-4 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                >
                  <option value="UNDER_ANALYSIS">Em Análise</option>
                  <option value="AWAITING_ALLOCATION">Aguardando Alocação</option>
                </select>
                <p className="text-sm text-slate-500 mt-2">
                  O status "Totalmente Alocada" é atribuído automaticamente quando 100% da capacidade é alocada.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Observações
                </label>
                <textarea
                  rows={4}
                  value={formData.observations}
                  onChange={(e) => setFormData({...formData, observations: e.target.value})}
                  className="w-full px-4 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                  placeholder="Observações adicionais sobre o gerador..."
                />
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-6 pt-8 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all duration-200 font-semibold text-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl transition-all duration-200 font-semibold shadow-xl hover:shadow-2xl text-lg"
            >
              {cliente ? 'Atualizar Gerador' : 'Cadastrar Gerador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



