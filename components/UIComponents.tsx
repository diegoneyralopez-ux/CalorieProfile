import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  className = '',
  disabled,
  ...props
}) => {
  // Base styles: Sharper corners (rounded-md), font-bold for that poster look
  const baseStyles = "rounded-md font-bold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-0.5";
  
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs uppercase tracking-wider",
    md: "px-5 py-3 text-sm uppercase tracking-wide",
    lg: "px-8 py-4 text-base uppercase tracking-wide"
  };

  const variants = {
    primary: "bg-brand-red hover:bg-red-700 text-white shadow-sm", // Flat red
    secondary: "bg-brand-blue hover:bg-sky-700 text-white shadow-sm", // Flat blue
    outline: "bg-transparent border-2 border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white", // Sharp outline
    danger: "bg-red-100 hover:bg-red-200 text-red-700 border border-red-200",
    ghost: "bg-transparent hover:bg-black/5 text-brand-dark"
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variants[variant]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing
        </>
      ) : children}
    </button>
  );
};

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    // White card on cream bg, sharp border, minimal shadow
    className={`bg-white rounded-lg border border-slate-200 p-6 ${className} ${onClick ? 'cursor-pointer hover:border-brand-blue transition-colors' : ''}`}
  >
    {children}
  </div>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => (
  <input
    className={`w-full px-4 py-3 rounded-md border border-slate-200 bg-white focus:bg-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all text-brand-dark placeholder:text-slate-400 font-medium ${className}`}
    {...props}
  />
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className = '', ...props }) => (
  <div className="relative">
    <select
      className={`w-full px-4 py-3 rounded-md border border-slate-200 bg-white focus:bg-white focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all text-brand-dark appearance-none cursor-pointer font-medium ${className}`}
      {...props}
    />
    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
      <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
);