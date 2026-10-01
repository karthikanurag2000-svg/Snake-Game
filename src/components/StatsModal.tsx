import React from 'react';
import { X, Trophy, Sparkles, Award, Zap, Swords, Compass, Clock, CheckCircle2, Lock } from 'lucide-react';
import { GameStats } from '../types/game';
import { ACHIEVEMENTS_LIST } from '../utils/storage';

interface StatsModalProps {
  stats: GameStats;
  onClose: () => void;
  onResetStats?: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ stats, onClose }) => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'Apple':
        return <Award className="w-4 h-4 text-rose-400" />;
      case 'Maximize2':
        return <Trophy className="w-4 h-4 text-emerald-400" />;
      case 'Crown':
        return <Trophy className="w-4 h-4 text-amber-400" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-yellow-400" />;
      case 'Zap':
        return <Zap className="w-4 h-4 text-orange-400" />;
      case 'Swords':
        return <Swords className="w-4 h-4 text-rose-400" />;
      case 'Compass':
        return <Compass className="w-4 h-4 text-sky-400" />;
      case 'Clock':
        return <Clock className="w-4 h-4 text-purple-400" />;
      default:
        return <Trophy className="w-4 h-4 text-emerald-400" />;
    }
  };

  const unlockedSet = new Set(stats.unlockedAchievements || []);
  const unlockCount = ACHIEVEMENTS_LIST.filter(a => unlockedSet.has(a.id)).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold font-display text-white">Records & Trophies</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* High scores by mode */}
        <div className="flex flex-col gap-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Mode High Scores
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-xl flex flex-col">
              <span className="text-slate-400">Classic</span>
              <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
                {(stats.highScores?.classic || 0).toLocaleString()}
              </span>
            </div>

            <div className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-xl flex flex-col">
              <span className="text-slate-400">Mazes & Portals</span>
              <span className="text-lg font-bold font-mono text-sky-400 tabular-nums">
                {(stats.highScores?.obstacles || 0).toLocaleString()}
              </span>
            </div>

            <div className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-xl flex flex-col">
              <span className="text-slate-400">Time Attack</span>
              <span className="text-lg font-bold font-mono text-amber-400 tabular-nums">
                {(stats.highScores?.time_attack || 0).toLocaleString()}
              </span>
            </div>

            <div className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-xl flex flex-col">
              <span className="text-slate-400">AI Bot Battle</span>
              <span className="text-lg font-bold font-mono text-rose-400 tabular-nums">
                {(stats.highScores?.bot_battle || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Lifetime stats banner */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-center">
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400">Total Fruits</span>
            <span className="text-base font-bold font-mono text-slate-200 tabular-nums">
              {(stats.totalApples || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col border-x border-slate-800">
            <span className="text-[11px] text-slate-400">Longest Snake</span>
            <span className="text-base font-bold font-mono text-slate-200 tabular-nums">
              {stats.longestSnake || 0}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400">Games Played</span>
            <span className="text-base font-bold font-mono text-slate-200 tabular-nums">
              {stats.gamesPlayed || 0}
            </span>
          </div>
        </div>

        {/* Achievements list */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-400 uppercase tracking-wider">Achievements</span>
            <span className="font-mono text-emerald-400 font-semibold">
              {unlockCount} / {ACHIEVEMENTS_LIST.length} Unlocked
            </span>
          </div>

          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
            {ACHIEVEMENTS_LIST.map(item => {
              const isUnlocked = unlockedSet.has(item.id);
              return (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors ${
                    isUnlocked
                      ? 'bg-slate-950/60 border-emerald-500/30 text-slate-200'
                      : 'bg-slate-950/20 border-slate-800/50 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isUnlocked ? 'bg-emerald-500/10' : 'bg-slate-800/40 text-slate-600'
                      }`}
                    >
                      {getIcon(item.iconName)}
                    </div>
                    <div className="flex flex-col">
                      <span className={`font-semibold ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                        {item.title}
                      </span>
                      <span className="text-[11px] text-slate-400 leading-snug">{item.description}</span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isUnlocked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-600" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
