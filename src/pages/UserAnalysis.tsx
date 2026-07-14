import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { GlassCard } from '../components/GlassCard';
import { QualityBadge } from '../components/QualityBadge';
import {
  Search,
  SlidersHorizontal,
  Keyboard,
  Volume2,
  ShieldCheck,
  Ban,
  AlertTriangle,
  FileText,
  Download,
  X,
  Clock,
  History,
  FileSpreadsheet
} from 'lucide-react';

interface UserAnalysisProps {
  selectedUserId: string | null;
  setSelectedUserId: (id: string | null) => void;
}

export const UserAnalysis: React.FC<UserAnalysisProps> = ({
  selectedUserId,
  setSelectedUserId
}) => {
  const { contributors, flagContributor } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('score-desc');
  
  // Advanced range filters
  const [minQualityScore, setMinQualityScore] = useState<number>(0);
  const [maxCps, setMaxCps] = useState<number>(20);
  
  // Drawer visibility state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, minQualityScore, maxCps, sortBy]);

  // Selected User Object
  const selectedUser = contributors.find(c => c.id === selectedUserId) || null;

  // Filter & Sort logic
  const filteredContributors = contributors
    .filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchesQuality = c.qualityScore >= minQualityScore;
      const matchesCps = c.metrics.charactersPerSecond <= maxCps;
      return matchesSearch && matchesStatus && matchesQuality && matchesCps;
    })
    .sort((a, b) => {
      if (sortBy === 'score-desc') return b.qualityScore - a.qualityScore;
      if (sortBy === 'score-asc') return a.qualityScore - b.qualityScore;
      if (sortBy === 'accuracy-desc') return b.accuracy - a.accuracy;
      if (sortBy === 'speed-desc') return b.metrics.typingSpeed - a.metrics.typingSpeed;
      return 0;
    });

  // Client-side CSV Exporter
  const handleExportCSV = () => {
    const headers = [
      'User ID', 'Name', 'Status', 'Quality Score (%)', 'Audited Accuracy (%)', 
      'Completed Tasks', 'Previous Warnings',
      'Typing Speed (WPM)', 'Characters Per Second (CPS)', 'Edit Rate (%)', 
      'Listening Ratio (%)', 'Tab Switches', 'Clipboard Pastes', 'Silence Skips', 
      'Total Working Time (min)', 'Joined Date'
    ];

    const rows = filteredContributors.map(c => [
      c.id,
      `"${c.name.replace(/"/g, '""')}"`,
      c.status,
      c.qualityScore,
      c.accuracy,
      c.completedTasks,
      c.previousWarnings,
      c.metrics.typingSpeed,
      c.metrics.charactersPerSecond,
      c.metrics.editRate,
      Math.round(c.metrics.listeningRatio * 100),
      c.metrics.tabSwitches,
      c.metrics.copyPasteCount,
      c.metrics.silenceSkips,
      c.metrics.totalWorkingTime,
      c.joinedDate
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `joshtalks_ai_transcribers_${dateRangeString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const dateRangeString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleRowClick = (userId: string) => {
    setSelectedUserId(userId);
    setIsDrawerOpen(true);
  };

  const handleAction = (userId: string, actionType: 'approve' | 'warning' | 'review' | 'suspend' | 'block') => {
    if (actionType === 'approve') {
      flagContributor(userId, 'safe');
    } else if (actionType === 'warning') {
      flagContributor(userId, 'warning');
    } else if (actionType === 'review') {
      flagContributor(userId, 'warning'); // manual review tags them as warning
    } else if (actionType === 'suspend') {
      flagContributor(userId, 'blocked');
    } else if (actionType === 'block') {
      flagContributor(userId, 'blocked');
    }
  };

  // Helper to resolve risk level color and text
  const getRiskLevel = (score: number) => {
    if (score >= 80) return { label: 'Low Risk', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
    if (score >= 60) return { label: 'Medium Risk', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
    if (score >= 40) return { label: 'High Risk', color: 'text-red-500 bg-red-500/10 border-red-500/20' };
    return { label: 'Critical Risk', color: 'text-rose-600 bg-rose-500/10 border-rose-500/20 animate-pulse' };
  };

  // Helper to resolve dynamic suggested action
  const getSuggestedAction = (score: number) => {
    if (score >= 80) return 'Approve Account';
    if (score >= 70) return 'Send Warning';
    if (score >= 60) return 'Flag for Manual Review';
    if (score >= 50) return 'Temporary Suspend';
    return 'Block Account';
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/50 dark:border-zinc-800/40 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gradient">Transcriber Ledger</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs md:text-sm mt-1">
            Perform detailed searches, apply multi-metric filters, and export behavioral telemetry records.
          </p>
        </div>

        {/* Export CSV button */}
        <button
          onClick={handleExportCSV}
          className="self-start sm:self-auto inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-900/60 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 text-zinc-800 dark:text-zinc-200 text-xs font-bold border border-zinc-200/40 dark:border-zinc-800/40 shadow-sm transition"
        >
          <Download className="w-4 h-4 text-indigo-500" />
          <span>Export CSV ledger</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Columns: Filter Controls Panel */}
        <div className="lg:col-span-4 space-y-4">
          <GlassCard hoverEffect={false} className="p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-200/20 dark:border-zinc-800/10 pb-2 flex items-center justify-between">
              <span>Filter Controls</span>
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </h3>

            {/* Text Search */}
            <div className="flex flex-col space-y-1">
              <label className="text-[9px] font-bold text-zinc-400 uppercase">Search User</label>
              <div className="flex items-center space-x-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/40 rounded-lg px-3 py-2 text-xs">
                <Search className="w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Filter name or ID..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-zinc-950 dark:text-zinc-50"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex flex-col space-y-1">
              <label className="text-[9px] font-bold text-zinc-400 uppercase">Status Category</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/40 rounded-lg px-2.5 py-2 text-xs outline-none text-zinc-800 dark:text-zinc-200 focus:border-indigo-500"
              >
                <option value="all">All Categories</option>
                <option value="safe">Safe (Green)</option>
                <option value="warning">Warning (Orange)</option>
                <option value="blocked">Blocked (Red)</option>
              </select>
            </div>

            {/* Quality Score Threshold Slider */}
            <div className="flex flex-col space-y-1">
              <div className="flex justify-between text-[9px] font-bold text-zinc-400 uppercase">
                <span>Min Quality Score</span>
                <strong className="text-indigo-500">{minQualityScore}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={minQualityScore}
                onChange={e => setMinQualityScore(Number(e.target.value))}
                className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* CPS Speed Limit Slider */}
            <div className="flex flex-col space-y-1">
              <div className="flex justify-between text-[9px] font-bold text-zinc-400 uppercase">
                <span>Max Speed (CPS)</span>
                <strong className="text-indigo-500">{maxCps} CPS</strong>
              </div>
              <input
                type="range"
                min="3"
                max="20"
                step="1"
                value={maxCps}
                onChange={e => setMaxCps(Number(e.target.value))}
                className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex flex-col space-y-1">
              <label className="text-[9px] font-bold text-zinc-400 uppercase">Sorting Index</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/40 rounded-lg px-2.5 py-2 text-xs outline-none text-zinc-800 dark:text-zinc-200 focus:border-indigo-500"
              >
                <option value="score-desc">Quality Index (Highest)</option>
                <option value="score-asc">Quality Index (Lowest)</option>
                <option value="accuracy-desc">Manual Spot Accuracy</option>
                <option value="speed-desc">WPM Speed Limit</option>
              </select>
            </div>
          </GlassCard>
        </div>

        {/* Right Columns: Contributors Data Ledger Table */}
        <div className="lg:col-span-8">
          <GlassCard hoverEffect={false} className="p-0 overflow-hidden">
            <div className="p-4 border-b border-zinc-200/40 dark:border-zinc-800/20 flex justify-between items-center bg-zinc-50/30 dark:bg-zinc-900/10">
              <span className="text-xs font-semibold text-zinc-400">Ledger Records ({filteredContributors.length} found)</span>
            </div>
            
            <div className="max-h-[520px] overflow-y-auto pr-px">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-zinc-400 border-b border-zinc-200/40 dark:border-zinc-800/20 bg-zinc-50/10 dark:bg-zinc-900/5 select-none">
                    <th className="py-2.5 px-4 font-semibold">User</th>
                    <th className="py-2.5 px-2 font-semibold text-center">Listening</th>
                    <th className="py-2.5 px-2 font-semibold text-center">Edit Rate</th>
                    <th className="py-2.5 px-2 font-semibold text-center">CPS</th>
                    <th className="py-2.5 px-2 font-semibold text-center">Quality Score</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/40 dark:divide-zinc-800/10">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-20">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <div className="w-8 h-8 rounded-full border-4 border-zinc-200 dark:border-zinc-800 border-t-indigo-500 animate-spin" />
                          <span className="text-zinc-400 dark:text-zinc-500 font-bold text-xs select-none">Crunching telemetry data...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredContributors.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16">
                        <div className="flex flex-col items-center justify-center text-center p-6 space-y-4">
                          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/40 flex items-center justify-center text-zinc-400 dark:text-zinc-500 shadow-sm animate-pulse">
                            <Search className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">No matching transcribers found</h4>
                            <p className="text-[11px] text-zinc-450 dark:text-zinc-500 max-w-xs leading-relaxed">
                              We couldn't find any transcribers matching your active filters or text queries. Adjust the sliders to widen the search.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSearchTerm('');
                              setStatusFilter('all');
                              setMinQualityScore(0);
                              setMaxCps(20);
                              setSortBy('score-desc');
                            }}
                            className="inline-flex items-center px-4 py-2 text-xs font-bold bg-indigo-500 hover:bg-indigo-650 text-white rounded-xl shadow-sm transition"
                          >
                            Reset Active Filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredContributors.map(c => (
                      <tr
                        key={c.id}
                        onClick={() => handleRowClick(c.id)}
                        className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/20 cursor-pointer transition"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-7 h-7 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-[10px] text-zinc-500">
                              {c.avatar}
                            </div>
                            <div>
                              <span className="block font-bold text-zinc-900 dark:text-zinc-100">{c.name}</span>
                              <span className="block text-[9px] text-zinc-400">ID: {c.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center font-semibold">
                          <span className={c.metrics.listeningRatio < 0.5 ? 'text-red-500' : c.metrics.listeningRatio < 0.8 ? 'text-amber-500' : 'text-emerald-500'}>
                            {Math.round(c.metrics.listeningRatio * 100)}%
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center font-semibold text-zinc-700 dark:text-zinc-300">
                          {c.metrics.editRate}%
                        </td>
                        <td className="py-3 px-2 text-center font-semibold text-zinc-700 dark:text-zinc-300">
                          {c.metrics.charactersPerSecond} CPS
                        </td>
                        <td className="py-3 px-2 text-center font-extrabold">
                          <span className={c.qualityScore < 60 ? 'text-red-500' : c.qualityScore < 80 ? 'text-amber-500' : 'text-emerald-500'}>
                            {c.qualityScore}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <QualityBadge status={c.status} type="status" />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Slide-out details drawer (with Outfit premium font and smooth CSS slide layout) */}
      {isDrawerOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex justify-end bg-zinc-950/45 dark:bg-black/60 backdrop-blur-xs">
          {/* Backdrop Click */}
          <div className="flex-1 animate-fade-in" onClick={() => setIsDrawerOpen(false)} />
          
          <div className="w-full max-w-lg bg-white dark:bg-zinc-950 h-full border-l border-zinc-200/50 dark:border-zinc-800/40 p-6 flex flex-col justify-between shadow-2xl animate-slide-up overflow-y-auto">
            {/* Header profile section */}
            <div>
              <div className="flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/40 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow shadow-indigo-500/20">
                    {selectedUser.avatar}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-zinc-950 dark:text-zinc-50">{selectedUser.name}</h3>
                    <span className="text-[10px] text-zinc-400 block font-mono">User ID: {selectedUser.id}</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-850 transition"
                >
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>

              {/* Core Index Indicators Grid */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                {/* Completed Tasks */}
                <div className="bg-zinc-50/50 dark:bg-zinc-900/35 border border-zinc-200/35 dark:border-zinc-800/40 rounded-xl p-3.5 text-left">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-400 flex items-center">
                    <FileSpreadsheet className="w-3 h-3 text-indigo-500 mr-1" /> Tasks Completed
                  </span>
                  <h4 className="text-sm font-extrabold mt-1 text-zinc-850 dark:text-zinc-200">
                    {selectedUser.completedTasks} tasks
                  </h4>
                </div>

                {/* Quality Score */}
                <div className="bg-zinc-50/50 dark:bg-zinc-900/35 border border-zinc-200/35 dark:border-zinc-800/40 rounded-xl p-3.5 text-left">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-400">Quality Score</span>
                  <h4 className={`text-sm font-extrabold mt-1 ${
                    selectedUser.qualityScore < 60 ? 'text-red-500' : selectedUser.qualityScore < 80 ? 'text-amber-500' : 'text-emerald-500'
                  }`}>
                    {selectedUser.qualityScore}%
                  </h4>
                </div>

                {/* Risk Level */}
                <div className="bg-zinc-50/50 dark:bg-zinc-900/35 border border-zinc-200/35 dark:border-zinc-800/40 rounded-xl p-3.5 text-left">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-400">Risk Level</span>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold mt-1.5 border ${
                    getRiskLevel(selectedUser.qualityScore).color
                  }`}>
                    {getRiskLevel(selectedUser.qualityScore).label}
                  </span>
                </div>
              </div>

              {/* Telemetry Biometrics panel */}
              <div className="mt-6">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center">
                  <SlidersHorizontal className="w-3.5 h-3.5 mr-1 text-indigo-500" /> Behavioral Telemetry
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {/* Listening Ratio */}
                  <div className="bg-zinc-50/20 dark:bg-zinc-900/10 border border-zinc-200/35 dark:border-zinc-800/30 rounded-lg p-2.5 text-left">
                    <Volume2 className="w-3.5 h-3.5 text-indigo-500 mb-1.5" />
                    <span className="block text-[8px] text-zinc-400 uppercase tracking-wider">Listening Ratio</span>
                    <strong className="text-xs mt-0.5 block">{Math.round(selectedUser.metrics.listeningRatio * 100)}%</strong>
                  </div>
                  {/* Edit Rate */}
                  <div className="bg-zinc-50/20 dark:bg-zinc-900/10 border border-zinc-200/35 dark:border-zinc-800/30 rounded-lg p-2.5 text-left">
                    <Keyboard className="w-3.5 h-3.5 text-indigo-500 mb-1.5" />
                    <span className="block text-[8px] text-zinc-400 uppercase tracking-wider">Edit Rate</span>
                    <strong className="text-xs mt-0.5 block">{selectedUser.metrics.editRate}%</strong>
                  </div>
                  {/* CPS */}
                  <div className="bg-zinc-50/20 dark:bg-zinc-900/10 border border-zinc-200/35 dark:border-zinc-800/30 rounded-lg p-2.5 text-left">
                    <FileText className="w-3.5 h-3.5 text-indigo-500 mb-1.5" />
                    <span className="block text-[8px] text-zinc-400 uppercase tracking-wider">Characters/Sec</span>
                    <strong className="text-xs mt-0.5 block">{selectedUser.metrics.charactersPerSecond} CPS</strong>
                  </div>
                </div>
              </div>

              {/* History & Warnings metadata */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="p-3 border border-zinc-200/35 dark:border-zinc-800/35 rounded-xl bg-zinc-50/10 text-left">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-500">Historical Warnings</span>
                  <div className="flex items-center space-x-1.5 mt-1">
                    <AlertTriangle className={`w-4 h-4 ${selectedUser.previousWarnings > 0 ? 'text-amber-500' : 'text-zinc-400'}`} />
                    <strong className="text-sm font-extrabold text-zinc-850 dark:text-zinc-200">{selectedUser.previousWarnings} warnings</strong>
                  </div>
                </div>

                <div className="p-3 border border-zinc-200/35 dark:border-zinc-800/35 rounded-xl bg-zinc-50/10 text-left">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-500">Suggested Action</span>
                  <div className="flex items-center space-x-1.5 mt-1">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <strong className="text-xs font-bold text-indigo-500">{getSuggestedAction(selectedUser.qualityScore)}</strong>
                  </div>
                </div>
              </div>

              {/* Log Timeline block */}
              <div className="mt-6 text-left">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center">
                  <History className="w-3.5 h-3.5 mr-1 text-indigo-500" /> Activity Timeline
                </h4>
                <div className="space-y-3.5 pl-3 border-l border-zinc-200 dark:border-zinc-800 ml-1 text-[10px]">
                  {selectedUser.timeline.map((t, idx) => (
                    <div key={idx} className="relative">
                      <span className="absolute -left-[16.5px] top-1.5 w-1.5 h-1.5 rounded-full bg-zinc-350 dark:bg-zinc-700 border border-white dark:border-zinc-950" />
                      <div className="flex justify-between text-zinc-400 text-[9px] font-semibold mb-0.5">
                        <span>{t.event}</span>
                        <span>{t.time}</span>
                      </div>
                      <span className="text-zinc-500 dark:text-zinc-400">{t.details}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Workflow Action Panel: 5 Buttons (Approve, Warning, Manual Review, Suspend, Block) */}
            <div className="border-t border-zinc-200/50 dark:border-zinc-800/40 pt-4 mt-6">
              <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-400 block mb-2 text-left">Intervention Protocols</span>
              <div className="grid grid-cols-5 gap-2">
                {/* 1. Approve */}
                <button
                  onClick={() => handleAction(selectedUser.id, 'approve')}
                  disabled={selectedUser.status === 'safe'}
                  className="inline-flex flex-col items-center justify-center py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold transition disabled:opacity-40 disabled:hover:bg-emerald-500/10"
                  title="Mark transcriber profile safe"
                >
                  <ShieldCheck className="w-4 h-4 mb-1" />
                  <span className="text-[9px]">Approve</span>
                </button>

                {/* 2. Warning */}
                <button
                  onClick={() => handleAction(selectedUser.id, 'warning')}
                  disabled={selectedUser.status === 'warning'}
                  className="inline-flex flex-col items-center justify-center py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-bold transition disabled:opacity-40 disabled:hover:bg-amber-500/10"
                  title="Issue warning alert"
                >
                  <AlertTriangle className="w-4 h-4 mb-1" />
                  <span className="text-[9px]">Warning</span>
                </button>

                {/* 3. Manual Review */}
                <button
                  onClick={() => handleAction(selectedUser.id, 'review')}
                  className="inline-flex flex-col items-center justify-center py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold transition"
                  title="Schedule manual spot checks"
                >
                  <FileText className="w-4 h-4 mb-1" />
                  <span className="text-[9px] truncate w-full px-1">Review</span>
                </button>

                {/* 4. Suspend */}
                <button
                  onClick={() => handleAction(selectedUser.id, 'suspend')}
                  className="inline-flex flex-col items-center justify-center py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-650 dark:text-red-400 font-bold transition"
                  title="Temporarily restrict workspace"
                >
                  <Clock className="w-4 h-4 mb-1" />
                  <span className="text-[9px]">Suspend</span>
                </button>

                {/* 5. Block */}
                <button
                  onClick={() => handleAction(selectedUser.id, 'block')}
                  disabled={selectedUser.status === 'blocked'}
                  className="inline-flex flex-col items-center justify-center py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition disabled:bg-zinc-800 disabled:text-zinc-550"
                  title="Permanently block account"
                >
                  <Ban className="w-4 h-4 mb-1" />
                  <span className="text-[9px]">Block</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
