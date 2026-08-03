import { useState, type FormEvent, type ReactNode } from 'react'
import cabinetLogo from './assets/cabinet-logo.png'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type View = 'login' | 'forgot'

const inputBase =
  'w-full px-4 py-2.5 text-sm rounded-xl border bg-white text-slate-800 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400'
const inputOk = 'border-slate-300 focus:ring-[#12518c]/25 focus:border-[#12518c]'
const inputErr = 'border-red-400 focus:ring-red-300/40 focus:border-red-400'

function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#eceef0] font-sans">
      <div className="bg-[#c0524d] text-white text-xs font-medium text-center py-1.5 tracking-wide flex-shrink-0">
        Compliance Cabinet Staging Server
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-[1000px] bg-white rounded-[28px] shadow-[0_25px_60px_-15px_rgba(15,42,72,0.25)] p-3 flex flex-col md:flex-row gap-3">
          <div className="relative md:w-[44%] flex-shrink-0 rounded-[22px] overflow-hidden bg-gradient-to-br from-[#2f6fd0] via-[#1d5cb4] to-[#0d3d6b] text-white flex flex-col justify-between px-9 py-10 min-h-[280px] md:min-h-[560px]">
            <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-[#5f95e8]/40 blur-3xl pointer-events-none" />
            <div className="absolute top-1/3 -left-24 w-80 h-80 rounded-full bg-[#0a2f55]/50 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-28 right-0 w-96 h-96 rounded-full bg-[#4f86dd]/30 blur-3xl pointer-events-none" />

            <div className="relative">
              <p className="text-xs text-blue-100/80 mb-3 tracking-wide">You can easily</p>
              <h1 className="text-[30px] leading-tight font-semibold">
                Manage all your compliance in one place
              </h1>
              <p className="text-sm text-blue-100/90 mt-4">
                Total Compliance Service Provider — please use your credentials to login.
              </p>
            </div>

            <div className="relative">
              <p className="text-xs text-blue-200/80">Powered by</p>
              <p className="text-sm font-semibold text-white/90 mt-1">dh wine compliance</p>
              <p className="text-[11px] text-blue-200/70 mt-1">www.dhwinecompliance.com</p>
            </div>
          </div>

          <div className="flex-1 px-6 sm:px-12 py-10 flex flex-col justify-center">
            <img
              src={cabinetLogo}
              alt="Cabinet Compliance Management Software"
              className="h-16 w-auto object-contain self-center mb-6"
            />
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [view, setView] = useState<View>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState({ email: false, password: false })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [recoverySent, setRecoverySent] = useState(false)

  const emailError =
    email.trim() === ''
      ? 'Email is required'
      : !EMAIL_RE.test(email.trim())
      ? 'Enter a valid email address'
      : null
  const passwordError = password === '' ? 'Password is required' : null

  const showEmailError = (touched.email || submitted) && emailError
  const showPasswordError = (touched.password || submitted) && passwordError

  const resetFormState = () => {
    setSubmitted(false)
    setTouched({ email: false, password: false })
    setRecoverySent(false)
  }

  const switchToLogin = () => {
    setView('login')
    resetFormState()
  }

  const switchToForgot = () => {
    setView('forgot')
    resetFormState()
  }

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (emailError || passwordError) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onLogin()
    }, 900)
  }

  const handleForgotSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (emailError) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setRecoverySent(true)
    }, 900)
  }

  if (view === 'forgot') {
    return (
      <AuthShell>
        <h2 className="text-[26px] font-semibold text-slate-900 tracking-tight text-center">Forgot Password</h2>
        <p className="text-sm text-slate-500 mt-1 mb-7 text-center">
          {recoverySent
            ? 'Check your inbox for a recovery link.'
            : 'Enter your email and we will send you a recovery link.'}
        </p>

        {recoverySent ? (
          <div className="w-full max-w-[360px] self-center space-y-4">
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 text-center">
              Recovery email sent to <span className="font-semibold">{email}</span>
            </div>
            <button
              type="button"
              onClick={switchToLogin}
              className="w-full py-2.5 rounded-xl bg-[#12518c] text-white text-sm font-semibold hover:bg-[#0e4576] transition-colors"
            >
              Back to Log in
            </button>
          </div>
        ) : (
          <form onSubmit={handleForgotSubmit} noValidate className="space-y-5 w-full max-w-[360px] self-center">
            <div>
              <label htmlFor="forgot-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                E-mail
              </label>
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={e => setEmail(e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, email: true }))}
                disabled={loading}
                aria-invalid={!!showEmailError}
                aria-describedby={showEmailError ? 'forgot-email-error' : undefined}
                placeholder="Enter your email…"
                className={`${inputBase} ${showEmailError ? inputErr : inputOk}`}
              />
              {showEmailError && (
                <p id="forgot-email-error" className="text-xs text-red-500 mt-1.5">{emailError}</p>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={switchToLogin}
                className="text-sm font-semibold text-[#12518c] hover:text-[#0d3d6b] hover:underline transition-colors whitespace-nowrap"
              >
                Log In?
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-[#12518c] text-white text-sm font-semibold hover:bg-[#0e4576] active:bg-[#0d3d6b] transition-colors focus:outline-none focus:ring-2 focus:ring-[#12518c]/40 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {loading && (
                  <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                    <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                )}
                {loading ? 'Sending…' : 'Send Recovery Email'}
              </button>
            </div>
          </form>
        )}
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <h2 className="text-[26px] font-semibold text-slate-900 tracking-tight text-center">Welcome Back</h2>
      <p className="text-sm text-slate-500 mt-1 mb-7 text-center">Please log in to your account to continue.</p>

      <form onSubmit={handleLoginSubmit} noValidate className="space-y-4 w-full max-w-[360px] self-center">
        <div>
          <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={e => setEmail(e.target.value)}
            onBlur={() => setTouched(t => ({ ...t, email: true }))}
            disabled={loading}
            aria-invalid={!!showEmailError}
            aria-describedby={showEmailError ? 'login-email-error' : undefined}
            placeholder="Enter your email…"
            className={`${inputBase} ${showEmailError ? inputErr : inputOk}`}
          />
          {showEmailError && (
            <p id="login-email-error" className="text-xs text-red-500 mt-1.5">{emailError}</p>
          )}
        </div>

        <div>
          <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, password: true }))}
              disabled={loading}
              aria-invalid={!!showPasswordError}
              aria-describedby={showPasswordError ? 'login-password-error' : undefined}
              placeholder="Enter your password…"
              className={`${inputBase} pr-11 ${showPasswordError ? inputErr : inputOk}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(s => !s)}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z" />
                  <circle cx="8" cy="8" r="2" />
                  <path d="M2.5 2.5l11 11" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z" />
                  <circle cx="8" cy="8" r="2" />
                </svg>
              )}
            </button>
          </div>
          {showPasswordError && (
            <p id="login-password-error" className="text-xs text-red-500 mt-1.5">{passwordError}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-1 py-2.5 rounded-xl bg-[#12518c] text-white text-sm font-semibold hover:bg-[#0e4576] active:bg-[#0d3d6b] transition-colors focus:outline-none focus:ring-2 focus:ring-[#12518c]/40 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && (
            <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
              <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          )}
          {loading ? 'Logging in…' : 'Log in'}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={switchToForgot}
            className="text-xs font-semibold text-[#12518c] hover:text-[#0d3d6b] hover:underline transition-colors"
          >
            Forgot Password?
          </button>
        </div>
      </form>
    </AuthShell>
  )
}
