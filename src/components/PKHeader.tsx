import React from 'react';
import { Timer, Pause } from 'lucide-react';
import { CharacterPair } from '../types';

interface PKHeaderProps {
  player1Score: number;
  player2Score: number;
  player1Lives: number;
  player2Lives: number;
  timeLeft: number;
  activeSessionPair: CharacterPair | null;
  onPause: () => void;
}

const PKHeader: React.FC<PKHeaderProps> = ({
  player1Score,
  player2Score,
  player1Lives,
  player2Lives,
  timeLeft,
  activeSessionPair,
  onPause
}) => {
  return (
    <div className="w-full flex justify-between items-center p-2 md:p-6 bg-white/60 backdrop-blur-md sticky top-0 z-50 border-b-2 md:border-b-4 border-art-yellow-border">
      <div className="flex items-center gap-1 md:gap-3">
        <div className="flex flex-col items-center bg-white border-2 md:border-4 border-art-amber px-2 md:px-6 py-0.5 md:py-1 rounded-xl md:rounded-2xl shadow-sm md:shadow-md">
          <div className="text-[8px] md:text-[10px] uppercase font-black tracking-widest text-art-amber-dark">P1</div>
          <div className="text-xl md:text-3xl font-mono font-black text-art-amber-dark">{player1Score.toString().padStart(3, '0')}</div>
        </div>
        <div className="flex gap-0.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={`text-xs md:text-xl transition-all ${i < player1Lives ? "grayscale-0" : "grayscale opacity-20"}`}>❤️</span>
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-2 md:gap-6">
        <div className="flex items-center gap-1 md:gap-3 bg-white border-2 md:border-4 border-gray-800 px-3 md:px-8 py-1 md:py-2 rounded-full shadow-md">
          <Timer className="w-4 h-4 md:w-6 md:h-6 text-art-amber-dark animate-pulse" />
          <span className="font-mono text-xl md:text-4xl font-black text-gray-800">{timeLeft}s</span>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="bg-white border-2 md:border-4 border-art-emerald px-4 md:px-10 py-1 md:py-3 rounded-xl md:rounded-[2.5rem] shadow-lg">
            <span className="text-2xl md:text-6xl font-serif font-black">{activeSessionPair?.target}</span>
          </div>
          <button 
            onClick={onPause}
            className="w-10 h-10 md:w-16 md:h-16 bg-white border-2 md:border-4 border-gray-800 rounded-lg md:rounded-2xl flex items-center justify-center hover:bg-gray-50 shadow-[2px_2px_0_rgba(31,41,55,1)] md:shadow-[4px_4px_0_rgba(31,41,55,1)] transition-all active:shadow-none active:translate-x-1 active:translate-y-1"
          >
            <Pause className="w-5 h-5 md:w-8 md:h-8 text-gray-800" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-3">
        <div className="flex gap-0.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={`text-xs md:text-xl transition-all ${i < player2Lives ? "grayscale-0" : "grayscale opacity-20"}`}>❤️</span>
          ))}
        </div>
        <div className="flex flex-col items-center bg-white border-2 md:border-4 border-art-emerald px-2 md:px-6 py-0.5 md:py-1 rounded-xl md:rounded-2xl shadow-sm md:shadow-md">
          <div className="text-[8px] md:text-[10px] uppercase font-black tracking-widest text-art-emerald-dark">P2</div>
          <div className="text-xl md:text-3xl font-mono font-black text-art-emerald-dark">{player2Score.toString().padStart(3, '0')}</div>
        </div>
      </div>
    </div>
  );
};

export default PKHeader;
