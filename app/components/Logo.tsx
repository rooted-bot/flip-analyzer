export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center shadow-lg`}>
      <svg viewBox="0 0 24 24" className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M3 21h18M5 21V7l8-4 8 4v14M8 21v-9a2 2 0 012-2h4a2 2 0 012 2v9"/>
      </svg>
    </div>
  );
}
