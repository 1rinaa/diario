// frontend/src/components/LayoutWithBg.jsx
import React from 'react';
import dashboardBg from '../assets/bg.jpg';

function LayoutWithBg({ children }) {
  return (
    <div className="relative min-h-screen">
      {/* Contenedor de fondo fijo que cubre toda la pantalla */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          backgroundImage: `url(${dashboardBg})`,
          backgroundSize: 'cover',
          filter: 'blur(5.5px)',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          opacity: 0.35,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      
      {/* Contenido con scroll independiente */}
      <div className="relative" style={{ zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}

export default LayoutWithBg;