import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Pause, Play, RotateCcw } from 'lucide-react';
import { Direction, GameStatus } from '../types/game';

interface ArcadeControlsProps {
  onDirectionChange: (dir: Direction) => void;
  currentDirection: Direction;
  gameStatus: GameStatus;
  onTogglePause: () => void;
  onRestart: () => void;
}

export const ArcadeControls: React.FC<ArcadeControlsProps> = ({
  onDirectionChange,
  currentDirection,
  gameStatus,
  onTogglePause,
  onRestart,
}) => {
  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(12);
    }
  };

  const handlePress = (dir: Direction) => {
    triggerHaptic();
    onDirectionChange(dir);
  };

  return (
    <div className="w-full flex items-center justify-between gap-4 select-none touch-none pt-2">
      {/* Quick Action buttons */}
      <div className="flex flex-col gap-2">
        <button
          onClick={() => {
            triggerHaptic();
            onTogglePause();
          }}
          disabled={gameStatus === 'GAME_OVER' || gameStatus === 'MENU'}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-all active:scale-95 disabled:opacity-40"
        >
          {gameStatus === 'PAUSED' ? (
            <>
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>Resume</span>
            </>
          ) : (
            <>
              <Pause className="w-3.5 h-3.5 text-amber-400" />
              <span>Pause</span>
            </>
          )}
        </button>

        <button
          onClick={() => {
            triggerHaptic();
            onRestart();
          }}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-all active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Restart</span>
        </button>
      </div>

      {/* D-Pad Controller */}
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* Background cross guide */}
        <div className="absolute inset-0 bg-slate-900/60 border border-slate-800/80 rounded-2xl" />

        {/* Up */}
        <button
          aria-label="Up"
          onClick={() => handlePress('UP')}
          className={`absolute top-1.5 w-11 h-10 rounded-lg flex items-center justify-center transition-all active:scale-90 ${
            currentDirection === 'UP'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
              : 'bg-slate-800/90 text-slate-300 hover:bg-slate-750 border border-slate-700/60'
          }`}
        >
          <ArrowUp className="w-5 h-5" />
        </button>

        {/* Down */}
        <button
          aria-label="Down"
          onClick={() => handlePress('DOWN')}
          className={`absolute bottom-1.5 w-11 h-10 rounded-lg flex items-center justify-center transition-all active:scale-90 ${
            currentDirection === 'DOWN'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
              : 'bg-slate-800/90 text-slate-300 hover:bg-slate-750 border border-slate-700/60'
          }`}
        >
          <ArrowDown className="w-5 h-5" />
        </button>

        {/* Left */}
        <button
          aria-label="Left"
          onClick={() => handlePress('LEFT')}
          className={`absolute left-1.5 w-10 h-11 rounded-lg flex items-center justify-center transition-all active:scale-90 ${
            currentDirection === 'LEFT'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
              : 'bg-slate-800/90 text-slate-300 hover:bg-slate-750 border border-slate-700/60'
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Right */}
        <button
          aria-label="Right"
          onClick={() => handlePress('RIGHT')}
          className={`absolute right-1.5 w-10 h-11 rounded-lg flex items-center justify-center transition-all active:scale-90 ${
            currentDirection === 'RIGHT'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
              : 'bg-slate-800/90 text-slate-300 hover:bg-slate-750 border border-slate-700/60'
          }`}
        >
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Center pivot */}
        <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700/80 pointer-events-none" />
      </div>
    </div>
  );
};
