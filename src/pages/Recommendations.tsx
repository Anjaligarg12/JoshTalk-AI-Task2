import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import type { Recommendation } from '../context/DataContext';
import { GlassCard } from '../components/GlassCard';
import { 
  ShieldCheck, 
  Ban, 
  Clock, 
  CheckCircle, 
  Eye, 
  Activity
} from 'lucide-react';

export const Recommendations: React.FC = () => {
  const { recommendations, executeRecommendation } = useData();
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved' | 'blocked'>('pending');

  const filteredRecommendations = recommendations.filter(rec => {
    if (activeFilter === 'all') return true;
    return rec.status === activeFilter;
  });

  const handleAction = (id: string, result: 'approved' | 'blocked') => {
    executeRecommendation(id, result);
  };

  const handleInspect = (userId: string) => {
    // Quick link to select user or redirect to transcribers ledger
    window.location.hash = `#user-analysis?id=${userId}`;
  };

  // Helper to color code priority badges
  const getPriorityBadge = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'critical':
        return (
          <span className="relative inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold border border-red-500/25 uppercase tracking-wider">
            <span className="flex h-1.5 w-1.5 relative mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
            </span>
            <span>Critical Priority</span>
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-bold border border-orange-500/25 uppercase tracking-wider">
            <span>High Priority</span>
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold border border-amber-500/25 uppercase tracking-wider">
            <span>Medium Priority</span>
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 text-[10px] font-bold border border-zinc-500/25 uppercase tracking-wider">
            <span>Low Priority</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/50 dark:border-zinc-800/40 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gradient">AI Recommendation Engine</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs md:text-sm mt-1">
            Real-time automated intervention recommendations powered by transcription quality biometrics.
          </p>
        </div>

        {/* Dynamic Filters bar */}
        <div className="flex items-center space-x-1.5 bg-zinc-100/55 dark:bg-zinc-900/60 p-1 border border-zinc-200/40 dark:border-zinc-800/40 rounded-xl self-start sm:self-auto">
          {(['all', 'pending', 'approved', 'blocked'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                activeFilter === filter
                  ? 'bg-white dark:bg-zinc-800 text-indigo-500 dark:text-white shadow-sm'
                  : 'text-zinc-450 hover:text-zinc-600 dark:hover:text-zinc-300'
              }`}
            >
              {filter === 'all' ? 'All Alerts' : filter}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRecommendations.length === 0 ? (
          <div className="col-span-full py-16">
            <GlassCard hoverEffect={false} className="max-w-md mx-auto p-8 border border-zinc-200/50 dark:border-zinc-800/40">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-500 shadow-sm animate-pulse">
                  <span className="text-xl font-bold">✓</span>
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">All Operations Resolved</h4>
                  <p className="text-[11px] text-zinc-450 dark:text-zinc-500 leading-relaxed">
                    Great job! There are currently no pending warnings, flags, or block recommendations matching this filter category.
                  </p>
                </div>
                {activeFilter !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setActiveFilter('all')}
                    className="inline-flex items-center px-4 py-2 text-xs font-bold bg-indigo-500 hover:bg-indigo-660 text-white rounded-xl shadow-sm transition"
                  >
                    View All Categories
                  </button>
                )}
              </div>
            </GlassCard>
          </div>
        ) : (
          filteredRecommendations.map(rec => (
            <GlassCard
              key={rec.id}
              hoverEffect={rec.status === 'pending'}
              className={`p-6 border flex flex-col justify-between space-y-5 transition-all duration-300 ${
                rec.status === 'approved' 
                  ? 'border-emerald-500/20 dark:border-emerald-500/10 bg-emerald-500/[0.01]' 
                  : rec.status === 'blocked' 
                    ? 'border-red-500/20 dark:border-red-500/10 bg-red-500/[0.01]' 
                    : 'border-zinc-200/40 dark:border-zinc-800/40'
              }`}
            >
              {/* Header: User Profile details & Priority Badge */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-50">{rec.contributorName}</h3>
                    <span className="text-[10px] text-zinc-400 font-mono">ID: {rec.contributorId}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 mt-1 text-[10px] text-zinc-400 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Flagged {rec.timestamp}</span>
                  </div>
                </div>
                {getPriorityBadge(rec.priority)}
              </div>

              {/* Grid of Telemetry Parameters */}
              <div className="grid grid-cols-4 gap-3 bg-zinc-50/40 dark:bg-zinc-900/10 border border-zinc-200/40 dark:border-zinc-800/25 rounded-xl p-3.5 text-left">
                <div>
                  <span className="block text-[8px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">Risk Index</span>
                  <strong className={`block text-xs font-extrabold mt-0.5 ${
                    rec.riskScore > 50 ? 'text-red-500' : 'text-amber-500'
                  }`}>{rec.riskScore}%</strong>
                </div>
                <div>
                  <span className="block text-[8px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">Listening</span>
                  <strong className="block text-xs font-extrabold mt-0.5 text-zinc-800 dark:text-zinc-200">
                    {Math.round(rec.listeningRatio * 100)}%
                  </strong>
                </div>
                <div>
                  <span className="block text-[8px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">Edit Rate</span>
                  <strong className="block text-xs font-extrabold mt-0.5 text-zinc-800 dark:text-zinc-200">
                    {rec.editRate}%
                  </strong>
                </div>
                <div>
                  <span className="block text-[8px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">Speed (CPS)</span>
                  <strong className="block text-xs font-extrabold mt-0.5 text-zinc-800 dark:text-zinc-200">
                    {rec.charactersPerSecond} CPS
                  </strong>
                </div>
              </div>

              {/* Behavior Logs Reason Card */}
              <div className="space-y-1.5 text-left">
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block">Detection Reason</span>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed border-l-2 border-indigo-500/40 pl-3">
                  {rec.detectionReason}
                </p>
              </div>

              {/* Recommendation Flag & Proposed action pill */}
              <div className="flex items-center justify-between border-t border-zinc-200/40 dark:border-zinc-800/10 pt-4 mt-1">
                <div>
                  <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-500 block">Suggested Action</span>
                  <span className="inline-flex items-center text-xs font-bold text-indigo-500 mt-0.5">
                    <Activity className="w-3.5 h-3.5 mr-1" />
                    {rec.action}
                  </span>
                </div>

                {/* Workflow Intervention Buttons */}
                <div className="flex items-center space-x-2">
                  {rec.status === 'pending' ? (
                    <>
                      {/* Reject/Snooze */}
                      <button
                        onClick={() => handleAction(rec.id, 'approved')}
                        className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-semibold border border-zinc-200/40 dark:border-zinc-800/40 shadow-sm transition"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Approve Action</span>
                      </button>
                      {/* Execute Block directly */}
                      <button
                        onClick={() => handleAction(rec.id, 'blocked')}
                        className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold border border-red-500/20 shadow-sm transition"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Block Contributor</span>
                      </button>
                    </>
                  ) : (
                    <span className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold border ${
                      rec.status === 'approved' 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                    }`}>
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                      <span>{rec.status === 'approved' ? 'Action Approved' : 'Contributor Blocked'}</span>
                    </span>
                  )}
                  
                  {/* Inspect user */}
                  <button
                    onClick={() => handleInspect(rec.contributorId)}
                    title="Audit targets ledger"
                    className="p-2 rounded-lg border border-zinc-200/40 dark:border-zinc-800/40 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};
