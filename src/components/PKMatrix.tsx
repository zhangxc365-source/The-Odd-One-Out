import React from 'react';

interface PKMatrixProps {
  matrix: string[];
  targetsFound: number[];
  onCellClick: (i: number) => void;
  player: number;
}

const PKMatrix: React.FC<PKMatrixProps> = ({ 
  matrix, 
  targetsFound, 
  onCellClick,
  player
}) => {
  return (
    <div 
      className="grid grid-cols-8 gap-2 bg-art-yellow-light p-4 rounded-3xl border-4 border-art-yellow-border shadow-inner"
      style={{ 
        width: 'min(48vw, 720px)',
        height: 'min(48vw, 720px)'
      }}
    >
      {matrix.map((char, i) => (
        <button
          key={i}
          onClick={() => onCellClick(i)}
          className={`
            aspect-square flex items-center justify-center rounded-xl text-sm md:text-3xl font-serif font-black transition-all shadow-sm
            ${targetsFound.includes(i) ? 'bg-transparent text-transparent scale-0 rotate-12 opacity-0' : 'bg-white border-2 border-art-yellow-border text-gray-800 hover:scale-110 active:scale-90'}
          `}
          disabled={targetsFound.includes(i)}
        >
          {char}
        </button>
      ))}
    </div>
  );
};

export default PKMatrix;
