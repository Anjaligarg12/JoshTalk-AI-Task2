import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import type { Contributor } from '../context/DataContext';
import { GlassCard } from '../components/GlassCard';
import { QualityBadge } from '../components/QualityBadge';
import {
  ShieldCheck,
  AlertTriangle,
  Ban,
  Volume2,
  Edit,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Activity,
  Keyboard
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { contributors, flagContributor } = useData();
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days'>('7days');
  const [selectedUser, setSelectedUser] = useState<Contributor | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 350);
    return () => clearTimeout(timer);
  }, [dateRange]);

  // Filter contributors based on Date Range
  const filterByDate = (c: Contributor) => {
    const todayDate = new Date();
    const diffTime = Math.abs(todayDate.getTime() - c.dateCreated.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (dateRange === 'today') return diffDays <= 1;
    if (dateRange === '7days') return diffDays <= 7;
    return diffDays <= 30; // 30 days
  };

  const filteredContributors = contributors.filter(filterByDate);

  // Stats Calculations
  const totalCount = filteredContributors.length;
  const safeCount = filteredContributors.filter(c => c.status === 'safe').length;
  const warningCount = filteredContributors.filter(c => c.status === 'warning').length;
  const blockedCount = filteredContributors.filter(c => c.status === 'blocked').length;

  const avgListeningRatio = Math.round(
    (filteredContributors.reduce((acc, c) => acc + c.metrics.listeningRatio, 0) / (totalCount || 1)) * 100
  );
  
  const avgEditRate = Math.round(
    (filteredContributors.reduce((acc, c) => acc + c.metrics.editRate, 0) / (totalCount || 1)) * 10
  ) / 10;

  const avgQualityScore = Math.round(
    filteredContributors.reduce((acc, c) => acc + c.qualityScore, 0) / (totalCount || 1)
  );

  const avgCps = Math.round(
    (filteredContributors.reduce((acc, c) => acc + c.metrics.charactersPerSecond, 0) / (totalCount || 1)) * 10
  ) / 10;

  // Mock Trends data mapping to date range
  const trends = {
    today: { total: '+3%', safe: '+2%', warn: '-5%', block: '0%', listening: '+1%', edit: '-0.2%', quality: '+0.5%', cps: '+0.1%' },
    '7days': { total: '+12%', safe: '+15%', warn: '-8%', block: '+10%', listening: '+2.4%', edit: '+0.8%', quality: '+1.2%', cps: '+0.4%' },
    '30days': { total: '+24%', safe: '+28%', warn: '+14%', block: '+8%', listening: '+5.1%', edit: '-1.4%', quality: '+3.2%', cps: '+0.9%' }
  }[dateRange];

  // 1. Listening Ratio Distribution Chart
  const listeningDist = [
    { name: '<30% Skip', count: 0, color: '#ef4444' },
    { name: '30%-70%', count: 0, color: '#f59e0b' },
    { name: '>70% Normal', count: 0, color: '#10b981' }
  ];
  filteredContributors.forEach(c => {
    if (c.metrics.listeningRatio < 0.3) listeningDist[0].count++;
    else if (c.metrics.listeningRatio < 0.7) listeningDist[1].count++;
    else listeningDist[2].count++;
  });

  // 2. Edit Rate Distribution Chart
  const editRateDist = [
    { name: '<2% PasteBot', count: 0, color: '#ef4444' },
    { name: '2%-6% Normal', count: 0, color: '#10b981' },
    { name: '>6% Heavy edits', count: 0, color: '#6366f1' }
  ];
  filteredContributors.forEach(c => {
    if (c.metrics.editRate < 2.0) editRateDist[0].count++;
    else if (c.metrics.editRate < 6.0) editRateDist[1].count++;
    else editRateDist[2].count++;
  });

  // 3. Quality Score Distribution Chart
  const qualityDist = [
    { name: '<40 Critical', count: 0, color: '#ef4444' },
    { name: '40-75 Warning', count: 0, color: '#f59e0b' },
    { name: '75-100 Elite', count: 0, color: '#10b981' }
  ];
  filteredContributors.forEach(c => {
    if (c.qualityScore < 40) qualityDist[0].count++;
    else if (c.qualityScore < 75) qualityDist[1].count++;
    else qualityDist[2].count++;
  });

  // 4. Warning Trend Chart
  const warningTrendData = {
    today: [
      { time: '09:00', warnings: 2 },
      { time: '11:00', warnings: 4 },
      { time: '13:00', warnings: 3 },
      { time: '15:00', warnings: 5 },
      { time: '17:00', warnings: 4 }
    ],
    '7days': [
      { time: 'Mon', warnings: 3 },
      { time: 'Tue', warnings: 5 },
      { time: 'Wed', warnings: 8 },
      { time: 'Thu', warnings: 4 },
      { time: 'Fri', warnings: 6 },
      { time: 'Sat', warnings: 5 },
      { time: 'Sun', warnings: 3 }
    ],
    '30days': [
      { time: 'Wk 1', warnings: 12 },
      { time: 'Wk 2', warnings: 18 },
      { time: 'Wk 3', warnings: 15 },
      { time: 'Wk 4', warnings: 22 }
    ]
  }[dateRange];

  // 5. Daily Reviews Processed Chart
  const dailyReviewsData = {
    today: [
      { time: '09:00', reviews: 20 },
      { time: '11:00', reviews: 35 },
      { time: '13:00', reviews: 45 },
      { time: '15:00', reviews: 52 },
      { time: '17:00', reviews: 38 }
    ],
    '7days': [
      { time: 'Mon', reviews: 140 },
      { time: 'Tue', reviews: 185 },
      { time: 'Wed', reviews: 210 },
      { time: 'Thu', reviews: 195 },
      { time: 'Fri', reviews: 230 },
      { time: 'Sat', reviews: 120 },
      { time: 'Sun', reviews: 90 }
    ],
    '30days': [
      { time: 'Wk 1', reviews: 850 },
      { time: 'Wk 2', reviews: 980 },
      { time: 'Wk 3', reviews: 910 },
      { time: 'Wk 4', reviews: 1040 }
    ]
  }[dateRange];

  const handleOpenDrawer = (user: Contributor) => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleAction = (status: Contributor['status']) => {
    if (selectedUser) {
      flagContributor(selectedUser.id, status);
      // update local state drawer view dynamically
      setSelectedUser(prev => prev ? { ...prev, status } : null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Premium Hero Header Section */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200/50 dark:border-zinc-800/40 bg-zinc-50/50 dark:bg-zinc-950/20 backdrop-blur-xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl -z-10" />
        
        <div className="space-y-3">
          {/* Badge Row */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span>System Healthy</span>
            </span>
            
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Enterprise Demo
            </span>
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gradient">AI Quality Operations</h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold mt-1">
              Monitoring 100 Active Transcribers
            </p>
          </div>

          {/* Telemetry Status metadata */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-400 pt-1">
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live System Status: <strong className="text-zinc-650 dark:text-zinc-350">Operational</strong></span>
            </div>
            <span className="hidden md:inline text-zinc-300 dark:text-zinc-800">•</span>
            <div className="flex items-center space-x-1">
              <span>Last Updated: <strong className="text-zinc-650 dark:text-zinc-350">14 July 2026, 17:00</strong></span>
            </div>
          </div>
        </div>

        {/* Segmented control date filter */}
        <div className="flex items-center space-x-2 bg-zinc-100/55 dark:bg-zinc-900/60 p-1 border border-zinc-200/40 dark:border-zinc-800/40 rounded-xl self-start md:self-auto shadow-sm">
          {(['today', '7days', '30days'] as const).map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 text-xs font-bold rounded-lg capitalize transition-all ${
                dateRange === range
                  ? 'bg-white dark:bg-zinc-800 text-indigo-500 dark:text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
              }`}
            >
              {range === '7days' ? '7 Days' : range === '30days' ? '30 Days' : 'Today'}
            </button>
          ))}
        </div>
      </div>

      {/* Content wrapper with loading overlay */}
      <div className={`space-y-8 transition-all duration-300 ${isLoading ? 'opacity-35 pointer-events-none blur-xs scale-[0.998]' : 'opacity-100'}`}>
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
        {/* Total Transcribers */}
        <GlassCard hoverEffect={false} className="p-4 flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Total Transcribers</span>
            <h3 className="text-xl font-bold mt-1 tracking-tight">{totalCount}</h3>
          </div>
          <div className="mt-3.5 flex items-center text-[9px] text-zinc-400 font-semibold">
            <span className="text-emerald-500 flex items-center mr-1">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> {trends.total}
            </span>
            <span>vs prev range</span>
          </div>
        </GlassCard>

        {/* Safe Users */}
        <GlassCard hoverEffect={false} className="p-4 flex flex-col justify-between border-l-4 border-l-emerald-500">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Safe Users</span>
            <h3 className="text-xl font-bold mt-1 tracking-tight text-emerald-500">{safeCount}</h3>
          </div>
          <div className="mt-3.5 flex items-center text-[9px] text-zinc-400 font-semibold">
            <span className="text-emerald-500 flex items-center mr-1">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> {trends.safe}
            </span>
            <span>active queue</span>
          </div>
        </GlassCard>

        {/* Warning Users */}
        <GlassCard hoverEffect={false} className="p-4 flex flex-col justify-between border-l-4 border-l-amber-500">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Warning Users</span>
            <h3 className="text-xl font-bold mt-1 tracking-tight text-amber-500">{warningCount}</h3>
          </div>
          <div className="mt-3.5 flex items-center text-[9px] text-zinc-400 font-semibold">
            <span className="text-amber-500 flex items-center mr-1">
              <ArrowDownRight className="w-3 h-3 mr-0.5" /> {trends.warn}
            </span>
            <span>flagged audit</span>
          </div>
        </GlassCard>

        {/* Blocked Users */}
        <GlassCard hoverEffect={false} className="p-4 flex flex-col justify-between border-l-4 border-l-red-500">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Blocked Users</span>
            <h3 className="text-xl font-bold mt-1 tracking-tight text-red-500">{blockedCount}</h3>
          </div>
          <div className="mt-3.5 flex items-center text-[9px] text-zinc-400 font-semibold">
            <span className="text-red-500 flex items-center mr-1">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> {trends.block}
            </span>
            <span>restricted</span>
          </div>
        </GlassCard>

        {/* Avg Listening Ratio */}
        <GlassCard hoverEffect={false} className="p-4 flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Avg Listening</span>
            <h3 className="text-xl font-bold mt-1 tracking-tight text-indigo-500">{avgListeningRatio}%</h3>
          </div>
          <div className="mt-3.5 flex items-center text-[9px] text-zinc-400 font-semibold">
            <span className="text-emerald-500 flex items-center mr-1">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> {trends.listening}
            </span>
            <span>scrub speed</span>
          </div>
        </GlassCard>

        {/* Avg Edit Rate */}
        <GlassCard hoverEffect={false} className="p-4 flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Avg Edit Rate</span>
            <h3 className="text-xl font-bold mt-1 tracking-tight text-sky-500">{avgEditRate}%</h3>
          </div>
          <div className="mt-3.5 flex items-center text-[9px] text-zinc-400 font-semibold">
            <span className="text-emerald-500 flex items-center mr-1">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> {trends.edit}
            </span>
            <span>keystroke edits</span>
          </div>
        </GlassCard>

        {/* Avg Quality Score */}
        <GlassCard hoverEffect={false} className="p-4 flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Avg Quality</span>
            <h3 className="text-xl font-bold mt-1 tracking-tight text-purple-500">{avgQualityScore}%</h3>
          </div>
          <div className="mt-3.5 flex items-center text-[9px] text-zinc-400 font-semibold">
            <span className="text-emerald-500 flex items-center mr-1">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> {trends.quality}
            </span>
            <span>overall index</span>
          </div>
        </GlassCard>

        {/* Avg CPS */}
        <GlassCard hoverEffect={false} className="p-4 flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Avg Speed (CPS)</span>
            <h3 className="text-xl font-bold mt-1 tracking-tight text-pink-500">{avgCps} CPS</h3>
          </div>
          <div className="mt-3.5 flex items-center text-[9px] text-zinc-400 font-semibold">
            <span className="text-emerald-500 flex items-center mr-1">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> {trends.cps}
            </span>
            <span>average speed</span>
          </div>
        </GlassCard>
      </div>

      {/* Distribution Charts & Trend Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Listening Ratio Distribution */}
        <GlassCard hoverEffect={false} className="p-5">
          <div className="mb-4">
            <h4 className="font-bold text-xs tracking-tight uppercase text-zinc-400">Listening Ratio Distribution</h4>
            <p className="text-[10px] text-zinc-500">Audio playback duration brackets of active transcribers</p>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={listeningDist} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#888888" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={9} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.95)', border: '1px solid rgba(228, 228, 231, 0.1)', borderRadius: '8px', fontSize: 10, color: '#fff', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={30}>
                  {listeningDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Chart 2: Edit Rate Distribution */}
        <GlassCard hoverEffect={false} className="p-5">
          <div className="mb-4">
            <h4 className="font-bold text-xs tracking-tight uppercase text-zinc-400">Edit Rate Distribution</h4>
            <p className="text-[10px] text-zinc-500">Typos editing and correction percentages profile</p>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={editRateDist} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#888888" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={9} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.95)', border: '1px solid rgba(228, 228, 231, 0.1)', borderRadius: '8px', fontSize: 10, color: '#fff', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={30}>
                  {editRateDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Chart 3: Quality Score Distribution */}
        <GlassCard hoverEffect={false} className="p-5">
          <div className="mb-4">
            <h4 className="font-bold text-xs tracking-tight uppercase text-zinc-400">Quality Score Distribution</h4>
            <p className="text-[10px] text-zinc-500">Dynamic score segments mapped from total weight configs</p>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={qualityDist} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#888888" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={9} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.95)', border: '1px solid rgba(228, 228, 231, 0.1)', borderRadius: '8px', fontSize: 10, color: '#fff', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={30}>
                  {qualityDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Row 3: Warning Trend & Daily Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 4: Warning Trend */}
        <GlassCard hoverEffect={false} className="p-5">
          <div className="mb-4">
            <h4 className="font-bold text-xs tracking-tight uppercase text-zinc-400">Behavioral Warning Trend</h4>
            <p className="text-[10px] text-zinc-500">Heuristics alerts triggered over selected range</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={warningTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="#888888" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={9} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.95)', border: '1px solid rgba(228, 228, 231, 0.1)', borderRadius: '8px', fontSize: 10, color: '#fff', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)' }} />
                <Area type="monotone" dataKey="warnings" stroke="#f59e0b" fillOpacity={1} fill="url(#colorWarnings)" strokeWidth={2} name="Warnings Raised" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Chart 5: Daily Reviews */}
        <GlassCard hoverEffect={false} className="p-5">
          <div className="mb-4">
            <h4 className="font-bold text-xs tracking-tight uppercase text-zinc-400">Daily Telemetry Reviews</h4>
            <p className="text-[10px] text-zinc-500">Volume of transcript verification operations</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyReviewsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="#888888" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={9} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.95)', border: '1px solid rgba(228, 228, 231, 0.1)', borderRadius: '8px', fontSize: 10, color: '#fff', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)' }} />
                <Bar dataKey="reviews" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={30} name="Processed Files" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Row 4: Suspicious Users Table */}
      <GlassCard hoverEffect={false} className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-extrabold text-sm text-gradient">Suspicious Activity Ledger</h3>
            <p className="text-[11px] text-zinc-500">Transcribers flagged by focus switches or audio play skips</p>
          </div>
          <div className="flex items-center space-x-1 bg-zinc-100/50 dark:bg-zinc-800/40 px-2 py-1 rounded-lg text-[9px] text-zinc-400">
            <Activity className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            <span>Scanning real-time WPM inputs</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-zinc-400 border-b border-zinc-200/50 dark:border-zinc-800/40 pb-3">
                <th className="pb-3 font-semibold">User ID</th>
                <th className="pb-3 font-semibold text-center">Listening Ratio</th>
                <th className="pb-3 font-semibold text-center">Edit Rate</th>
                <th className="pb-3 font-semibold text-center">Characters / Sec</th>
                <th className="pb-3 font-semibold text-center">Quality Score</th>
                <th className="pb-3 font-semibold text-center">Status</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/40 dark:divide-zinc-800/10">
              {filteredContributors.map(c => (
                <tr
                  key={c.id}
                  onClick={() => handleOpenDrawer(c)}
                  className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 cursor-pointer transition-colors duration-200"
                >
                  <td className="py-3.5 font-bold">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-[10px] text-zinc-500">
                        {c.avatar}
                      </div>
                      <div>
                        <span className="block font-semibold text-zinc-900 dark:text-zinc-100">{c.name}</span>
                        <span className="block text-[9px] text-zinc-400 font-medium">ID: {c.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 text-center font-semibold">
                    <span className={c.metrics.listeningRatio < 0.3 ? 'text-red-500' : c.metrics.listeningRatio < 0.7 ? 'text-amber-500' : 'text-emerald-500'}>
                      {Math.round(c.metrics.listeningRatio * 100)}%
                    </span>
                  </td>
                  <td className="py-3.5 text-center font-semibold text-zinc-700 dark:text-zinc-300">
                    {c.metrics.editRate}%
                  </td>
                  <td className="py-3.5 text-center font-semibold text-zinc-700 dark:text-zinc-300">
                    {c.metrics.charactersPerSecond} CPS
                  </td>
                  <td className="py-3.5 text-center font-bold">
                    <span className={c.qualityScore < 40 ? 'text-red-500' : c.qualityScore < 75 ? 'text-amber-500' : 'text-emerald-500'}>
                      {c.qualityScore}%
                    </span>
                  </td>
                  <td className="py-3.5 text-center">
                    <QualityBadge status={c.status} type="status" />
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDrawer(c);
                      }}
                      className="px-2.5 py-1 text-[10px] font-bold text-indigo-500 hover:text-indigo-600 hover:underline transition-colors"
                    >
                      Audit Log
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
      </div>

      {/* Flyout side drawer */}
      {isDrawerOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex justify-end bg-zinc-950/40 dark:bg-black/60 backdrop-blur-xs">
          {/* Backdrop click to close */}
          <div className="flex-1" onClick={handleCloseDrawer} />

          {/* Drawer container */}
          <div className="w-full max-w-lg bg-white dark:bg-zinc-950 h-full border-l border-zinc-200/50 dark:border-zinc-800/40 p-6 flex flex-col justify-between shadow-2xl animate-slide-up overflow-y-auto">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/40 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md">
                    {selectedUser.avatar}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-zinc-950 dark:text-zinc-50">{selectedUser.name}</h3>
                    <span className="text-[10px] text-zinc-400 block">Workspace Contributor • ID: {selectedUser.id}</span>
                  </div>
                </div>
                <button
                  onClick={handleCloseDrawer}
                  className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/60 border border-transparent hover:border-zinc-200/20"
                >
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>

              {/* Status & Scores */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-zinc-50 dark:bg-zinc-900/35 border border-zinc-200/40 dark:border-zinc-800/40 rounded-xl p-3.5">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-400">Current Status</span>
                  <div className="mt-1">
                    <QualityBadge status={selectedUser.status} type="status" />
                  </div>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-900/35 border border-zinc-200/40 dark:border-zinc-800/40 rounded-xl p-3.5">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-400">Quality Index Score</span>
                  <h4 className={`text-base font-extrabold mt-1 ${
                    selectedUser.qualityScore < 40 ? 'text-red-500' : selectedUser.qualityScore < 75 ? 'text-amber-500' : 'text-emerald-500'
                  }`}>
                    {selectedUser.qualityScore}%
                  </h4>
                </div>
              </div>

              {/* Behavioral metrics */}
              <div className="mt-6">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-3">Behavioral Telemetry</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-zinc-50 dark:bg-zinc-900/10 border border-zinc-200/40 dark:border-zinc-800/40 rounded-lg p-2.5">
                    <Volume2 className="w-3.5 h-3.5 text-indigo-500 mb-1.5" />
                    <span className="block text-[8px] text-zinc-400 uppercase tracking-wider">Listening Ratio</span>
                    <strong className="text-xs text-zinc-900 dark:text-zinc-50 mt-0.5 block">{Math.round(selectedUser.metrics.listeningRatio * 100)}%</strong>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-900/10 border border-zinc-200/40 dark:border-zinc-800/40 rounded-lg p-2.5">
                    <Edit className="w-3.5 h-3.5 text-indigo-500 mb-1.5" />
                    <span className="block text-[8px] text-zinc-400 uppercase tracking-wider">Edit Rate</span>
                    <strong className="text-xs text-zinc-900 dark:text-zinc-50 mt-0.5 block">{selectedUser.metrics.editRate}%</strong>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-900/10 border border-zinc-200/40 dark:border-zinc-800/40 rounded-lg p-2.5">
                    <Keyboard className="w-3.5 h-3.5 text-indigo-500 mb-1.5" />
                    <span className="block text-[8px] text-zinc-400 uppercase tracking-wider">Characters/Sec</span>
                    <strong className="text-xs text-zinc-900 dark:text-zinc-50 mt-0.5 block">{selectedUser.metrics.charactersPerSecond} CPS</strong>
                  </div>
                </div>
              </div>

              {/* Reasons for Flagging */}
              <div className="mt-6 text-left">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-3">Suspicion Signature</h4>
                <div className="space-y-2">
                  {selectedUser.metrics.copyPasteCount > 2 && (
                    <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-[10px] text-red-600 dark:text-red-400 flex items-start space-x-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span>Robotic Clipboard Activity: pasted text {selectedUser.metrics.copyPasteCount} times inside editor inputs.</span>
                    </div>
                  )}
                  {selectedUser.metrics.listeningRatio < 0.7 && (
                    <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-[10px] text-red-600 dark:text-red-400 flex items-start space-x-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span>Audio Playback Skips: listened to only {Math.round(selectedUser.metrics.listeningRatio * 100)}% of total audio lengths.</span>
                    </div>
                  )}
                  {selectedUser.metrics.tabSwitches > 5 && (
                    <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-600 dark:text-amber-400 flex items-start space-x-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span>Tab Telemetry Alert: exited window {selectedUser.metrics.tabSwitches} times while audio was playing.</span>
                    </div>
                  )}
                  {selectedUser.metrics.copyPasteCount === 0 && selectedUser.metrics.listeningRatio >= 0.7 && selectedUser.metrics.tabSwitches <= 5 && (
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-600 dark:text-emerald-400 flex items-start space-x-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span>No anomalies found. Typing dynamics and audio scrubbing ratios are safe.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommended Action */}
              <div className="mt-6">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Recommended System Intervention</h4>
                <div className="p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
                  <strong className="text-[11px] font-bold text-indigo-500 block">
                    {selectedUser.qualityScore < 40 ? 'Action Recommendation: Restrict Workspace Access' : selectedUser.qualityScore < 75 ? 'Action Recommendation: Audit Work logs' : 'Action Recommendation: Keep Safe'}
                  </strong>
                  <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">
                    {selectedUser.qualityScore < 40 
                      ? 'The dynamic quality score is critical. Access should be restricted to prevent low accuracy dataset submissions.' 
                      : selectedUser.qualityScore < 75 
                        ? 'The user shows signs of tab-switching. Suggest monitoring their next 3 transcript submissions.' 
                        : 'No restrictions needed. The user is writing high quality manual inputs.'}
                  </p>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="mt-6 text-left">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-3">Audit Timeline</h4>
                {selectedUser.timeline.length === 0 ? (
                  <span className="text-[10px] text-zinc-500">No logs for current window</span>
                ) : (
                  <div className="space-y-3 pl-3.5 border-l border-zinc-200 dark:border-zinc-800ml-1 text-[10px]">
                    {selectedUser.timeline.map((t, idx) => (
                      <div key={idx} className="relative">
                        <span className="absolute -left-[19.5px] top-1 w-2 h-2 rounded-full bg-zinc-400 border border-white dark:border-zinc-950" />
                        <div className="flex justify-between text-zinc-400 text-[9px] font-semibold mb-0.5">
                          <span>{t.event}</span>
                          <span>{t.time}</span>
                        </div>
                        <span className="text-zinc-500">{t.details}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons (Block, Warning, Safe) */}
            <div className="flex gap-3 border-t border-zinc-200/50 dark:border-zinc-800/40 pt-4 mt-6">
              <button
                onClick={() => handleAction('safe')}
                disabled={selectedUser.status === 'safe'}
                className="flex-1 inline-flex items-center justify-center space-x-1 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 disabled:opacity-40 disabled:hover:bg-emerald-500/10 transition"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Mark Safe</span>
              </button>
              <button
                onClick={() => handleAction('warning')}
                disabled={selectedUser.status === 'warning'}
                className="flex-1 inline-flex items-center justify-center space-x-1 px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/25 disabled:opacity-40 disabled:hover:bg-amber-500/10 transition"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Set Warning</span>
              </button>
              <button
                onClick={() => handleAction('blocked')}
                disabled={selectedUser.status === 'blocked'}
                className="flex-1 inline-flex items-center justify-center space-x-1 px-4 py-2 text-xs font-semibold rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/25 disabled:opacity-40 disabled:hover:bg-red-500/10 transition"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Block User</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
