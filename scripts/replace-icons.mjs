/**
 * Replace high-confidence inline SVG icons with Lucide React.
 * Run: node scripts/replace-icons.mjs
 */
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')

const IMPORT_BLOCK = `import {
  LayoutGrid,
  Wine,
  Building2,
  Users,
  UserRound,
  Landmark,
  Filter,
  Search,
  FileText,
  BarChart3,
  List,
  Bell,
  X,
  Check,
  Star,
  Plus,
  Trash2,
  Pencil,
  Paperclip,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
  GripVertical,
  Columns3,
  Loader2,
  ArrowRight,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Info,
  CircleAlert,
  Download,
  Upload,
  Settings2,
  MoreHorizontal,
  Link2,
  SquareKanban,
  ExternalLink,
  Menu,
  Heart,
  Lock,
  RefreshCw,
  User,
  Home,
  Unlink,
  Copy,
  ListStart,
  ListEnd,
} from 'lucide-react'
`

/** Exact path `d` values (normalized) → Lucide name */
const PATH_MAP = [
  // Close
  ['M3 3l8 8M11 3l-8 8', 'X'],
  ['M4 4l8 8M12 4l-8 8', 'X'],
  ['M3.5 3.5l7 7M10.5 3.5l-7 7', 'X'],
  ['M2 2l6 6M8 2L2 8', 'X'],
  ['M2 2l6 6M8 2l-6 6', 'X'],
  // Check
  ['M2 5.2L4.2 7.5 8 2.5', 'Check'],
  ['M2 5.5L4.5 8 9 3', 'Check'],
  ['M2 6.5l2.5 2.5L10 3', 'Check'],
  // Chevron / arrow
  ['M2 4l4 4 4-4', 'ChevronDown'],
  ['M2 7l4-4 4 4', 'ChevronUp'],
  ['M2 7h10M8 3l4 4-4 4', 'ArrowRight'],
  ['M5 3l5 5-5 5', 'ChevronRight'],
  ['M5 3l4 4-4 4', 'ChevronRight'],
  ['M6 4l4 4-4 4', 'ChevronRight'],
  ['M9 3L4 8l5 5', 'ChevronLeft'],
  ['M9 3L5 7l4 4', 'ChevronLeft'],
  ['M3 5l4.5 4.5L12 5', 'ChevronDown'],
  ['M3.5 5.25L7 8.75l3.5-3.5', 'ChevronDown'],
  ['M3 4.5L6 7.5 9 4.5', 'ChevronDown'],
  ['M2.5 4L5 6.5 7.5 4', 'ChevronDown'],
  ['M2.5 6h7M6.5 3.5L9.5 6 6.5 8.5', 'ChevronRight'],
  // Plus
  ['M6 2.5v7M2.5 6h7', 'Plus'],
  // Pencil
  ['M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z', 'Pencil'],
  ['M8.5 1.5l2 2L3.5 10.5H1.5v-2L8.5 1.5z', 'Pencil'],
  ['M8.5 2.5l3 3L5 12H2v-3L8.5 2.5z', 'Pencil'],
  // Eye
  ['M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8z', 'Eye'],
  // Trash
  ['M2.5 3.5h9M5.5 3.5V2.5h3v1M4 3.5l.5 8h5l.5-8', 'Trash2'],
  ['M3 6h18 || M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2', 'Trash2'],
  // Paperclip
  ['M8.5 3.5l-4.2 4.2a2 2 0 0 0 2.8 2.8l4.6-4.6a1.5 1.5 0 0 0-2.1-2.1L5 8.4', 'Paperclip'],
  // List lines
  ['M2.5 4h11M2.5 8h11M2.5 12h11', 'List'],
  ['M2 4h12M2 8h12M2 12h8', 'List'],
  ['M2 4.5h12M2 8h12M2 11.5h8', 'List'],
  ['M3.5 3.5h9M3.5 6.5h9M3.5 9.5h6', 'List'],
  ['M3.5 4.5h9M3.5 8h9M3.5 11.5h6', 'List'],
  // Download / upload
  ['M7 2v7M4.5 6.5L7 9l2.5-2.5M2.5 11.5h9', 'Download'],
  ['M5 8V2M2.5 4.5L5 2l2.5 2.5', 'Upload'],
  // File
  ['M4 2.5h5.5L13 6v7.5H4V2.5z', 'FileText'],
  // Heart (favorites alt)
  ['M8 14s-5-3.2-5-7a3 3 0 0 1 5-2.2A3 3 0 0 1 13 7c0 3.8-5 7-5 7z', 'Heart'],
  ['M8 14s5-3.8 5-7.2A5 5 0 0 0 3 6.8C3 10.2 8 14 8 14z', 'Heart'],
  // Lock
  ['M8 11V7a4 4 0 0 1 8 0v4', 'Lock'],
  ['M5.5 7V5a2.5 2.5 0 0 1 5 0v2', 'Lock'],
  ['M8 5.5v3M8 10.5h.01', 'Info'],
  // Search
  ['M12.5 12.5L15 15', 'Search'],
  // Info footer
  ['M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zm1 11H9V9h2v4zm0-6H9V5h2v2z', 'Info'],
  // Spinner arc
  ['M22 12a10 10 0 0 0-10-10', 'Loader2'],
  // Star
  ['M7.5 1.5l1.6 3.3 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z', 'Star'],
  // Bell
  ['M8 1a5 5 0 0 1 5 5c0 3 1.5 4 1.5 4H1.5S3 9 3 6a5 5 0 0 1 5-5z', 'Bell'],
  // Logout
  ['M6 14H3.5A1.5 1.5 0 0 1 2 12.5v-9A1.5 1.5 0 0 1 3.5 2H6', 'LogOut'],
  // Refresh
  ['M2.5 8a5.5 5.5 0 0 1 9.4-3.9', 'RefreshCw'],
  // Building / home small
  ['M3 7.5h12v8H3zM5 7.5V4h8v3.5M6 11h.01M9 11h.01M12 11h.01', 'Building2'],
  // User
  ['M3.5 16c0-3 2.4-5 5.5-5s5.5 2 5.5 5', 'User'],
  // Misc remaining
  ['M5 2.5v5M2.5 5L5 7.5 7.5 5', 'ChevronDown'],
  ['M5.5 5.5l7 7', 'X'],
  ['M8 8l2.5 2.5', 'Check'],
  ['M7.5 2.5L4 6l3.5 3.5', 'ChevronLeft'],
  ['M3.5 8.5l3 3 6-6', 'Check'],
  ['M2.5 3.5L5 6l2.5-2.5', 'ChevronUp'],
  ['M3 4.5L6 7.5L9 4.5', 'ChevronDown'],
  ['M2.5 7.5L6 4l3.5 3.5', 'ChevronUp'],
  ['M5 7.5V2.5M2.5 5L5 2.5 7.5 5', 'Upload'],
  ['M12 3v3M12 18v3M4.2 4.2l2.1 2.1', 'Settings2'],
  ['M2 14V7l6-5 6 5v7H2z', 'Home'],
  ['M6 6h4M6 9h4M6 12h2', 'FileText'],
  ['M2 11l3.5-3 2.5 2.5L11 7.5l3 3.5', 'BarChart3'],
  ['M6.5 9.5l3-3M7 11.5l-1.5 1.5a2.5 2.5 0 01-3.5-3.5L3.5 8M9 4.5l1.5-1.5a2.5 2.5 0 013.5 3.5L12.5 8', 'Unlink'],
  ['M7 4h7M7 8h7M7 12h7M5 8H2m0 0l2-2M2 8l2 2', 'ListStart'],
  ['M7 4h7M7 8h7M7 12h7M2 8h3m0 0L3 6m2 2L3 10', 'ListEnd'],
  ['M6 3.5h8v1H6zm0 4h8v1H6zm0 4h8v1H6z', 'Menu'],
  ['M10.5 5.5V4.2A1.2 1.2 0 0 0 9.3 3H4.2A1.2 1.2 0 0 0 3 4.2v5.1A1.2 1.2 0 0 0 4.2 10.5H5.5', 'Copy'],
  ['M4 2h5l3 3v8.5a1.5 1.5 0 0 1-1.5 1.5h-6.5A1.5 1.5 0 0 1 2.5 13.5v-10A1.5 1.5 0 0 1 4 2z', 'FileText'],
  ['M5 2H2.5A1.5 1.5 0 0 0 1 3.5v6A1.5 1.5 0 0 0 2.5 11h6A1.5 1.5 0 0 0 10 9.5V7', 'ExternalLink'],
  ['M3 5.5A5 5 0 1 1 2.5 8', 'RefreshCw'],
  ['M3 12h3l2-4V4H2v4h3zm7 0h3l2-4V4H9v4h3z', 'Wine'],
]

