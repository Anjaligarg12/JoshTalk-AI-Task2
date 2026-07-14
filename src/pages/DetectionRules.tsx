import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import type { DetectionRule } from '../context/DataContext';
import { GlassCard } from '../components/GlassCard';
import {
  Keyboard,
  Volume2,
  Info,
  Plus,
  AlertTriangle,
  Sliders,
  Play
} from 'lucide-react';

export const DetectionRules: React.FC = () => {
  const { rules, toggleRule, updateRuleThreshold, updateRuleWeight, addCustomRule, contributors } = useData();
  const [activeTab, setActiveTab] = useState<'all' | 'typing' | 'audio' | 'focus'>('all');
  
  // Custom rule creation state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleDesc, setNewRuleDesc] = useState('');
  const [newRuleCategory, setNewRuleCategory] = useState<DetectionRule['category']>('typing');
  const [newRuleThreshold, setNewRuleThreshold] = useState(50);
  const [newRuleUnit, setNewRuleUnit] = useState('units');
  const [newRuleWeight, setNewRuleWeight] = useState(5);

  // Filter rules based on category tab
  const filteredRules = rules.filter(rule => {
    if (activeTab === 'all') return true;
    return rule.category === activeTab;
  });

  // Helper to count contributors violating a rule
  const getViolatorsCount = (rule: DetectionRule) => {
    if (!rule.isEnabled) return 0;
    return contributors.filter(c => {
      if (rule.id === 'rule-listening-ratio') return (c.metrics.listeningRatio * 100) < rule.threshold;
      if (rule.id === 'rule-edit-rate') return c.metrics.editRate < rule.threshold;
      if (rule.id === 'rule-cps-limit') return c.metrics.charactersPerSecond > rule.threshold;
      if (rule.id === 'rule-repeated-suspicious') {
        const incidents = c.previousWarnings + (c.metrics.copyPasteCount > 0 ? 1 : 0);
        return incidents > rule.threshold;
      }
      
      // Fallback for custom rules
      if (rule.category === 'typing') return c.metrics.charactersPerSecond > rule.threshold;
      if (rule.category === 'audio') return (c.metrics.listeningRatio * 100) < rule.threshold;
      if (rule.category === 'focus') return c.metrics.tabSwitches > rule.threshold;
      
      return false;
    }).length;
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName || !newRuleDesc) return;

    addCustomRule({
      name: newRuleName,
      description: newRuleDesc,
      category: newRuleCategory,
      threshold: newRuleThreshold,
      minThreshold: 0,
      maxThreshold: newRuleThreshold * 3 || 100,
      unit: newRuleUnit,
      weight: newRuleWeight,
      explanation: 'Custom defined heuristic trigger condition.',
      recommendedAction: 'Flag for manual review spot check.',
      severity: 'medium'
    });

    // Reset Form
    setNewRuleName('');
    setNewRuleDesc('');
    setNewRuleCategory('typing');
    setNewRuleThreshold(50);
    setNewRuleUnit('units');
    setNewRuleWeight(5);
    setShowAddModal(false);
  };

  // Helper to resolve icon based on category
  const getCategoryIcon = (category: DetectionRule['category']) => {
    switch (category) {
      case 'typing':
        return <Keyboard className="w-4 h-4" />;
      case 'audio':
        return <Volume2 className="w-4 h-4" />;
      case 'focus':
        return <Sliders className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'typing':
        return 'Keyboard Dynamics';
      case 'audio':
        return 'Audio Coverage';
      case 'focus':
        return 'Focus Log Heuristic';
      default:
        return 'General Heuristics';
    }
  };

  // Severity indicator color codes
  const getSeverityBadge = (severity: DetectionRule['severity']) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="relative inline-flex items-center space-x-1 px-2.5 py-0.5 rounded bg-red-500/10 text-red-500 text-[9px] font-bold border border-red-500/25 uppercase tracking-wider">
            <span className="flex h-1.5 w-1.5 relative mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
            </span>
            <span>Critical Severity</span>
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-orange-500/10 text-orange-500 text-[9px] font-bold border border-orange-500/25 uppercase tracking-wider">
            <span>High Severity</span>
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[9px] font-bold border border-amber-500/25 uppercase tracking-wider">
            <span>Medium Severity</span>
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 text-[9px] font-bold border border-zinc-500/25 uppercase tracking-wider">
            <span>Low Severity</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/50 dark:border-zinc-800/40 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gradient">Audit Policy Rules</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs md:text-sm mt-1">
            Configure risk classification ranges, trigger values, and scoring multiplier weights.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(prev => !prev)}
          className="self-start sm:self-auto inline-flex items-center space-x-1 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-500/15 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>New Custom Heuristic</span>
        </button>
      </div>

      {/* Inline New Rule Form */}
      {showAddModal && (
        <GlassCard hoverEffect={false} className="p-6 border-indigo-500/30">
          <form onSubmit={handleAddRule} className="space-y-4">
            <h3 className="font-bold text-sm text-indigo-500">Create Custom Behavioral Rule</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col space-y-1 text-left">
                <label className="text-[10px] text-zinc-400 font-semibold uppercase">Rule Name</label>
                <input
                  type="text"
                  placeholder="e.g. Excessive Mouse Scrubbing"
                  value={newRuleName}
                  onChange={e => setNewRuleName(e.target.value)}
                  className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/40 rounded-lg p-2 text-xs outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="flex flex-col space-y-1 text-left">
                <label className="text-[10px] text-zinc-400 font-semibold uppercase">Category</label>
                <select
                  value={newRuleCategory}
                  onChange={e => setNewRuleCategory(e.target.value as DetectionRule['category'])}
                  className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/40 rounded-lg p-2 text-xs outline-none focus:border-indigo-500"
                >
                  <option value="typing">Keyboard Dynamics</option>
                  <option value="focus">Window Focus</option>
                  <option value="audio">Audio Scrubber</option>
                </select>
              </div>

              <div className="flex flex-col space-y-1 text-left">
                <label className="text-[10px] text-zinc-400 font-semibold uppercase">Trigger Unit</label>
                <input
                  type="text"
                  placeholder="e.g. mouse drags"
                  value={newRuleUnit}
                  onChange={e => setNewRuleUnit(e.target.value)}
                  className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/40 rounded-lg p-2 text-xs outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col space-y-1 text-left md:col-span-2">
                <label className="text-[10px] text-zinc-400 font-semibold uppercase">Description</label>
                <input
                  type="text"
                  placeholder="Describe what telemetry trigger is being flagged..."
                  value={newRuleDesc}
                  onChange={e => setNewRuleDesc(e.target.value)}
                  className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/40 rounded-lg p-2 text-xs outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-left">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] text-zinc-400 font-semibold uppercase">Trigger Val</label>
                  <input
                    type="number"
                    value={newRuleThreshold}
                    onChange={e => setNewRuleThreshold(Number(e.target.value))}
                    className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/40 rounded-lg p-2 text-xs outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] text-zinc-400 font-semibold uppercase">Severity Weight</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newRuleWeight}
                    onChange={e => setNewRuleWeight(Number(e.target.value))}
                    className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/40 rounded-lg p-2 text-xs outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2 justify-end">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3.5 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-500 text-white text-xs font-semibold transition hover:bg-indigo-600"
              >
                Activate Rule
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Tabs Menu */}
      <div className="flex border-b border-zinc-200/50 dark:border-zinc-800/40 pb-px overflow-x-auto whitespace-nowrap">
        {(['all', 'typing', 'audio', 'focus'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-semibold capitalize border-b-2 transition-all -mb-px mr-4 ${
              activeTab === tab
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-zinc-450 hover:text-zinc-600 dark:hover:text-zinc-300'
            }`}
          >
            {tab === 'all' ? 'All Rules' : getCategoryLabel(tab)}
          </button>
        ))}
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRules.map(rule => {
          const violatorCount = getViolatorsCount(rule);
          return (
            <GlassCard
              key={rule.id}
              hoverEffect={false}
              className={`p-6 flex flex-col justify-between transition-all duration-300 border-l-4 ${
                rule.isEnabled
                  ? 'border-l-indigo-500 bg-white/70 dark:bg-zinc-900/60'
                  : 'border-l-zinc-300 dark:border-l-zinc-800 opacity-60 bg-zinc-50/50 dark:bg-zinc-900/20'
              }`}
            >
              <div className="space-y-4">
                {/* Rule Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2 text-zinc-400">
                    <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
                      {getCategoryIcon(rule.category)}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider">
                      {getCategoryLabel(rule.category)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    {getSeverityBadge(rule.severity)}
                    {/* Toggle switch */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rule.isEnabled}
                        onChange={() => toggleRule(rule.id)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4.5 bg-zinc-200 dark:bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-500"></div>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-zinc-950 dark:text-zinc-50">{rule.name}</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1.5 leading-relaxed">
                    {rule.description}
                  </p>
                </div>

                {/* Explanation block */}
                <div className="p-3 bg-zinc-50/50 dark:bg-zinc-900/35 border border-zinc-200/30 dark:border-zinc-800/30 rounded-xl text-xs space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block">Explanation</span>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-450 leading-relaxed">
                    {rule.explanation}
                  </p>
                </div>
              </div>

              {/* Parameters panel */}
              {rule.isEnabled && (
                <div className="mt-5 space-y-4 border-t border-zinc-200/40 dark:border-zinc-800/10 pt-4 text-left">
                  {/* Parameter Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-zinc-400 font-semibold uppercase">Trigger Threshold</span>
                      <strong className="text-indigo-500">
                        {rule.threshold} {rule.unit}
                      </strong>
                    </div>
                    <input
                      type="range"
                      min={rule.minThreshold}
                      max={rule.maxThreshold}
                      step={rule.id === 'rule-listening-ratio' || rule.id === 'rule-edit-rate' ? 1 : 0.5}
                      value={rule.threshold}
                      onChange={e => updateRuleThreshold(rule.id, Number(e.target.value))}
                      className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <div className="flex justify-between text-[8px] text-zinc-500">
                      <span>Min: {rule.minThreshold} {rule.unit}</span>
                      <span>Max: {rule.maxThreshold} {rule.unit}</span>
                    </div>
                  </div>

                  {/* Weight Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-zinc-400 font-semibold uppercase">Risk Score Weight (Multiplier)</span>
                      <strong className="text-amber-500">{rule.weight} / 10</strong>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={rule.weight}
                      onChange={e => updateRuleWeight(rule.id, Number(e.target.value))}
                      className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>

                  {/* Recommended Action block */}
                  <div className="p-3 bg-indigo-500/5 border border-indigo-500/15 rounded-xl text-xs space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-500 block flex items-center">
                      <Play className="w-3 h-3 mr-1" /> Recommended Action Protocol
                    </span>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-450 leading-relaxed font-semibold">
                      {rule.recommendedAction}
                    </p>
                  </div>

                  {/* Status Violations Check */}
                  <div className="mt-3.5 flex items-center justify-between text-[10px] bg-indigo-500/[0.02] border border-indigo-500/10 rounded-lg p-2.5">
                    <div className="flex items-center space-x-1.5 text-zinc-450 dark:text-zinc-500">
                      <AlertTriangle className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Currently flagging:</span>
                    </div>
                    <span className={`font-bold ${violatorCount > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                      {violatorCount} contributors
                    </span>
                  </div>
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};
