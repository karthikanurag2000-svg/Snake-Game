import React from 'react';
import { X, Gamepad2, Sparkles, Snowflake, Shield, Magnet, Scissors, Compass, Swords, Timer } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold font-display text-white">How to Play & Field Guide</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Controls</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="font-semibold text-white block mb-1">Keyboard Navigation</span>
              <span className="text-slate-400">Use <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-200 font-mono">W A S D</kbd> or <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-200 font-mono">Arrow Keys</kbd></span>
            </div>
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="font-semibold text-white block mb-1">Touch / Gestures</span>
              <span className="text-slate-400">Swipe on board or use the on-screen virtual D-pad</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 px-1">
            Shortcuts: <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">Space</kbd> Pause/Resume · <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">R</kbd> Quick Restart
          </div>
        </div>

        {/* Special Fruits & Power-ups */}
        <div className="flex flex-col gap-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fruits & Power-ups</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-950/40 border border-slate-800/80 rounded-xl flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-md bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                🍎
              </div>
              <div>
                <span className="font-semibold text-rose-300 block">Red Apple</span>
                <span className="text-[11px] text-slate-400">+10 pts, grows snake length by 1.</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-950/40 border border-slate-800/80 rounded-xl flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-semibold text-amber-300 block">Golden Apple</span>
                <span className="text-[11px] text-slate-400">+50 pts & builds combo streak multiplier.</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-950/40 border border-slate-800/80 rounded-xl flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-md bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                <Snowflake className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-semibold text-sky-300 block">Frost Berry</span>
                <span className="text-[11px] text-slate-400">Slows down snake speed for 6 seconds.</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-950/40 border border-slate-800/80 rounded-xl flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-md bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-semibold text-purple-300 block">Ghost Pepper</span>
                <span className="text-[11px] text-slate-400">Phase through your own tail safely for 6s.</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-950/40 border border-slate-800/80 rounded-xl flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-md bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                <Magnet className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-semibold text-pink-300 block">Magnet Berry</span>
                <span className="text-[11px] text-slate-400">Attracts nearby fruits toward your head for 8s.</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-950/40 border border-slate-800/80 rounded-xl flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-md bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                <Scissors className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-semibold text-orange-300 block">Scissors Trim</span>
                <span className="text-[11px] text-slate-400">Trims 25% of your tail if cramped!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Game Modes breakdown */}
        <div className="flex flex-col gap-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Game Modes</div>
          <div className="grid grid-cols-1 gap-1.5 text-xs">
            <div className="p-2 bg-slate-950/40 border border-slate-800/80 rounded-lg flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div><strong className="text-white">Classic:</strong> Traditional snake. Clean arena, pure skill.</div>
            </div>
            <div className="p-2 bg-slate-950/40 border border-slate-800/80 rounded-lg flex items-center gap-2">
              <Compass className="w-4 h-4 text-sky-400 shrink-0" />
              <div><strong className="text-white">Mazes & Portals:</strong> Obstacle barriers and wormholes that warp your position.</div>
            </div>
            <div className="p-2 bg-slate-950/40 border border-slate-800/80 rounded-lg flex items-center gap-2">
              <Timer className="w-4 h-4 text-amber-400 shrink-0" />
              <div><strong className="text-white">Time Attack:</strong> 90s countdown timer; eating fruits adds bonus seconds.</div>
            </div>
            <div className="p-2 bg-slate-950/40 border border-slate-800/80 rounded-lg flex items-center gap-2">
              <Swords className="w-4 h-4 text-rose-400 shrink-0" />
              <div><strong className="text-white">AI Bot Battle:</strong> Compete with the AI Rival snake for food; trap the bot to eliminate it!</div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-colors text-xs"
        >
          Got It, Let's Play!
        </button>
      </div>
    </div>
  );
};
