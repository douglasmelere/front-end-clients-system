
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard,
  Users, 
  Factory, 
  LogOut,
  Settings,
  Bell,
  UserCheck,
  Menu,
  X
} from 'lucide-react';
import PagluzLogo from './common/PagluzLogo';
import { useResponsive } from '../hooks/useResponsive';
import { useState } from 'react';

export default function Sidebar() {
  const { state, dispatch, auth } = useApp();
  const { isMobile, isTablet } = useResponsive();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    auth.logout();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      view: 'dashboard' as const,
      description: 'Visão geral do sistema'
    },
    {
      id: 'geradores',
      label: 'Clientes Geradores',
      icon: Factory,
      view: 'geradores' as const,
      description: 'Gestão de geradores'
    },
    {
      id: 'consumidores',
      label: 'Clientes Consumidores',
      icon: Users,
      view: 'consumidores' as const,
      description: 'Gestão de consumidores'
    },
    {
      id: 'representantes',
      label: 'Representantes',
      icon: UserCheck,
      view: 'representantes' as const,
      description: 'Gestão de representantes'
    }
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      {(isMobile || isTablet) && (
        <button
          onClick={toggleMobileMenu}
          className="fixed top-4 left-4 z-50 p-2 bg-[#35cc20] text-white rounded-lg lg:hidden shadow-lg"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobile || isTablet ? 'fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out' : 'relative'}
        ${isMobile || isTablet && !isMobileMenuOpen ? '-translate-x-full' : 'translate-x-0'}
        bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 w-72 flex flex-col h-full shadow-2xl border-r border-slate-700
        ${isMobile || isTablet ? 'shadow-2xl' : ''}
      `}>
      {/* Header com Logo da Pagluz */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-[#35cc20] to-[#6edc5f] p-6 rounded-2xl shadow-[0_4px_14px_0_rgba(53,204,32,0.25)] hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] transition-all duration-300">
            <PagluzLogo className="h-16 w-16 text-white" width={64} height={64} />
          </div>
        </div>
      </div>

      {/* Navegação Principal */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">
            Navegação Principal
          </h3>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = state.currentView === item.view;
            
            return (
              <button
                key={item.id}
                onClick={() => dispatch({ type: 'SET_VIEW', payload: item.view })}
                className={`w-full flex items-center px-4 py-3.5 rounded-xl text-left transition-all duration-300 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 shadow-lg border border-green-500/30'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                {/* Indicador ativo */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-green-400 to-emerald-500 rounded-r-full"></div>
                )}
                
                <div className={`p-2 rounded-lg mr-4 transition-all duration-300 ${
                  isActive 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-slate-700/50 text-slate-400 group-hover:bg-slate-600/50 group-hover:text-white'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                
                <div className="flex-1">
                  <span className="font-semibold text-sm">{item.label}</span>
                  <p className={`text-xs mt-0.5 ${
                    isActive ? 'text-green-300/80' : 'text-slate-500 group-hover:text-slate-400'
                  }`}>
                    {item.description}
                  </p>
                </div>
                
                {/* Efeito de hover */}
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isActive 
                    ? 'bg-green-400 shadow-lg shadow-green-400/50' 
                    : 'bg-transparent group-hover:bg-slate-400'
                }`}></div>
              </button>
            );
          })}
        </div>

        {/* Seção de Configurações */}
        <div className="pt-4 border-t border-slate-700/50">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">
            Sistema
          </h3>
          
          <button className="w-full flex items-center px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all duration-300 group">
            <div className="p-2 rounded-lg mr-4 bg-slate-700/50 text-slate-400 group-hover:bg-slate-600/50 group-hover:text-white transition-all duration-300">
              <Bell className="h-4 w-4" />
            </div>
            <span className="font-medium text-sm">Notificações</span>
          </button>
          
          <button className="w-full flex items-center px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all duration-300 group">
            <div className="p-2 rounded-lg mr-4 bg-slate-700/50 text-slate-400 group-hover:bg-slate-600/50 group-hover:text-white transition-all duration-300">
              <Settings className="h-4 w-4" />
            </div>
            <span className="font-medium text-sm">Configurações</span>
          </button>
        </div>
      </nav>

      {/* Perfil do Usuário */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-800/50">
        <div className="flex items-center mb-4 p-3 rounded-xl bg-slate-700/30">
          <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">
              {auth.user?.name?.charAt(0) || auth.user?.email?.charAt(0) || 'A'}
            </span>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-semibold text-white">
              {auth.user?.name || auth.user?.email}
            </p>
            <p className="text-xs text-slate-400">Administrador</p>
          </div>
          <div className="w-2 h-2 bg-green-400 rounded-full shadow-lg shadow-green-400/50"></div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 text-slate-300 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all duration-300 group border border-transparent hover:border-red-500/30"
        >
          <div className="p-2 rounded-lg mr-3 bg-slate-700/50 text-slate-400 group-hover:bg-red-500/20 group-hover:text-red-400 transition-all duration-300">
            <LogOut className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium">Sair do Sistema</span>
        </button>
      </div>
      
      {/* Overlay para mobile */}
      {(isMobile || isTablet) && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={toggleMobileMenu}
        />
      )}
    </div>
    </>
  );
}

