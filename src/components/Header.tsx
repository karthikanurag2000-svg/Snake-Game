import React from 'react';
import { Volume2, VolumeX, Settings, Trophy, HelpCircle, Gamepad2 } from 'lucide-react';
import { GameMode, GameStatus } from '../types/game';

interface HeaderProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  gameStatus: GameStatus;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSettings: () => void;
  onOpenStats: () => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  gameStatus,
  soundEnabled,
  onToggleSound,
  onOpenSettings,
  onOpenStats,
  onOpenHelp,
}) => {
  const modes: { id: GameMode; label: string }[] = [
    { id: 'classic', label: 'Classic' },
    { id: 'obstacles', label: 'Mazes & Portals' },
    { id: 'time_attack', label: 'Time Attack' },
    { id: 'bot_battle', label: 'AI Bot Battle' },
  ];

  return (
    <header className="w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single element brand title wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white font-display">
            Ouroboros <span className="text-emerald-400 font-normal">Arcade</span>
          </span>
        </div>

        {/* Zone 2: Navigation / Game Mode switch */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-900/90 border border-slate-800 rounded-lg">
          {modes.map(mode => {
            const isActive = currentMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => onSelectMode(mode.id)}
                disabled={gameStatus === 'PLAYING'}
                title={gameStatus === 'PLAYING' ? 'Pause or finish run to change mode' : undefined}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {mode.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-900 rounded-lg transition-colors border border-transparent hover:border-slate-800"
            title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            onClick={onOpenStats}
            aria-label="Achievements & Records"
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-900 rounded-lg transition-colors border border-transparent hover:border-slate-800"
            title="Records & Achievements"
          >
            <Trophy className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenHelp}
            aria-label="How to play"
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-900 rounded-lg transition-colors border border-transparent hover:border-slate-800"
            title="How to Play & Power-ups"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-900 rounded-lg transition-colors border border-transparent hover:border-slate-800"
            title="Settings & Customization"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Mode Switcher Bar */}
      <div className="md:hidden border-t border-slate-900 px-3 py-2 flex items-center gap-1 overflow-x-auto no-scrollbar">
        {modes.map(mode => {
          const isActive = currentMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              disabled={gameStatus === 'PLAYING'}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors shrink-0 ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 font-semibold'
                  : 'text-slate-400 bg-slate-900/60 hover:bg-slate-800'
              }`}
            >
              {mode.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
