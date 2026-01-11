import React from 'react';
import { Check, ChevronDown, Calendar, Search } from 'lucide-react';

// --- Custom Checkbox ---
export const CustomCheckbox = ({ checked, onChange, disabled }: { checked: boolean; onChange: (c: boolean) => void, disabled?: boolean }) => (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      if (!disabled) onChange(!checked);
    }}
    disabled={disabled}
    className={`
      relative w-6 h-6 rounded-[0.5rem] border transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex items-center justify-center
      focus:outline-none focus:ring-2 focus:ring-apple-500/30 focus:ring-offset-1 group
      ${checked
        ? 'bg-apple-500 border-apple-500 shadow-sm shadow-apple-500/30 scale-100'
        : 'bg-white border-gray-300 hover:border-apple-400 hover:bg-gray-50'
      }
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-90'}
    `}
  >
    <Check
      className={`w-3.5 h-3.5 text-white transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
        checked ? 'scale-100 opacity-100 rotate-0' : 'scale-50 opacity-0 -rotate-45'
      }`}
      strokeWidth={3.5}
    />
  </button>
);

// --- Custom Input ---
export const CustomInput = ({ value, onChange, placeholder, className, icon: Icon, ...props }: any) => (
  <div className={`relative group ${className}`}>
    {Icon && (
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-apple-500 transition-colors" />
      </div>
    )}
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`
        w-full bg-gray-50/50 border border-gray-200 rounded-xl py-2.5 text-sm
        text-gray-900 placeholder-gray-400 outline-none transition-all duration-300
        focus:bg-white focus:border-apple-500 focus:ring-4 focus:ring-apple-500/10
        hover:bg-white hover:border-gray-300
        ${Icon ? 'pl-10 pr-3' : 'px-4'}
      `}
      {...props}
    />
  </div>
);

// --- Custom Select ---
export const CustomSelect = ({ value, onChange, options, className, icon: Icon }: any) => (
  <div className={`relative group ${className}`}>
     {Icon && (
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-apple-500 transition-colors" />
      </div>
    )}
    <select
      value={value}
      onChange={onChange}
      className={`
        w-full appearance-none bg-gray-50/50 border border-gray-200 rounded-xl py-2.5 text-sm
        text-gray-900 outline-none transition-all duration-300 cursor-pointer
        focus:bg-white focus:border-apple-500 focus:ring-4 focus:ring-apple-500/10
        hover:bg-white hover:border-gray-300
        ${Icon ? 'pl-10 pr-10' : 'pl-4 pr-10'}
      `}
    >
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
      <ChevronDown className="w-4 h-4" />
    </div>
  </div>
);

// --- Custom Date Picker ---
export const CustomDatePicker = ({ value, onChange, className }: any) => {
  const dateObj = new Date(value);
  const displayDate = isNaN(dateObj.getTime()) ? 'Select Date' : dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' });

  return (
    <div className={`relative group ${className}`}>
      <div className="
        flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl 
        shadow-sm transition-all duration-300 group-hover:border-apple-300 group-hover:shadow-md
        group-focus-within:ring-4 group-focus-within:ring-apple-500/10 group-focus-within:border-apple-500
      ">
        <Calendar className="w-4 h-4 text-gray-500 group-hover:text-apple-500 transition-colors" />
        <span className="text-sm font-medium text-gray-700 min-w-[140px]">{displayDate}</span>
        <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" />
      </div>
      <input
        type="date"
        value={value}
        onChange={onChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
    </div>
  );
};

// --- Custom Button ---
export const CustomButton = ({ children, onClick, variant = 'primary', className, icon: Icon, disabled, loading }: any) => {
  const baseStyles = "relative overflow-hidden flex items-center justify-center px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-apple-500 text-white shadow-lg shadow-apple-500/30 hover:bg-apple-600 hover:shadow-apple-500/40",
    secondary: "bg-white text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50 hover:border-gray-300",
    danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100"
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant as keyof typeof variants]} ${className}`}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!loading && Icon && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </button>
  );
};

// --- Card Container ---
export const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden ${className}`}>
    {children}
  </div>
);
