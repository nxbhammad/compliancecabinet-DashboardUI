import { useState, useRef, useEffect } from 'react'

type AlertStatus = 'Pending' | 'Work Stop' | null

const NAV_ITEMS = [
  { icon: GridIcon, label: 'Dashboard', active: true },
  { icon: WineIcon, label: 'The Cellar', active: false },
  { icon: BuildingIcon, label: 'Companies', active: false },
  { icon: PeopleIcon, label: 'People', active: false },
  { icon: AgencyIcon, label: 'Agencies', active: false },
  { icon: QueryIcon, label: 'Query', active: false },
  { icon: LicenseIcon, label: 'Licensing', active: false },
  { icon: ReportIcon, label: 'Reporting', active: false },
  { icon: BulkIcon, label: 'Bulk Logins', active: false },
  { icon: UsersIcon, label: 'Users', active: false },
]

const FAVORITE_COMPANIES_INIT = [
  { name: '1 Matilda Wine Company, LLC', type: 'Client', dba: 'Bonkers', status: 'Archived', alertStatus: 'Pending' as AlertStatus, starred: true },
]

const RENEWALS = [
  { name: '1 Matilda Wine Company, LLC', state: 'CT', function: 'DTC', item: '', license: 'Asdfasdf', renewalDate: '04-28-2026', expiryDate: '', actionDays: 'Expired' },
  { name: '1 Matilda Wine Company, LLC', state: 'TTB', function: 'Operational', item: '', license: 'N/A', renewalDate: '07-11-2026', expiryDate: '', actionDays: 'Expired' },
  { name: '1 Matilda Wine Company, LLC', state: 'TTB', function: 'Operational', item: '', license: '12345', renewalDate: '07-07-2026', expiryDate: '', actionDays: 'Expired' },
  { name: '1 Matilda Wine Company, LLC', state: 'CA', function: 'Operational', item: '', license: '88888', renewalDate: '06-30-2026', expiryDate: '', actionDays: 'Expired' },
  { name: '1 Matilda Wine Company, LLC', state: 'CA', function: 'Operational', item: '', license: '54654654', renewalDate: '04-16-2026', expiryDate: '', actionDays: 'Expired' },
]

