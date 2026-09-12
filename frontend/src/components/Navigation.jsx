import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Heart, BookOpen, Book, LogOut } from 'lucide-react';

function Navigation({ user, onLogout }) {
  const location = useLocation();
  const links = [
    { to: '/', label: 'Inicio', icon: Home },
    { to: '/emotional', label: 'Emocional', icon: Heart },
    { to: '/daily', label: 'Diario', icon: Book },
    { to: '/pdf', label: 'PDF Espejo', icon: BookOpen },
  ];

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-md border-b" style={{ background: 'rgba(255,249,254,0.85)', borderColor: '#e8d8f4' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
        <div className="flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all"
                style={active
                  ? { background: 'linear-gradient(135deg, #e8a0d4, #c4b0e8, #a8d4b8)', color: '#fff' }
                  : { color: '#7a4d8a' }}
              >
                <Icon size={15} /> {label}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: '#a89ab8' }}>{user?.username}</span>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all"
            style={{ background: '#fce4f3', color: '#a0457a' }}
          >
            <LogOut size={14} /> Salir
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;