import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ClientesGeradores from './components/ClientesGeradores';
import ClientesConsumidores from './components/ClientesConsumidores';
import RepresentantesComerciais from './components/RepresentantesComerciais';
import PWAInstallPrompt from './components/common/PWAInstallPrompt';

function AppContent() {
  const { state } = useApp();

  if (!state.isAuthenticated) {
    return <Login />;
  }

  const renderCurrentView = () => {
    console.log('App: renderCurrentView called with currentView:', state.currentView);
    switch (state.currentView) {
      case 'geradores':
        return <ClientesGeradores />;
      case 'consumidores':
        return <ClientesConsumidores />;
      case 'representantes':
        console.log('App: Rendering RepresentantesComerciais component');
        return <RepresentantesComerciais />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
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