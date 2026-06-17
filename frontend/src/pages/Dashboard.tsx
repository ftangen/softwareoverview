import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, Package, ShieldAlert, AlertTriangle, CheckCircle } from 'lucide-react'
import { api } from '../lib/api'
import { formatDate } from '../lib/utils'
import StatusBadge from '../components/StatusBadge'
import type { AlertStatus } from '../lib/utils'

export default function Dashboard() {
  const { data: stats } = useQuery({ queryKey: ['stats'], queryFn: api.getDashboardStats })
  const { data: alerts, isLoading } = useQuery({ queryKey: ['alerts'], queryFn: api.getAlerts })

  const s = stats as any
  const a = (alerts as any[]) || []

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <LayoutDashboard size={22} className="text-gray-400" />
        <h2 className="text-xl font-bold text-white">Dashboard</h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<FolderKanban size={18} className="text-blue-400" />}
          label="Prosjekter"
          value={s?.projectCount ?? '—'}
        />
        <StatCard
          icon={<Package size={18} className="text-purple-400" />}
          label="Programvare i katalog"
          value={s?.softwareCount ?? '—'}
        />
        <StatCard
          icon={<ShieldAlert size={18} className="text-red-400" />}
          label="Utløpt"
          value={s?.expiredCount ?? '—'}
          highlight={s?.expiredCount > 0 ? 'red' : undefined}
        />
        <StatCard
          icon={<AlertTriangle size={18} className="text-orange-400" />}
          label="Kritisk (under 90 dager)"
          value={s?.criticalCount ?? '—'}
          highlight={s?.criticalCount > 0 ? 'orange' : undefined}
        />
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-2">
          <AlertTriangle size={16} className="text-yellow-400" />
          <h3 className="font-semibold text-white text-sm">
            Varsler — programvare som krever oppfølging (innen 180 dager)
          </h3>
        </div>

        {isLoading ? (
          <p className="px-6 py-10 text-gray-500 text-center text-sm">Laster...</p>
        ) : a.length === 0 ? (
          <div className="px-6 py-10 flex flex-col items-center gap-2 text-center">
            <CheckCircle size={28} className="text-green-500" />
            <p className="text-gray-400 text-sm font-medium">Ingen varsler — alt ser bra ut!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {a.map((alert: any) => (
              <div key={alert.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-800/40 transition-colors">
                <StatusBadge status={alert.alertStatus as AlertStatus} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-white text-sm">{alert.softwareName}</span>
                    <span className="text-gray-500 text-xs font-mono">v{alert.version}</span>
                  </div>
                  <Link
                    to={`/projects/${alert.project.id}`}
                    className="text-xs text-gray-500 hover:text-blue-400 transition-colors"
                  >
                    {alert.project.projectNumber} — {alert.project.projectName}
                    {alert.project.customer && ` (${alert.project.customer})`}
                  </Link>
                </div>
                <div className="text-right text-xs shrink-0">
                  {alert.endOfSupport && (
                    <div className="text-gray-500">
                      EoS: <span className="text-gray-300">{formatDate(alert.endOfSupport)}</span>
                    </div>
                  )}
                  {alert.endOfLife && (
                    <div className="text-gray-500">
                      EoL: <span className="text-gray-300">{formatDate(alert.endOfLife)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  highlight?: 'red' | 'orange'
}) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <p
        className={`text-3xl font-bold ${
          highlight === 'red'
            ? 'text-red-400'
            : highlight === 'orange'
              ? 'text-orange-400'
              : 'text-white'
        }`}
      >
        {value}
      </p>
    </div>
  )
}
