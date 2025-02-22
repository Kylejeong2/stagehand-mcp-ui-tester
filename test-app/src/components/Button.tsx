import React, { useState } from 'react';

interface ButtonProps {
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ 
  label, 
  onClick,
  variant = 'primary' 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const baseStyles = "rounded-full px-4 py-2 transition-all duration-200 font-medium";
  const variantStyles = {
    primary: "bg-black text-white hover:bg-gray-800",
    secondary: "bg-gray-100 text-black hover:bg-gray-200"
  };
  
  const pressedStyles = isPressed ? "scale-95" : "";
  const className = `${baseStyles} ${variantStyles[variant]} ${pressedStyles}`;

  return (
    <button
      className={className}
      onClick={() => {
        setIsPressed(true);
        onClick?.();
        setTimeout(() => setIsPressed(false), 200);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-pressed={isPressed}
    >
      {label}
    </button>
  );
}; 