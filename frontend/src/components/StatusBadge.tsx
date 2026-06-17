import type { AlertStatus } from '../lib/utils'

const config: Record<AlertStatus, { label: string; className: string }> = {
  ok: { label: 'OK', className: 'bg-green-900/40 text-green-300 border border-green-800/50' },
  warning: { label: 'Advarsel', className: 'bg-yellow-900/40 text-yellow-300 border border-yellow-800/50' },
  critical: { label: 'Kritisk', className: 'bg-orange-900/40 text-orange-300 border border-orange-800/50' },
  expired: { label: 'Utløpt', className: 'bg-red-900/40 text-red-300 border border-red-800/50' },
}

export default function StatusBadge({ status }: { status: AlertStatus }) {
  const { label, className } = config[status]
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${className}`}>
      {label}
    </span>
  )
}
