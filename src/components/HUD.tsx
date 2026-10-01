import React from 'react';
import { ActivePowerUp, GameMode } from '../types/game';
import { Sparkles, Flame, Shield, Snowflake, Magnet, Scissors } from 'lucide-react';

interface HUDProps {
  score: number;
  highScore: number;
  length: number;
  combo: number;
  comboTimerProgress: number; // 0 to 1
  timeLeft?: number; // for time_attack
  activePowerUps: ActivePowerUp[];
  mode: GameMode;
  botScore?: number;
  botLength?: number;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  highScore,
  length,
  combo,
  comboTimerProgress,
  timeLeft,
  activePowerUps,
  mode,
  botScore = 0,
  botLength = 0,
}) => {
  const getPowerUpIcon = (type: string) => {
    switch (type) {
      case 'golden':
        return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
      case 'ghost':
        return <Shield className="w-3.5 h-3.5 text-purple-400" />;
      case 'frost':
        return <Snowflake className="w-3.5 h-3.5 text-sky-400" />;
      case 'magnet':
        return <Magnet className="w-3.5 h-3.5 text-pink-400" />;
      case 'scissors':
        return <Scissors className="w-3.5 h-3.5 text-orange-400" />;
      default:
        return <Flame className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Top metrics bar */}
      <div className="flex items-center justify-between gap-4 py-2 border-b border-slate-800/60 text-xs text-slate-400">
        {/* Left score & high score */}
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-slate-400 font-medium">Score</span>
            <span className="text-xl md:text-2xl font-bold font-mono text-emerald-400 tabular-nums">
              {score.toLocaleString()}
            </span>
          </div>
          <span className="text-slate-600" aria-hidden="true">·</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-slate-400">Best</span>
            <span className="text-base font-semibold font-mono text-slate-200 tabular-nums">
              {highScore.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Center: Mode-specific info or length */}
        <div className="flex items-center gap-3">
          {mode === 'time_attack' && typeof timeLeft === 'number' && (
            <div className="flex items-baseline gap-1.5">
              <span className="text-slate-400">Time</span>
              <span
                className={`text-lg font-bold font-mono tabular-nums ${
                  timeLeft <= 10 ? 'text-rose-400 animate-pulse' : 'text-amber-300'
                }`}
              >
                {Math.ceil(timeLeft)}s
              </span>
              <span className="text-slate-600" aria-hidden="true">·</span>
            </div>
          )}

          {mode === 'bot_battle' && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Rival</span>
              <span className="font-mono font-semibold text-rose-400 tabular-nums">{botScore} pts</span>
              <span className="text-slate-400">({botLength} len)</span>
              <span className="text-slate-600" aria-hidden="true">·</span>
            </div>
          )}

          <div className="flex items-baseline gap-1">
            <span className="text-slate-400">Length</span>
            <span className="font-mono font-semibold text-slate-100 tabular-nums">{length}</span>
          </div>
        </div>
      </div>

      {/* Dynamic power-ups & Combo streak indicators */}
      <div className="flex flex-wrap items-center justify-between gap-2 min-h-6">
        {/* Combo multiplier bar */}
        {combo > 1 ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-amber-400 font-mono text-xs font-bold">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>{combo}x Combo</span>
            </div>
            {/* Combo timer shrink line */}
            <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all duration-75"
                style={{ width: `${Math.max(0, Math.min(100, comboTimerProgress * 100))}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400">
            {mode === 'classic' && 'Eat fruits to grow · Avoid solid walls & your tail'}
            {mode === 'obstacles' && 'Navigate mazes · Wormhole portals warp you across space'}
            {mode === 'time_attack' && 'Race against the clock · Fruits replenish seconds'}
            {mode === 'bot_battle' && 'AI Rival on board · Steal fruit & trap the bot to win!'}
          </div>
        )}

        {/* Active Power-ups text list with timers */}
        {activePowerUps.length > 0 && (
          <div className="flex items-center gap-3">
            {activePowerUps.map(p => {
              const secondsLeft = Math.max(0, (p.expiresAt - Date.now()) / 1000).toFixed(1);
              return (
                <div key={p.type} className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
                  {getPowerUpIcon(p.type)}
                  <span>{p.name}</span>
                  <span className="text-amber-300 font-semibold">{secondsLeft}s</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
