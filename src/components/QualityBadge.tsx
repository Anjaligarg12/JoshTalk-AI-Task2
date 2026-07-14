import React from 'react';

interface QualityBadgeProps {
  score?: number;
  status?: 'safe' | 'warning' | 'blocked';
  type?: 'risk' | 'status';
}

export const QualityBadge: React.FC<QualityBadgeProps> = ({
  score,
  status,
  type = 'risk'
}) => {
  if (type === 'risk' && score !== undefined) {
    let text = 'Safe';
    let classes = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';

    if (score < 60) {
      text = 'Blocked';
      classes = 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 animate-pulse-slow';
    } else if (score < 80) {
      text = 'Warning';
      classes = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${classes}`}>
        {text} ({score}%)
      </span>
    );
  }

  if (type === 'status' && status !== undefined) {
    let text = 'Safe';
    let classes = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';

    if (status === 'blocked') {
      text = 'Blocked';
      classes = 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
    } else if (status === 'warning') {
      text = 'Warning';
      classes = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    }

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${classes}`}>
        <span className="w-1 h-1 rounded-full mr-1 bg-current"></span>
        {text}
      </span>
    );
  }

  return null;
};
