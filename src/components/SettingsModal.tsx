import React from 'react';
import { X, Volume2, VolumeX, Eye, Zap, Shield, Palette } from 'lucide-react';
import { GameSettings, GameTheme, SnakeSkin, SpeedSetting } from '../types/game';
import { THEMES } from '../utils/theme';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const speedOptions: { id: SpeedSetting; label: string; desc: string }[] = [
    { id: 'slow', label: 'Relaxed', desc: 'Chill pace, ideal for high maze strategy' },
    { id: 'normal', label: 'Classic', desc: 'The authentic arcade snake tempo' },
    { id: 'fast', label: 'Hyper', desc: 'Fast twitch reflexes required' },
    { id: 'dynamic', label: 'Accelerating', desc: 'Speeds up every 5 fruits consumed' },
  ];

  const skins: { id: SnakeSkin; label: string }[] = [
    { id: 'glow', label: 'Smooth Glow' },
    { id: 'pixel', label: 'Retro Pixel' },
    { id: 'segmented', label: 'Scales' },
    { id: 'cyber', label: 'Cyber Grid' },
  ];

  const themes: { id: GameTheme; name: string }[] = (
    Object.keys(THEMES) as GameTheme[]
  ).map(key => ({
    id: key,
    name: THEMES[key].name,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold font-display text-white">Arcade Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Speed presets */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Game Speed</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {speedOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => onUpdateSettings({ speed: opt.id })}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  settings.speed === opt.id
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-semibold text-white">{opt.label}</div>
                <div className="text-[11px] text-slate-400 leading-tight mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Theme selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
            <Palette className="w-4 h-4 text-purple-400" />
            <span>Visual Theme</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {themes.map(t => {
              const th = THEMES[t.id];
              return (
                <button
                  key={t.id}
                  onClick={() => onUpdateSettings({ theme: t.id })}
                  className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 ${
                    settings.theme === t.id
                      ? 'border-emerald-500 bg-emerald-500/10 text-white'
                      : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full shrink-0 border border-white/20"
                    style={{ background: th.playerHead }}
                  />
                  <span className="text-xs font-medium truncate">{t.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Snake Skin */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
            <Eye className="w-4 h-4 text-sky-400" />
            <span>Snake Rendering Style</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {skins.map(s => (
              <button
                key={s.id}
                onClick={() => onUpdateSettings({ skin: s.id })}
                className={`py-2 px-3 rounded-lg border text-center text-xs font-medium transition-all ${
                  settings.skin === s.id
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-semibold'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles: Wall pass, Virtual Dpad, Grid lines */}
        <div className="flex flex-col gap-3 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">Wall Wrap-Around</span>
              <span className="text-[11px] text-slate-400">Pass through screen borders without crashing</span>
            </div>
            <button
              onClick={() => onUpdateSettings({ allowWallPass: !settings.allowWallPass })}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.allowWallPass ? 'bg-emerald-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.allowWallPass ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">On-Screen Arcade D-Pad</span>
              <span className="text-[11px] text-slate-400">Show directional touch controls for mobile or tablet</span>
            </div>
            <button
              onClick={() => onUpdateSettings({ virtualDpad: !settings.virtualDpad })}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.virtualDpad ? 'bg-emerald-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.virtualDpad ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">Subtle Grid Lines</span>
              <span className="text-[11px] text-slate-400">Draw background board grid matrix</span>
            </div>
            <button
              onClick={() => onUpdateSettings({ showGridLines: !settings.showGridLines })}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.showGridLines ? 'bg-emerald-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.showGridLines ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Audio Volume */}
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white flex items-center gap-1.5">
              {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              <span>Sound Effects</span>
            </span>
            <span className="font-mono text-slate-400">{Math.round(settings.volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.volume}
            onChange={e => onUpdateSettings({ volume: parseFloat(e.target.value) })}
            className="w-full accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer h-1.5"
          />
        </div>

        {/* Done button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors mt-2"
        >
          Save & Return to Game
        </button>
      </div>
    </div>
  );
};
