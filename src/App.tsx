import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ClientesGeradores from './components/ClientesGeradores';
import ClientesConsumidores from './components/ClientesConsumidores';
import RepresentantesComerciais from './components/RepresentantesComerciais';
import UsuariosSistema from './components/UsuariosSistema';
import LogsAtividade from './components/LogsAtividade';
import PWAInstallPrompt from './components/common/PWAInstallPrompt';


function AppContent() {
  const { user, loading: authLoading, isAuthenticated } = useApp();
  const [currentView, setCurrentView] = useState<'dashboard' | 'geradores' | 'consumidores' | 'representantes' | 'usuarios' | 'logs'>('dashboard');

  // Aguardar o carregamento da autenticação
  if (authLoading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Login />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'geradores':
        return <ClientesGeradores />;
      case 'consumidores':
        return <ClientesConsumidores />;
      case 'representantes':
        return <RepresentantesComerciais />;
      case 'usuarios':
        return <UsuariosSistema />;
      case 'logs':
        return <LogsAtividade />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 relative">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1 overflow-y-auto lg:ml-0 w-full relative">
        {renderCurrentView()}
      </main>
      <PWAInstallPrompt />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;