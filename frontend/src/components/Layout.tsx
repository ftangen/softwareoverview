import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, Package } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export default function Layout() {
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: api.getDashboardStats,
    refetchInterval: 60000,
  })

  const alertCount = ((stats as any)?.expiredCount || 0) + ((stats as any)?.criticalCount || 0)

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden">
      <aside className="w-60 bg-gray-900 border-r border-gray-800 flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-gray-800">
          <h1 className="text-base font-bold text-white tracking-tight">SoftwareOversikt</h1>
          <p className="text-xs text-gray-500 mt-0.5">Programvarestyring</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          <NavItem to="/dashboard" icon={<LayoutDashboard size={16} />} label="Dashboard">
            {alertCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                {alertCount > 9 ? '9+' : alertCount}
              </span>
            )}
          </NavItem>
          <NavItem to="/projects" icon={<FolderKanban size={16} />} label="Prosjekter" />
          <NavItem to="/software" icon={<Package size={16} />} label="Programvarekatalog" />
        </nav>
        <div className="p-4 border-t border-gray-800">
          <p className="text-xs text-gray-600">v1.0.0</p>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

function NavItem({
  to,
  icon,
  label,
  children,
}: {
  to: string
  icon: React.ReactNode
  label: string
  children?: React.ReactNode
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
        }`
      }
    >
      {icon}
      <span className="flex-1">{label}</span>
      {children}
    </NavLink>
  )
}
