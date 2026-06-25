import React, { useState } from 'react';
import { authService } from '../services/api';
import { Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import loginBg from '../assets/login.png';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authService.login(username, password);
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      if (onLogin) {
        onLogin(data.token, data.user);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #fce4f392 0%, #ede8f86f 50%, #e4f4ec44 100%)' }}
    >
      <div className="w-full max-w-4xl flex overflow-hidden rounded-3xl shadow-2xl">

        {/* Panel izquierdo — imagen */}
        <div
          className="hidden lg:flex lg:w-[45%] relative flex-col justify-end p-8 overflow-hidden"
          style={{
            backgroundImage: `url(${loginBg})`,
            backgroundSize: 'cover',
            backgroundPosition: '75% top',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* Overlay con tono lila suave */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to top, rgba(161,109,192,0.45) 0%, rgba(255,255,255,0.05) 60%)'
          }} />

          <div className="relative z-10">
            <h1
              className="font-semibold text-white text-5xl tracking-widest mb-1"
              style={{ textShadow: '0 2px 16px rgba(120,60,150,0.3)' }}
            >
            </h1>
            <p className="text-white/70 text-xs tracking-wider">
              Un espacio para desahogarte
            </p>
          </div>
        </div>

        {/* Panel derecho — formulario */}
        <div
          className="w-full lg:flex-1 p-10 flex flex-col justify-center"
          style={{ background: 'linear-gradient(160deg, #fff9fe 0%, #f7f9ff 50%, #f4fbf7 100%)' }}
        >
          <div className="max-w-sm mx-auto w-full">

            {/* Detalle decorativo */}
            <div className="flex gap-1.5 mb-6">
              <span className="w-2 h-2 rounded-full" style={{ background: '#e8a0d4' }} />
              <span className="w-2 h-2 rounded-full" style={{ background: '#b8d4a8' }} />
              <span className="w-2 h-2 rounded-full" style={{ background: '#c4b0e8' }} />
            </div>

            <h2 className="font-semibold text-3xl mb-1" style={{ color: '#7a4d8a' }}>
              Hola, 
            </h2>
            <p className="text-sm mb-8" style={{ color: '#a89ab8' }}>
              Ingresa tus datos para continuar
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Usuario */}
              <div>
                <label className="block text-xs font-medium mb-1.5 tracking-wide" style={{ color: '#a89ab8' }}>
                  Usuario
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: '#c4b0e8' }} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Tu usuario"
                    required
                    disabled={loading}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm transition-all outline-none"
                    style={{
                      border: '1px solid #e8d8f4',
                      background: '#fdf8ff',
                      color: '#5a3d6e',
                    }}
                    onFocus={e => e.target.style.boxShadow = '0 0 0 3px rgba(196,176,232,0.3)'}
                    onBlur={e => e.target.style.boxShadow = 'none'}
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-xs font-medium mb-1.5 tracking-wide" style={{ color: '#a89ab8' }}>
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: '#c4b0e8' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl text-sm transition-all outline-none"
                    style={{
                      border: '1px solid #e8d8f4',
                      background: '#fdf8ff',
                      color: '#5a3d6e',
                    }}
                    onFocus={e => e.target.style.boxShadow = '0 0 0 3px rgba(196,176,232,0.3)'}
                    onBlur={e => e.target.style.boxShadow = 'none'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: '#c4b0e8' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Recordarme / Olvidé contraseña */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded"
                    style={{ accentColor: '#e8a0d4'}}
                  />
                  <span className="text-xs" style={{ color: '#a89ab8' }}>Recordarme</span>
                </label>
                <button
                  type="button"
                  className="text-xs transition-colors"
                  style={{ color: '#c4b0e8' }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="text-xs text-center p-3 rounded-xl"
                  style={{ background: '#fce4f3', color: '#a0457a' }}>
                  {error}
                </div>
              )}

              {/* Botón */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: loading
                    ? '#c4b0e8'
                    : 'linear-gradient(135deg, #e8a0d4 0%, #c4b0e8 50%, #a8d4b8 100%)',
                  boxShadow: '0 4px 20px rgba(196,176,232,0.4)',
                }}
              >
                {loading ? (
                  <>
                    <span className="animate-spin inline-block">🌸</span>
                    Cargando...
                  </>
                ) : (
                  <>
                    Iniciar Sesión
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs mt-8" style={{ color: '#c4b0e8' }}>
              Al continuar, aceptas nuestros{' '}
              <a href="#" className="hover:underline" style={{ color: '#a8d4b8' }}>Términos</a>{' '}
              y{' '}
              <a href="#" className="hover:underline" style={{ color: '#a8d4b8' }}>Política de Privacidad</a>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;