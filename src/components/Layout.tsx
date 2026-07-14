import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import {
  LayoutDashboard,
  Users,
  Sliders,
  BarChart3,
  Lightbulb,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  Search,
  AlertTriangle,
  Activity
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  setActivePage: (page: string) => void;
  onSelectUser: (userId: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activePage,
  setActivePage,
  onSelectUser
}) => {
  const { alerts, markAllAlertsAsRead } = useData();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAlertsDropdownOpen, setIsAlertsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Count unread alerts
  const unreadCount = alerts.filter(a => !a.read).length;

  // Initialize Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Toggle Theme
  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'user-analysis', label: 'User Analysis', icon: Users },
    { id: 'score-engine', label: 'Quality Score Engine', icon: Activity },
    { id: 'detection-rules', label: 'Detection Rules', icon: Sliders },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'recommendations', label: 'AI Recommendations', icon: Lightbulb },
  ];

  const handleAlertClick = (contributorId: string) => {
    setIsAlertsDropdownOpen(false);
    onSelectUser(contributorId);
    setActivePage('user-analysis');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-zinc-100/50 dark:bg-zinc-950/20 border-r border-zinc-200/50 dark:border-zinc-800/40 backdrop-blur-xl">
        {/* Brand Logo */}
        <div className="h-16 flex items-center px-6 border-b border-zinc-200/40 dark:border-zinc-800/20">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <span className="text-white font-bold text-sm">TQ</span>
            </div>
            <div>
              <span className="font-semibold text-sm tracking-tight block">Transcription Quality</span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block">AI Evaluation Engine</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] border border-indigo-500/20'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/40 dark:hover:bg-zinc-800/30 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-500 dark:text-indigo-400' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Developer / User Profile and version */}
        <div className="p-4 border-t border-zinc-200/40 dark:border-zinc-800/20 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-600 dark:text-zinc-300">
            AG
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">Enterprise Demo</p>
            <p className="text-[10px] text-zinc-400 truncate">v1.2.0 • Sandbox</p>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-zinc-950/40 backdrop-blur-sm">
          <div className="w-64 bg-white dark:bg-zinc-950 h-full flex flex-col p-4 border-r border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">TQ</span>
                </div>
                <span className="font-bold text-sm">Transcription Engine</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1.5">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActivePage(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                        : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/30'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold">
                  ED
                </div>
                <span className="text-xs font-semibold">Demo User</span>
              </div>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white/40 dark:bg-zinc-950/10 border-b border-zinc-200/50 dark:border-zinc-800/40 backdrop-blur-md z-30">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1 rounded-md md:hidden hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search Bar - Aesthetic Only */}
            <div className="hidden sm:flex items-center space-x-2 bg-zinc-100/50 dark:bg-zinc-900/40 border border-zinc-200/40 dark:border-zinc-800/50 rounded-full px-3.5 py-1.5 w-64 focus-within:w-72 transition-all duration-300">
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search telemetry logs..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs w-full placeholder-zinc-400"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60 border border-zinc-200/30 dark:border-zinc-800/30 transition-colors"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-indigo-400" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-500" />
              )}
            </button>

            {/* Notifications / Alerts Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsAlertsDropdownOpen(!isAlertsDropdownOpen)}
                className="p-2 rounded-full hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60 border border-zinc-200/30 dark:border-zinc-800/30 transition-colors relative"
                aria-label="Alerts"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                )}
              </button>

              {isAlertsDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200/50 dark:border-zinc-800/50 py-2 z-50 animate-slide-up">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200/50 dark:border-zinc-800/50">
                    <span className="font-semibold text-xs text-zinc-500 dark:text-zinc-400">Behavioral Alerts</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAlertsAsRead}
                        className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-zinc-200/40 dark:divide-zinc-800/20">
                    {alerts.length === 0 ? (
                      <div className="p-4 text-center text-xs text-zinc-400">No alerts triggered</div>
                    ) : (
                      alerts.map(alert => (
                        <div
                          key={alert.id}
                          onClick={() => handleAlertClick(alert.contributorId)}
                          className={`p-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors ${
                            !alert.read ? 'bg-indigo-500/[0.02] border-l-2 border-indigo-500' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            {alert.severity === 'critical' ? (
                              <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5" />
                            ) : alert.severity === 'high' ? (
                              <AlertTriangle className="w-3.5 h-3.5 text-orange-500 mt-0.5" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold truncate text-zinc-900 dark:text-zinc-100">
                                {alert.contributorName} ({alert.contributorId})
                              </p>
                              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                                Triggered <strong className="text-zinc-600 dark:text-zinc-300">{alert.ruleName}</strong>: {alert.value}
                              </p>
                              <span className="text-[9px] text-zinc-400 mt-1 block">{alert.timestamp}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick action button */}
            <button
              onClick={() => setActivePage('recommendations')}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all duration-200"
            >
              <Lightbulb className="w-3 h-3" />
              <span>Review AI Tasks</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Container with Sticky Footer */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative flex flex-col justify-between">
          <div className="flex-1 pb-10">
            {children}
          </div>
          <footer className="w-full text-center py-6 border-t border-zinc-200/40 dark:border-zinc-800/20 text-[10px] text-zinc-400 dark:text-zinc-500 space-y-1 select-none">
            <p className="font-bold text-zinc-500 dark:text-zinc-400">Developed by Anjali Garg</p>
            <p className="font-semibold text-zinc-450 dark:text-zinc-500">Josh Talks AI Hiring Assignment • Task 2</p>
            <p className="font-medium text-zinc-400/80 dark:text-zinc-500/80">Transcription Quality Evaluation Dashboard &copy; 2026</p>
          </footer>
        </main>
      </div>
    </div>
  );
};
