import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost';
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  className = "", 
  variant = "primary" 
}) => {
  const variants = {
    primary: "bg-white border-4 border-art-amber text-art-amber-dark hover:bg-art-yellow-light shadow-[4px_4px_0_rgba(245,158,11,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]",
    secondary: "bg-white border-4 border-art-emerald text-art-emerald-dark hover:bg-emerald-50 shadow-[4px_4px_0_rgba(16,185,129,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]",
    accent: "bg-art-amber text-white border-4 border-art-amber-dark shadow-[4px_4px_0_rgba(217,119,6,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]",
    danger: "bg-white border-4 border-red-500 text-red-600 hover:bg-red-50 shadow-[4px_4px_0_rgba(239,68,68,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]",
    ghost: "bg-white/50 backdrop-blur-sm border-2 border-art-yellow-border text-art-blue hover:bg-white"
  };

  return (
    <button 
      onClick={onClick}
      className={`px-8 py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 ${variants[variant]} ${className} font-sans uppercase tracking-tight`}
    >
      {children}
    </button>
  );
};

export default Button;
