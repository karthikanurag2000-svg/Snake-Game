import React, { useEffect } from 'react';
import { RotateCcw, Trophy, Award, Sparkles, Flame, Clock } from 'lucide-react';
import { Achievement, GameMode } from '../types/game';

interface GameOverModalProps {
  score: number;
  highScore: number;
  isNewHigh: boolean;
  mode: GameMode;
  length: number;
  applesEaten: number;
  maxCombo: number;
  survivalSeconds: number;
  botDefeated?: boolean;
  newAchievements: Achievement[];
  onPlayAgain: () => void;
  onChangeMode: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  highScore,
  isNewHigh,
  mode,
  length,
  applesEaten,
  maxCombo,
  survivalSeconds,
  botDefeated,
  newAchievements,
  onPlayAgain,
  onChangeMode,
}) => {
  // Listen for Enter or Space to quickly play again
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        onPlayAgain();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPlayAgain]);

  const modeLabels: Record<GameMode, string> = {
    classic: 'Classic Mode',
    obstacles: 'Mazes & Portals',
    time_attack: 'Time Attack',
    bot_battle: 'AI Bot Battle',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-1.5">
          {isNewHigh ? (
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 fill-amber-400" />
              <span>New Personal Record!</span>
            </div>
          ) : (
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              {modeLabels[mode]}
            </div>
          )}

          <h2 className="text-2xl md:text-3xl font-bold font-display text-white">
            {botDefeated ? 'Victory Over Rival!' : isNewHigh ? 'High Score Achieved' : 'Game Over'}
          </h2>

          <div className="text-4xl md:text-5xl font-bold font-mono text-emerald-400 tabular-nums mt-1">
            {score.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400">
            Previous Best: <span className="font-mono text-slate-300 font-semibold">{highScore.toLocaleString()}</span>
          </div>
        </div>

        {/* Stats breakdown grid */}
        <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs">
          <div className="flex items-center gap-2 p-2">
            <Trophy className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-slate-400">Max Length</span>
              <span className="font-mono font-semibold text-slate-200">{length} segments</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2">
            <Award className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-slate-400">Apples Eaten</span>
              <span className="font-mono font-semibold text-slate-200">{applesEaten}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2">
            <Flame className="w-4 h-4 text-orange-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-slate-400">Peak Streak</span>
              <span className="font-mono font-semibold text-slate-200">{maxCombo}x Combo</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2">
            <Clock className="w-4 h-4 text-sky-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-slate-400">Survival Time</span>
              <span className="font-mono font-semibold text-slate-200">{Math.floor(survivalSeconds)}s</span>
            </div>
          </div>
        </div>

        {/* Newly unlocked achievements notification */}
        {newAchievements.length > 0 && (
          <div className="flex flex-col gap-1.5 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Achievement Unlocked!</span>
            </div>
            {newAchievements.map(ach => (
              <div key={ach.id} className="text-xs text-slate-300">
                <span className="font-semibold text-emerald-300">{ach.title}:</span> {ach.description}
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={onPlayAgain}
            className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-display rounded-xl flex items-center justify-center gap-2 transition-all active:scale-98 shadow-lg shadow-emerald-500/20"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again (Space)</span>
          </button>

          <button
            onClick={onChangeMode}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-medium rounded-xl transition-colors text-center"
          >
            Change Mode / Main Menu
          </button>
        </div>
      </div>
    </div>
  );
};