function normalize(d) {
  return d.replace(/\s+/g, ' ').trim()
}

function extractAttrs(svg) {
  const width = Number((svg.match(/\bwidth="(\d+(?:\.\d+)?)"/) || [])[1] || 14)
  const className = (svg.match(/\bclassName="([^"]*)"/) || [])[1] || ''
  const ariaHidden = /\baria-hidden\b/.test(svg)
  const spin = /animate-spin/.test(svg) || /animate-spin/.test(className)
  return { size: Math.round(width), className, ariaHidden, spin }
}

function toJsx(name, attrs) {
  const classNames = [attrs.className, attrs.spin ? 'animate-spin' : ''].filter(Boolean).join(' ')
  const parts = [`size={${attrs.size}}`, 'strokeWidth={1.5}']
  if (classNames) parts.push(`className="${classNames}"`)
  if (attrs.ariaHidden || true) parts.push('aria-hidden')
  return `<${name} ${parts.join(' ')} />`
}

function replaceFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')
  if (content.includes("from 'lucide-react'")) {
    content = content.replace(/import \{[\s\S]*?\} from 'lucide-react'\n/, IMPORT_BLOCK)
  } else {
    const importEnd = content.lastIndexOf('\nimport ')
    if (importEnd >= 0) {
      const lineEnd = content.indexOf('\n', importEnd + 1)
      content = content.slice(0, lineEnd + 1) + IMPORT_BLOCK + content.slice(lineEnd + 1)
    } else {
      content = IMPORT_BLOCK + content
    }
  }

  let replaced = 0
  let left = 0

  content = content.replace(/<svg\b[\s\S]*?<\/svg>/g, (svg) => {
    if (svg.length > 900) {
      left++
      return svg
    }
    const ds = [...svg.matchAll(/\bd="([^"]+)"/g)].map(m => normalize(m[1]))
    const attrs = extractAttrs(svg)

    // 4-rect grid icon
    if ((svg.match(/<rect\b/g) || []).length >= 4 && !/<path\b/.test(svg)) {
      replaced++
      return toJsx('LayoutGrid', attrs)
    }

    // 6-dot grip
    if ((svg.match(/<circle\b/g) || []).length >= 6 && !/<path\b/.test(svg)) {
      replaced++
      return toJsx('GripVertical', attrs)
    }

    // Kanban 3 columns
    if ((svg.match(/<rect\b/g) || []).length === 3 && /width="3\.5"/.test(svg)) {
      replaced++
      return toJsx('SquareKanban', attrs)
    }

    // Spinner with opacity circle
    if (attrs.spin || (/opacity="0\.25"/.test(svg) && ds.some(d => d.includes('M22 12')))) {
      replaced++
      return toJsx('Loader2', { ...attrs, spin: true })
    }

    // Eye off (slash + eye)
    if (ds.some(d => d.includes('M2 2l12 12')) && ds.some(d => /s2\.5-4\.5|6\.5-4\.5/.test(d) || d.includes('M1.5 8'))) {
      replaced++
      return toJsx('EyeOff', attrs)
    }

    // Lucide-style trash (multiple paths starting with M3 6h18)
    if (ds.some(d => d === 'M3 6h18') && ds.some(d => d.includes('M8 6V4') || d.includes('M19 6v14'))) {
      replaced++
      return toJsx('Trash2', attrs)
    }

    // Dynamic favorite star → Lucide Star (preserve fill/stroke attrs roughly)
    if (ds.some(d => d.includes('M7.5 1.5l1.6 3.3'))) {
      const fillExpr = (svg.match(/\bfill=\{([^}]+)\}/) || [])[1]
      const strokeExpr = (svg.match(/\bstroke=\{([^}]+)\}/) || svg.match(/\bstroke="([^"]+)"/) || [])[1]
      const cls = attrs.className ? ` className="${attrs.className}"` : ''
      replaced++
      if (fillExpr) {
        return `<Star size={${attrs.size}} strokeWidth={1.4}${cls} fill={${fillExpr}} stroke={${strokeExpr || fillExpr}} aria-hidden />`
      }
      return toJsx('Star', attrs)
    }

    // Prefer longer path keys first
    const ranked = [...PATH_MAP].sort((a, b) => b[0].length - a[0].length)
    for (const [pathD, name] of ranked) {
      const needle = normalize(pathD)
      // Multi-path keys joined with ||
      if (needle.includes('||')) {
        const parts = needle.split('||').map(p => p.trim())
        if (parts.every(p => ds.some(d => d === p || d.includes(p)))) {
          replaced++
          return toJsx(name, attrs)
        }
        continue
      }
      if (ds.some(d => d === needle || d.includes(needle))) {
        if (name === 'Search' && !/<circle\b/.test(svg)) continue
        if (name === 'X' && ds.some(d => d.includes('M1.5 8'))) continue
        replaced++
        return toJsx(name, attrs)
      }
    }

    left++
    return svg
  })

  // Replace sidebar icon helper functions wholesale
  content = content.replace(
    /function GridViewIcon\(\) \{[\s\S]*?\n\}\n\n\/\* ── Sidebar icons[\s\S]*?\nfunction UsersIcon\(\{ active \}: \{ active: boolean \}\) \{[\s\S]*?\n\}\n?$/,
    `function GridViewIcon() {
  return <LayoutGrid size={14} strokeWidth={1.5} aria-hidden />
}

/* ── Sidebar icons (Lucide) ──────────────────────────────────────── */

function navStroke(active: boolean) {
  return active ? '#12518c' : 'currentColor'
}

function GridIcon({ active }: { active: boolean }) {
  return <LayoutGrid size={16} color={navStroke(active)} strokeWidth={1.5} className="flex-shrink-0" aria-hidden />
}

function WineIcon({ active }: { active: boolean }) {
  return <Wine size={16} color={navStroke(active)} strokeWidth={1.5} className="flex-shrink-0" aria-hidden />
}

function BuildingIcon({ active }: { active: boolean }) {
  return <Building2 size={16} color={navStroke(active)} strokeWidth={1.5} className="flex-shrink-0" aria-hidden />
}

function PeopleIcon({ active }: { active: boolean }) {
  return <Users size={16} color={navStroke(active)} strokeWidth={1.5} className="flex-shrink-0" aria-hidden />
}

function AgencyIcon({ active }: { active: boolean }) {
  return <Landmark size={16} color={navStroke(active)} strokeWidth={1.5} className="flex-shrink-0" aria-hidden />
}

function PipelineIcon({ active }: { active: boolean }) {
  return <Filter size={16} color={navStroke(active)} strokeWidth={1.5} className="flex-shrink-0" aria-hidden />
}

function QueryIcon({ active }: { active: boolean }) {
  return <Search size={16} color={navStroke(active)} strokeWidth={1.5} className="flex-shrink-0" aria-hidden />
}

function LicenseIcon({ active }: { active: boolean }) {
  return <FileText size={16} color={navStroke(active)} strokeWidth={1.5} className="flex-shrink-0" aria-hidden />
}

function ReportIcon({ active }: { active: boolean }) {
  return <BarChart3 size={16} color={navStroke(active)} strokeWidth={1.5} className="flex-shrink-0" aria-hidden />
}

function BulkIcon({ active }: { active: boolean }) {
  return <List size={16} color={navStroke(active)} strokeWidth={1.5} className="flex-shrink-0" aria-hidden />
}

function UsersIcon({ active }: { active: boolean }) {
  return <UserRound size={16} color={navStroke(active)} strokeWidth={1.5} className="flex-shrink-0" aria-hidden />
}
`,
  )

  fs.writeFileSync(filePath, content)
  return { replaced, left }
}

for (const rel of ['src/App.tsx', 'src/LoginPage.tsx']) {
  const full = path.join(root, rel)
  const { replaced, left } = replaceFile(full)
  console.log(`${rel}: replaced≈${replaced}, remaining svg≈${left}`)
}