export default function App() {
  const [activeNav, setActiveNav] = useState('Dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [favorites, setFavorites] = useState(FAVORITE_COMPANIES_INIT)

  const toggleStar = (index: number) => {
    setFavorites(prev => prev.map((c, i) => i === index ? { ...c, starred: !c.starred } : c))
  }

  const setAlertStatus = (index: number, status: AlertStatus) => {
    setFavorites(prev => prev.map((c, i) => i === index ? { ...c, alertStatus: status } : c))
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-[#0f172a] text-slate-300 transition-all duration-300 ease-in-out flex-shrink-0 ${sidebarCollapsed ? 'w-[68px]' : 'w-[200px]'}`}
      >
        {/* Sidebar header */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700/60">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
              <rect x="1" y="1" width="6" height="6" rx="1.5" />
              <rect x="9" y="1" width="6" height="6" rx="1.5" />
              <rect x="1" y="9" width="6" height="6" rx="1.5" />
              <rect x="9" y="9" width="6" height="6" rx="1.5" />
            </svg>
          </div>
          {!sidebarCollapsed && (
            <span className="text-white font-semibold text-sm tracking-wide">CABINET</span>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV_ITEMS.map(({ icon: Icon, label }) => (
            <button
              key={label}
              onClick={() => setActiveNav(label)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors relative group ${
                activeNav === label
                  ? 'bg-indigo-600/20 text-white'
                  : 'text-slate-400 hover:bg-slate-700/40 hover:text-slate-200'
              }`}
            >
              {activeNav === label && (
                <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-500 rounded-r" />
              )}
              <Icon active={activeNav === label} />
              {!sidebarCollapsed && (
                <span className="font-medium truncate">{label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="flex items-center justify-center gap-2 px-4 py-4 border-t border-slate-700/60 text-slate-500 hover:text-slate-300 transition-colors text-xs"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <path d={sidebarCollapsed ? 'M4 2l5 5-5 5' : 'M10 2L5 7l5 5'} stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {!sidebarCollapsed && <span>Collapse</span>}
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="text-slate-400">←</span>
            <span>Dashboard</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 font-medium">Overview</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full font-medium">Staging Server</span>
            <button className="relative w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 1a5 5 0 0 1 5 5c0 3 1.5 4 1.5 4H1.5S3 9 3 6a5 5 0 0 1 5-5z" strokeLinecap="round" />
                <path d="M6.5 13a1.5 1.5 0 0 0 3 0" strokeLinecap="round" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold">HI</div>
              <span className="text-sm font-medium text-slate-700 hidden sm:block">Hammad Iftikhar</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Page title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-0.5">Compliance Management Overview</p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Active Licenses', value: '24', change: '+2 this month', color: 'bg-indigo-50 text-indigo-600' },
              { label: 'Expired', value: '5', change: 'Needs attention', color: 'bg-red-50 text-red-600' },
              { label: 'Renewing Soon', value: '12', change: 'Next 30 days', color: 'bg-amber-50 text-amber-600' },
              { label: 'Favorite Companies', value: '1', change: 'Pinned', color: 'bg-emerald-50 text-emerald-600' },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md mb-3 ${stat.color}`}>
                  {stat.change}
                </div>
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-sm text-slate-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* My Favorite Companies */}
          <div className="bg-white rounded-xl border border-slate-200 mb-5">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">My Favorite Companies</h2>
                <p className="text-xs text-slate-500 mt-0.5">Pinned for quick access</p>
              </div>
              <div className="flex items-center gap-2">
                <SearchInput placeholder="Search here…" />
                <Select placeholder="Company Type" />
                <Select placeholder="Filter By" />
                <Select placeholder="Status" />
                <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                  <GridViewIcon />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pl-4 pr-0 py-3 w-7" />
                    {['Company Name', 'Company Type', 'DBA', 'Status', 'Alerts'].map((h, i) => (
                      <th key={h} className={`text-left text-xs font-semibold text-slate-500 py-3 uppercase tracking-wide ${i === 0 ? 'pl-2 pr-5' : 'px-5'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {favorites.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="pl-4 pr-0 py-3.5">
                        <button
                          onClick={() => toggleStar(i)}
                          className="group flex items-center justify-center w-6 h-6 rounded-md hover:bg-amber-50 transition-colors"
                          title={c.starred ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <svg width="15" height="15" viewBox="0 0 15 15" fill={c.starred ? '#f59e0b' : 'none'} stroke={c.starred ? '#f59e0b' : '#94a3b8'} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="transition-all group-hover:scale-110">
                            <path d="M7.5 1.5l1.6 3.3 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z" />
                          </svg>
                        </button>
                      </td>
                      <td className="pl-2 pr-5 py-3.5">
                        <span className="text-sm font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer">{c.name}</span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">{c.type}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">{c.dba}</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <AlertDropdown
                          status={c.alertStatus}
                          onChange={(s) => setAlertStatus(i, s)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Renewals Due */}
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Renewals Due in the Next 30 Days</h2>
                <p className="text-xs text-slate-500 mt-0.5">{RENEWALS.length} items requiring action</p>
              </div>
              <div className="flex items-center gap-2">
                <SearchInput placeholder="Search here…" />
                <Select placeholder="Company" />
                <Select placeholder="License Type" />
                <Select placeholder="Function" />
                <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                  <GridViewIcon />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Company Name', 'State', 'Function', 'Item Name', 'License/Permit #', 'Renewal Due Date', 'Expiration Date', 'Action (Days)'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-slate-500 px-5 py-3 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {RENEWALS.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer">{r.name}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">{r.state}</span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">{r.function}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">{r.item || '—'}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-700 font-mono">{r.license}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-600">{r.renewalDate}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">{r.expiryDate || '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                          {r.actionDays}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end px-5 py-3.5 border-t border-slate-100">
              <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1">
                View All
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 7h10M8 3l4 4-4 4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 flex flex-col items-center gap-1 pb-4">
            <div className="flex items-center gap-1.5 text-slate-400">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" opacity="0.5">
                <path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zm1 11H9V9h2v4zm0-6H9V5h2v2z" />
              </svg>
              <span className="text-xs text-slate-400">www.dhwinecompliance.com</span>
            </div>
            <span className="text-xs text-slate-300">v 1.4.0</span>
          </div>
        </main>
      </div>
    </div>
  )
}

/* ── Mini components ─────────────────────────────────────────────── */

function AlertDropdown({ status, onChange }: { status: AlertStatus; onChange: (s: AlertStatus) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const badge =
    status === 'Pending'
      ? { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', dot: 'bg-amber-400' }
      : status === 'Work Stop'
      ? { label: 'Work Stop', bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', dot: 'bg-red-500' }
      : { label: 'No Alert', bg: 'bg-slate-50', text: 'text-slate-400', border: 'border-slate-200', dot: 'bg-slate-300' }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors hover:brightness-95 ${badge.bg} ${badge.text} ${badge.border}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${badge.dot}`} />
        {badge.label}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
          <path d="M2.5 4l2.5 2.5L7.5 4" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-50 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 w-44 text-sm">
          <button
            onClick={() => { onChange('Pending'); setOpen(false) }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 text-slate-700 transition-colors"
          >
            <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 2" />
                <circle cx="7" cy="7" r="2" fill="#f59e0b" />
              </svg>
            </span>
            Set to Pending
          </button>
          <button
            onClick={() => { onChange('Work Stop'); setOpen(false) }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 text-slate-700 transition-colors"
          >
            <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="#ef4444" strokeWidth="1.5" />
                <path d="M4.5 4.5l5 5M9.5 4.5l-5 5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
            Set to Work Stop
          </button>
          <div className="my-1 border-t border-slate-100" />
          <button
            onClick={() => { onChange(null); setOpen(false) }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 text-slate-500 transition-colors"
          >
            <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="#94a3b8" strokeWidth="1.5" />
                <path d="M4.5 7h5" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
            Clear Status
          </button>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Archived: 'bg-slate-100 text-slate-600 border-slate-200',
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Expired: 'bg-red-50 text-red-600 border-red-100',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${map[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  )
}

function SearchInput({ placeholder }: { placeholder: string }) {
  return (
    <div className="relative">
      <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="5" cy="5" r="3.5" />
        <path d="M8 8l2.5 2.5" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        placeholder={placeholder}
        className="pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 w-36 transition-all"
      />
    </div>
  )
}

function Select({ placeholder }: { placeholder: string }) {
  return (
    <select className="text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-500 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer">
      <option value="">{placeholder}</option>
    </select>
  )
}

function GridViewIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <rect x="1" y="1" width="5" height="5" rx="1" />
      <rect x="8" y="1" width="5" height="5" rx="1" />
      <rect x="1" y="8" width="5" height="5" rx="1" />
      <rect x="8" y="8" width="5" height="5" rx="1" />
    </svg>
  )
}

/* ── Sidebar icons ───────────────────────────────────────────────── */

function GridIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill={active ? '#818cf8' : 'currentColor'} className="flex-shrink-0">
      <rect x="1" y="1" width="6" height="6" rx="1.5" />
      <rect x="9" y="1" width="6" height="6" rx="1.5" />
      <rect x="1" y="9" width="6" height="6" rx="1.5" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" />
    </svg>
  )
}

function WineIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={active ? '#818cf8' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" className="flex-shrink-0">
      <path d="M5 2h6l-1 5a3 3 0 0 1-4 0L5 2z" />
      <path d="M8 7v7M5.5 14h5" />
    </svg>
  )
}

function BuildingIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={active ? '#818cf8' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
      <rect x="2" y="4" width="12" height="10" rx="1" />
      <path d="M5 14V8h6v6M8 4V2" />
    </svg>
  )
}

function PeopleIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={active ? '#818cf8' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" className="flex-shrink-0">
      <circle cx="6" cy="5" r="2.5" />
      <path d="M1 14c0-3 2-4.5 5-4.5s5 1.5 5 4.5" />
      <path d="M11 3a2.5 2.5 0 0 1 0 5M15 14c0-2.5-1.5-4-4-4" />
    </svg>
  )
}

function AgencyIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={active ? '#818cf8' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
      <path d="M2 14V7l6-5 6 5v7H2z" />
      <rect x="6" y="10" width="4" height="4" />
    </svg>
  )
}

function QueryIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={active ? '#818cf8' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" className="flex-shrink-0">
      <circle cx="7" cy="7" r="5" />
      <path d="M12.5 12.5L15 15" />
    </svg>
  )
}

function LicenseIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={active ? '#818cf8' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
      <rect x="3" y="2" width="10" height="12" rx="1.5" />
      <path d="M6 6h4M6 9h4M6 12h2" />
    </svg>
  )
}

function ReportIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={active ? '#818cf8' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
      <path d="M2 12V4l4 4 3-4 5 6" />
    </svg>
  )
}

function BulkIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={active ? '#818cf8' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
      <path d="M2 4h12M2 8h12M2 12h8" />
    </svg>
  )
}

function UsersIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={active ? '#818cf8' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" className="flex-shrink-0">
      <circle cx="8" cy="5" r="3" />
      <path d="M2 15c0-3.5 2.5-5.5 6-5.5s6 2 6 5.5" />
    </svg>
  )
}
