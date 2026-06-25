import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmotionalDiary from './pages/EmotionalDiary';
import DailyJournal from './pages/DailyJournal';
import PDFMirror from './pages/PDFMirror';
import { authService } from './services/api';
import { Home, BookHeart, FileText, LogOut, User, BookOpen } from 'lucide-react';

function Navigation({ user, onLogout }) {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: <Home size={18} />, label: 'Inicio' },
    { path: '/emotional', icon: <BookHeart size={18} />, label: 'Diario Emocional' },
    { path: '/daily', icon: <FileText size={18} />, label: 'Diario del Día' },
    { path: '/pdf', icon: <BookOpen size={18} />, label: 'PDF Espejo' },
  ];

  return (
    <>
      <nav
        className="sticky top-0 z-50 shadow-sm"
        style={{ background: 'linear-gradient(160deg, #fff9fe 0%, #f7f9ff 50%, #f4fbf7 100%)', borderBottom: '1px solid #e8d8f4' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full mt-1" style={{ background: '#e8a0d4' }} />
                <span className="w-2 h-2 rounded-full mt-1" style={{ background: '#b8d4a8' }} />
                <span className="w-2 h-2 rounded-full mt-1" style={{ background: '#c4b0e8' }} />
              </div>
              <span className="font-semibold text-lg" style={{ color: '#7a4d8a' }}>Mi diario</span>
            </div>
            {/* Links */}
            <div className="hidden md:flex gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                  style={
                    location.pathname === item.path
                      ? { background: 'linear-gradient(135deg, #e8a0d4 0%, #c4b0e8 50%, #a8d4b8 100%)', color: '#fff' }
                      : { color: '#a89ab8' }
                  }
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>
            {/* Usuario + logout */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm" style={{ color: '#a89ab8' }}>
                <User size={15} style={{ color: '#c4b0e8' }} />
                <span className="hidden sm:inline">{user?.username}</span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl transition-all duration-200"
                style={{ color: '#e8a0d4' }}
                onMouseEnter={e => e.currentTarget.style.background = '#fce4f3'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                title="Cerrar sesión"
              >
                <LogOut size={17} />
              </button>
            </div>
          </div>
        </div>
        <div style={{
        height: 3,
        background: 'linear-gradient(90deg, #e8a0d4 0%, #c4b0e8 50%, #a8d4b8 100%)',
        opacity: 0.6,
      }} />
      </nav>
    </>
  );
}

function AuthenticatedApp({ user, onLogout }) {
  return (
    <Router>
      <div
        className="min-h-screen"
        style={{ background: 'linear-gradient(135deg, #fce4f320 0%, #ede8f815 50%, #e4f4ec10 100%)' }}
      >
        <Navigation user={user} onLogout={onLogout} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/emotional" element={<EmotionalDiary />} />
            <Route path="/daily" element={<DailyJournal />} />
            <Route path="/pdf" element={<PDFMirror />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

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

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return <AuthenticatedApp user={user} onLogout={handleLogout} />;
}

export default App;