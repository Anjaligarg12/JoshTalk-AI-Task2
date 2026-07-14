import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { Settings, ShieldCheck, AlertTriangle, Ban, Activity } from 'lucide-react';

export const QualityScoreEngine: React.FC = () => {
  // Local state for interactive simulator (Aligned with User Telemetry Bounds)
  const [listenRatio, setListenRatio] = useState<number>(0.85); // 35% to 98%
  const [editRate, setEditRate] = useState<number>(18.5); // 2% to 35%
  const [cps, setCps] = useState<number>(4.8); // 3 to 12 CPS
  const [suspiciousEvents, setSuspiciousEvents] = useState<number>(0); // 0 to 10 incidents

  // Weight states (representing system configurations)
  const [wListen, setWListen] = useState<number>(8);
  const [wEdit, setWEdit] = useState<number>(6);
  const [wCps, setWCps] = useState<number>(8);
  const [wSuspicious, setWSuspicious] = useState<number>(9);

  // Dynamic Quality Score Simulation (Clamped strictly 40 to 100)
  const simulateQualityScore = () => {
    let penalty = 0;

    // 1. Playback Listening Ratio Penalty (under threshold 0.80)
    if (listenRatio < 0.80) {
      const diff = 0.80 - listenRatio;
      penalty += wListen * 8 * (diff / 0.45);
    }

    // 2. Edit Rate Penalty (under threshold 12.0%)
    if (editRate < 12.0) {
      const diff = 12.0 - editRate;
      penalty += wEdit * 8 * (diff / 10.0);
    }

    // 3. Characters Per Second Penalty (bot speed limit > 5.5 CPS)
    if (cps > 5.5) {
      const diff = cps - 5.5;
      penalty += wCps * 8 * (diff / 6.5);
    }

    // 4. Repeated Suspicious Behavior Penalty (incidents > 1)
    if (suspiciousEvents > 1) {
      const diff = suspiciousEvents - 1;
      penalty += wSuspicious * 8 * (diff / 4.0);
    }

    const calculatedRisk = Math.min(60, Math.round(penalty));
    return Math.max(40, 100 - calculatedRisk); // Range bounds 40 to 100
  };

  const score = simulateQualityScore();

  // Status mapping matching Safe (>=80), Warning (60-79), Blocked (<60)
  let statusText = 'Safe';
  let statusColorClass = 'text-emerald-500';
  let statusIcon = <ShieldCheck className="w-5 h-5 text-emerald-500" />;
  let strokeColor = '#10b981'; // emerald-500

  if (score < 60) {
    statusText = 'Blocked';
    statusColorClass = 'text-red-500';
    statusIcon = <Ban className="w-5 h-5 text-red-500 animate-pulse" />;
    strokeColor = '#ef4444'; // red-500
  } else if (score < 80) {
    statusText = 'Warning';
    statusColorClass = 'text-amber-500';
    statusIcon = <AlertTriangle className="w-5 h-5 text-amber-500" />;
    strokeColor = '#f59e0b'; // amber-500
  }

  // Circular gauge config
  const radius = 80;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gradient">Quality Score Engine</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs md:text-sm mt-1">
          Calibrate rule weights, simulate metric violations, and audit the mathematical scoring network.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Mathematical Formula & Weight Explanations */}
        <div className="lg:col-span-7 space-y-6">
          {/* Formula Card */}
          <GlassCard hoverEffect={false} className="p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center">
              <Activity className="w-4 h-4 text-indigo-500 mr-2" /> Mathematical Scoring Formula
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
              The quality score is evaluated continuously using multi-dimensional telemetry feeds. The scoring system starts with a base score of <strong>100</strong> and subtracts weighted penalties based on deviation triggers.
            </p>

            <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/40 dark:border-zinc-800/40 rounded-xl p-5 mb-6 font-mono text-xs overflow-x-auto text-center">
              <p className="font-bold text-zinc-850 dark:text-zinc-200 text-sm mb-3">
                {"\\[ \\text{Quality Score} = \\max\\left(40, 100 - \\sum \\text{Penalty}_i\\right) \\]"}
              </p>
              <div className="text-[10px] text-zinc-400 text-left space-y-1.5 mt-4 border-t border-zinc-200/25 dark:border-zinc-800/20 pt-4">
                <p>{"• \\( \\text{Penalty}_{\\text{listening}} = w_{\\text{listen}} \\times 8 \\times \\max\\left(0, \\frac{0.80 - \\text{Ratio}}{0.45}\\right) \\)"}</p>
                <p>{"• \\( \\text{Penalty}_{\\text{edit\\_rate}} = w_{\\text{edit}} \\times 8 \\times \\max\\left(0, \\frac{12.0\\% - \\text{Edits}}{10.0\\%}\\right) \\)"}</p>
                <p>{"• \\( \\text{Penalty}_{\\text{typing\\_speed}} = w_{\\text{cps}} \\times 8 \\times \\max\\left(0, \\frac{\\text{CPS} - 5.5}{6.5}\\right) \\)"}</p>
                <p>{"• \\( \\text{Penalty}_{\\text{suspicious}} = w_{\\text{suspicious}} \\times 8 \\times \\max\\left(0, \\frac{\\text{Incidents} - 1}{4.0}\\right) \\)"}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Scoring Components</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 border border-zinc-200/40 dark:border-zinc-800/30 rounded-lg">
                  <strong className="text-zinc-850 dark:text-zinc-200 block mb-0.5">Listening Ratio (35% - 98%)</strong>
                  <span className="text-zinc-400 leading-relaxed block">Measures skipped sections. Triggers when playback coverage drops below 80% of total audio duration.</span>
                </div>
                <div className="p-3 border border-zinc-200/40 dark:border-zinc-800/30 rounded-lg">
                  <strong className="text-zinc-850 dark:text-zinc-200 block mb-0.5">Edit Rate (2% - 35%)</strong>
                  <span className="text-zinc-400 leading-relaxed block">Keystroke corrections. A score below 12% flags potential automated text entry or bot-assisted copy-pasting.</span>
                </div>
                <div className="p-3 border border-zinc-200/40 dark:border-zinc-800/30 rounded-lg">
                  <strong className="text-zinc-850 dark:text-zinc-200 block mb-0.5">Characters Per Second (3 - 12 CPS)</strong>
                  <span className="text-zinc-400 leading-relaxed block">Speed limit check. Typists writing faster than 5.5 CPS (equivalent to 82 WPM) will accrue progressive penalties.</span>
                </div>
                <div className="p-3 border border-zinc-200/40 dark:border-zinc-800/30 rounded-lg">
                  <strong className="text-zinc-850 dark:text-zinc-200 block mb-0.5">Suspicious Behaviors</strong>
                  <span className="text-zinc-400 leading-relaxed block">Audit of focus logs. Switched windows or clipboard pasting events trigger progressive score reductions.</span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Threshold Visualizer */}
          <GlassCard hoverEffect={false} className="p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-5">
              Score Classification Thresholds
            </h3>
            <div className="space-y-4">
              {/* Colored scale bar (representing 40-100 range) */}
              <div className="h-4 w-full rounded-full flex overflow-hidden border border-zinc-200/30 dark:border-zinc-800/20">
                <div className="h-full bg-red-500 w-[33.3%]" />
                <div className="h-full bg-amber-500 w-[33.3%]" />
                <div className="h-full bg-emerald-500 w-[33.3%]" />
              </div>
              
              <div className="grid grid-cols-3 text-xs pt-1 border-t border-zinc-200/20 dark:border-zinc-800/10">
                <div className="text-left">
                  <span className="text-red-500 font-bold block">Blocked Range</span>
                  <span className="text-zinc-400 mt-0.5 block">40% – 59% Score</span>
                </div>
                <div className="text-center">
                  <span className="text-amber-500 font-bold block">Warning Range</span>
                  <span className="text-zinc-400 mt-0.5 block">60% – 79% Score</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-500 font-bold block">Safe Range</span>
                  <span className="text-zinc-400 mt-0.5 block">80% – 100% Score</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Score Simulator Gauge */}
        <div className="lg:col-span-5 space-y-6">
          <GlassCard hoverEffect={false} className="p-6 flex flex-col items-center">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-6 self-start flex items-center">
              <Settings className="w-4 h-4 text-indigo-500 mr-2" /> Live Simulator Gauge
            </h3>

            {/* Circular Gauge */}
            <div className="relative w-48 h-48 mb-6">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="96"
                  cy="96"
                  r={radius}
                  className="stroke-zinc-200 dark:stroke-zinc-850"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                {/* Score progress circle */}
                <circle
                  cx="96"
                  cy="96"
                  r={radius}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-300 ease-out"
                />
              </svg>
              {/* Score text inside */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-extrabold tracking-tight">{score}%</span>
                <div className="flex items-center space-x-1 mt-1">
                  {statusIcon}
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${statusColorClass}`}>{statusText}</span>
                </div>
              </div>
            </div>

            {/* Interactive Telemetry Sliders */}
            <div className="w-full space-y-4 border-t border-zinc-200/40 dark:border-zinc-800/20 pt-5 text-left">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Simulate Telemetry Feeds</h4>
              
              {/* Listening Ratio Slider (35% to 98%) */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Listening Ratio:</span>
                  <strong className="text-zinc-850 dark:text-zinc-100">{Math.round(listenRatio * 100)}% playback</strong>
                </div>
                <input
                  type="range"
                  min="0.35"
                  max="0.98"
                  step="0.01"
                  value={listenRatio}
                  onChange={e => setListenRatio(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Edit Rate Slider (2% to 35%) */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Edit Correction Rate:</span>
                  <strong className="text-zinc-850 dark:text-zinc-100">{editRate}% edits</strong>
                </div>
                <input
                  type="range"
                  min="2"
                  max="35"
                  step="0.5"
                  value={editRate}
                  onChange={e => setEditRate(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* CPS Speed Slider (3 to 12) */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Characters Per Second:</span>
                  <strong className="text-zinc-850 dark:text-zinc-100">{cps} CPS</strong>
                </div>
                <input
                  type="range"
                  min="3"
                  max="12"
                  step="0.1"
                  value={cps}
                  onChange={e => setCps(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Suspicious Events Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Suspicious Events (Tabs/Pastes):</span>
                  <strong className="text-zinc-850 dark:text-zinc-100">{suspiciousEvents} events</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={suspiciousEvents}
                  onChange={e => setSuspiciousEvents(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>

            {/* Weights Adjuster Panel */}
            <div className="w-full space-y-4 border-t border-zinc-200/40 dark:border-zinc-800/20 pt-5 text-left mt-5">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Adjust Rule Weights</h4>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-[9px] font-semibold text-zinc-400 uppercase">Listening Weight: {wListen}</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={wListen}
                    onChange={e => setWListen(Number(e.target.value))}
                    className="w-full h-1 accent-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-semibold text-zinc-400 uppercase">Edit Rate Weight: {wEdit}</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={wEdit}
                    onChange={e => setWEdit(Number(e.target.value))}
                    className="w-full h-1 accent-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-semibold text-zinc-400 uppercase">Speed Limit Weight: {wCps}</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={wCps}
                    onChange={e => setWCps(Number(e.target.value))}
                    className="w-full h-1 accent-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-semibold text-zinc-400 uppercase">Suspicious Weight: {wSuspicious}</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={wSuspicious}
                    onChange={e => setWSuspicious(Number(e.target.value))}
                    className="w-full h-1 accent-indigo-500"
                  />
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
