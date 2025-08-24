import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Toast from '../components/common/Toast';

type AppAction =
  | { type: 'SET_VIEW'; payload: 'dashboard' | 'geradores' | 'consumidores' | 'representantes' }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AppState = {
  currentView: 'dashboard',
  loading: false,
  isAuthenticated: false
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_VIEW':
      return {
        ...state,
        currentView: action.payload
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  auth: ReturnType<typeof useAuth>;
  toast: ReturnType<typeof useToast>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const auth = useAuth();
  const toast = useToast();

  // Atualizar estado de autenticação baseado no hook useAuth
  const updatedState = {
    ...state,
    isAuthenticated: auth.isAuthenticated
  };
  return (
    <AppContext.Provider value={{ state: updatedState, dispatch, auth, toast }}>
      {children}
      {/* Renderizar toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toast.toasts.map((toastItem) => (
          <Toast
            key={toastItem.id}
            type={toastItem.type}
            message={toastItem.message}
            onClose={() => toast.removeToast(toastItem.id)}
          />
        ))}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de AppProvider');
  }
  return context;
}