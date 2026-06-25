import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmotionalDiary from './pages/EmotionalDiary';
import DailyJournal from './pages/DailyJournal';
import PDFMirror from './pages/PDFMirror';
import { authService } from './services/api';
import { Home, BookHeart, FileText, LogOut, User, BookOpen } from 'lucide-react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (token, userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <Router>
      <div
        className="min-h-screen"
        style={{ background: 'linear-gradient(135deg, #fce4f320 0%, #ede8f815 50%, #e4f4ec10 100%)' }}
      >
        {/* Solo mostramos la barra de navegación si el usuario inició sesión */}
        {isAuthenticated && <Navigation user={user} onLogout={handleLogout} />}
        
        <main className={isAuthenticated ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" : ""}>
          <Routes>
            {/* Si NO está autenticado, cualquier ruta lo mandará al Login */}
            <Route 
              path="/login" 
              element={isAuthenticated ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} 
            />
            
            {/* Rutas protegidas */}
            <Route 
              path="/" 
              element={isAuthenticated ? <Dashboard user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/emotional" 
              element={isAuthenticated ? <EmotionalDiary /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/daily" 
              element={isAuthenticated ? <DailyJournal /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/pdf" 
              element={isAuthenticated ? <PDFMirror /> : <Navigate to="/login" />} 
            />
            
            {/* Comodín para redirigir cualquier otra ruta */}
            <Route 
              path="*" 
              element={<Navigate to={isAuthenticated ? "/" : "/login"} />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;