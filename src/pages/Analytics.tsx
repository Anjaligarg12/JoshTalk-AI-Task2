import React from 'react';
import { useData } from '../context/DataContext';
import { GlassCard } from '../components/GlassCard';
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  Calendar,
  Users,
  Keyboard,
  ArrowRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line
} from 'recharts';

export const Analytics: React.FC = () => {
  const { contributors } = useData();

  // 1. Telemetry Trends: Mock last 7 days log data
  const weeklyTrendData = [
    { day: 'Mon', qualityScore: 86.2, listeningRatio: 83.1, editRate: 17.5, flagged: 15, blocked: 8 },
    { day: 'Tue', qualityScore: 86.8, listeningRatio: 83.5, editRate: 17.8, flagged: 16, blocked: 9 },
    { day: 'Wed', qualityScore: 87.5, listeningRatio: 84.2, editRate: 18.2, flagged: 18, blocked: 10 },
    { day: 'Thu', qualityScore: 86.9, listeningRatio: 83.9, editRate: 18.0, flagged: 17, blocked: 10 },
    { day: 'Fri', qualityScore: 87.1, listeningRatio: 84.0, editRate: 18.1, flagged: 18, blocked: 10 },
    { day: 'Sat', qualityScore: 87.8, listeningRatio: 84.5, editRate: 18.5, flagged: 19, blocked: 10 },
    { day: 'Sun', qualityScore: 87.0, listeningRatio: 84.0, editRate: 18.0, flagged: 18, blocked: 10 }
  ];

  // 2. Top Risk Contributors (lowest quality scores)
  const topRiskContributors = [...contributors]
    .sort((a, b) => a.qualityScore - b.qualityScore)
    .slice(0, 5);

  // 3. Activity Heatmap mock statistics (7 days x 4 timeframes)
  // Timeframes: Night (00-06), Morning (06-12), Afternoon (12-18), Evening (18-24)
  const heatmapData = [
    { day: 'Mon', slots: [12, 45, 68, 54] },
    { day: 'Tue', slots: [8, 52, 74, 61] },
    { day: 'Wed', slots: [15, 61, 88, 72] },
    { day: 'Thu', slots: [11, 48, 80, 65] },
    { day: 'Fri', slots: [14, 55, 82, 69] },
    { day: 'Sat', slots: [20, 35, 50, 48] },
    { day: 'Sun', slots: [18, 28, 42, 38] }
  ];

  const getHeatmapColor = (val: number) => {
    if (val > 80) return 'bg-indigo-600 dark:bg-indigo-500 text-white'; // peak
    if (val > 60) return 'bg-indigo-500/70 dark:bg-indigo-500/60 text-white'; // high
    if (val > 40) return 'bg-indigo-500/40 dark:bg-indigo-500/30 text-indigo-900 dark:text-indigo-200'; // medium
    return 'bg-indigo-500/10 dark:bg-indigo-500/5 text-zinc-400'; // low
  };

  const handleInspect = (userId: string) => {
    window.location.hash = `#user-analysis?id=${userId}`;
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gradient">Audit Analytics</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs md:text-sm mt-1">
          Historical quality curves, heatmaps of system load, and risk distribution analysis.
        </p>
      </div>

      {/* Row 1: Quality and Listening Ratio Trend Area Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard hoverEffect={false} className="p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-indigo-500 mr-2" /> Quality & Playback Ratio curves
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorQuality" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorListening" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(228, 228, 231, 0.1)" />
                <XAxis dataKey="day" stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={10} domain={[30, 100]} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.95)', border: '1px solid rgba(228,228,231,0.1)', borderRadius: '8px', color: '#fff' }}
                  labelStyle={{ fontSize: '10px', color: '#a1a1aa', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Area type="monotone" name="Avg Quality Score" dataKey="qualityScore" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorQuality)" />
                <Area type="monotone" name="Avg Listening Ratio" dataKey="listeningRatio" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorListening)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Edit Rate Trend Line Chart */}
        <GlassCard hoverEffect={false} className="p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center">
            <Keyboard className="w-4 h-4 text-indigo-500 mr-2" /> Keystroke Edit Rate Trend
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(228, 228, 231, 0.1)" />
                <XAxis dataKey="day" stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={10} domain={[0, 40]} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.95)', border: '1px solid rgba(228,228,231,0.1)', borderRadius: '8px', color: '#fff' }}
                  labelStyle={{ fontSize: '10px', color: '#a1a1aa', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Line type="monotone" name="Avg Edit Rate (%)" dataKey="editRate" stroke="#38bdf8" strokeWidth={2} activeDot={{ r: 6 }} dot={{ strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Row 2: Flagged and Blocked Users Trend (Bar Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard hoverEffect={false} className="p-5 lg:col-span-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center">
            <Users className="w-4 h-4 text-indigo-500 mr-2" /> Flagged & Blocked Users Trend
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(228, 228, 231, 0.1)" />
                <XAxis dataKey="day" stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.95)', border: '1px solid rgba(228,228,231,0.1)', borderRadius: '8px', color: '#fff' }}
                  labelStyle={{ fontSize: '10px', color: '#a1a1aa', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Bar name="Flagged Warning Users" dataKey="flagged" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={16} />
                <Bar name="Blocked Users" dataKey="blocked" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Weekly Activity Heatmap Grid */}
        <GlassCard hoverEffect={false} className="p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center">
              <Calendar className="w-4 h-4 text-indigo-500 mr-2" /> Load Heatmap (Weekly Audits)
            </h3>
            
            {/* Grid header */}
            <div className="grid grid-cols-5 gap-1 text-[9px] font-bold text-zinc-400 uppercase text-center mb-1.5 select-none">
              <span>Day</span>
              <span>Night</span>
              <span>Morn</span>
              <span>Aftn</span>
              <span>Even</span>
            </div>

            {/* Heatmap cells */}
            <div className="space-y-1.5">
              {heatmapData.map(h => (
                <div key={h.day} className="grid grid-cols-5 gap-1 items-center text-center">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase select-none">{h.day}</span>
                  {h.slots.map((s, idx) => (
                    <div
                      key={idx}
                      className={`py-2 text-[10px] font-bold rounded ${getHeatmapColor(s)}`}
                      title={`${s} active transcript reviews`}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-[8px] text-zinc-450 dark:text-zinc-500 border-t border-zinc-200/40 dark:border-zinc-800/10 pt-3">
            <span>Low Load</span>
            <div className="flex space-x-1">
              <span className="w-2.5 h-2.5 rounded bg-indigo-500/10" />
              <span className="w-2.5 h-2.5 rounded bg-indigo-500/40" />
              <span className="w-2.5 h-2.5 rounded bg-indigo-500/70" />
              <span className="w-2.5 h-2.5 rounded bg-indigo-500" />
            </div>
            <span>Peak Load</span>
          </div>
        </GlassCard>
      </div>

      {/* Row 3: Top Risk Contributors & Operational Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Top Risk Contributors */}
        <div className="lg:col-span-7">
          <GlassCard hoverEffect={false} className="p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center">
              <AlertTriangle className="w-4 h-4 text-indigo-500 mr-2" /> Top Risk Contributors
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-zinc-400 border-b border-zinc-200/40 dark:border-zinc-800/20 bg-zinc-50/10 dark:bg-zinc-900/5 select-none">
                    <th className="py-2.5 px-3 font-semibold">User</th>
                    <th className="py-2.5 px-2 font-semibold text-center">Quality</th>
                    <th className="py-2.5 px-2 font-semibold text-center">Speed</th>
                    <th className="py-2.5 px-2 font-semibold text-center">Warnings</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/40 dark:divide-zinc-800/10">
                  {topRiskContributors.map(c => (
                    <tr key={c.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-850/20">
                      <td className="py-3 px-3">
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
                      <td className="py-3 px-2 text-center font-extrabold text-red-500">
                        {c.qualityScore}%
                      </td>
                      <td className="py-3 px-2 text-center font-semibold text-zinc-700 dark:text-zinc-300">
                        {c.metrics.charactersPerSecond} CPS
                      </td>
                      <td className="py-3 px-2 text-center font-semibold text-zinc-700 dark:text-zinc-300">
                        {c.previousWarnings} alerts
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleInspect(c.id)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 text-[10px] font-bold rounded-lg bg-zinc-100 hover:bg-zinc-200/60 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200/45 dark:border-zinc-800/40 text-zinc-800 dark:text-zinc-200 transition"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* Daily Operations Activity Timeline */}
        <div className="lg:col-span-5">
          <GlassCard hoverEffect={false} className="p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center">
              <Clock className="w-4 h-4 text-indigo-500 mr-2" /> Operations Event Timeline
            </h3>

            <div className="space-y-4 text-[10px] pl-3 border-l border-zinc-200 dark:border-zinc-800 ml-1">
              <div className="relative text-left">
                <span className="absolute -left-[16.5px] top-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <div className="flex justify-between text-zinc-400 text-[8px] font-bold mb-0.5">
                  <span>SYSTEM MONITOR FEED</span>
                  <span>4 mins ago</span>
                </div>
                <span className="text-zinc-500 dark:text-zinc-400">Automatic OCR copy-paste verification checks completed for batch #441.</span>
              </div>

              <div className="relative text-left">
                <span className="absolute -left-[16.5px] top-1.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
                <div className="flex justify-between text-zinc-400 text-[8px] font-bold mb-0.5">
                  <span>HEURISTICS NETWORK</span>
                  <span>2 hours ago</span>
                </div>
                <span className="text-zinc-500 dark:text-zinc-400">Telemetry threshold values calibrated: Edit rate warnings clamped at 10%.</span>
              </div>

              <div className="relative text-left">
                <span className="absolute -left-[16.5px] top-1.5 w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                <div className="flex justify-between text-zinc-400 text-[8px] font-bold mb-0.5">
                  <span>AI THREAT TRIGGER</span>
                  <span>5 hours ago</span>
                </div>
                <span className="text-zinc-500 dark:text-zinc-400">Contributor <strong className="text-red-500">Buster Bot (C-BLOCK-3004)</strong> flagged for zero keystroke timing timing variance.</span>
              </div>

              <div className="relative text-left">
                <span className="absolute -left-[16.5px] top-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <div className="flex justify-between text-zinc-400 text-[8px] font-bold mb-0.5">
                  <span>MODERATION RESOLVED</span>
                  <span>12 hours ago</span>
                </div>
                <span className="text-zinc-500 dark:text-zinc-400">AI recommended action approved: marked Clara Oswald (C-BLOCK-3003) warning.</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
