export default function CoinIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className || 'text-amber-500'}
    >
      <circle cx="12" cy="12" r="10" fill="#FDE047" stroke="#D97706" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="6" fill="none" stroke="#D97706" strokeWidth="1.5" />
      <path d="M12 8v8M9.5 10.5h3.2a1.7 1.7 0 0 1 0 3.4h-2.6a1.7 1.7 0 0 0 0 3.4H13" stroke="#D97706" strokeWidth="1.4" />
    </svg>
  )
}
