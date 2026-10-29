import { useState } from 'react'

const API = 'http://localhost:8080/api/auth'

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setMessage('')
    setBusy(true)

    try {
      const registering = mode === 'register'
      const response = await fetch(`${API}/${registering ? 'register' : 'login'}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          registering
            ? { username, email, password }
            : { usernameOrEmail: username, password }
        )
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Request failed')
      }

      if (registering) {
        setMode('login')
        setMessage('Account created. Please sign in.')
      } else {
        onLogin(data)
      }
    } catch (error) {
      setMessage(error.message || 'Could not connect to the server.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand"><img src="/medislot-medical-logo.png" alt="MediSlot medical logo" /><span>MediSlot</span></div>
        <p className="auth-eyebrow">YOUR HEALTH, ON SCHEDULE</p>
        <h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
        <p className="auth-subtitle">
          {mode === 'login'
            ? 'Sign in to manage your appointments.'
            : 'Register to start booking appointments.'}
        </p>

        <div className="auth-tabs">
          <button type="button" className={mode === 'login' ? 'active' : ''}
            onClick={() => { setMode('login'); setMessage('') }}>Sign in</button>
          <button type="button" className={mode === 'register' ? 'active' : ''}
            onClick={() => { setMode('register'); setMessage('') }}>Register</button>
        </div>

        <form onSubmit={submit} className="auth-form">
          {mode === 'register' && (
            <>
              <label>Username</label>
              <input value={username} onChange={e => setUsername(e.target.value)}
                minLength={3} maxLength={50} required autoComplete="username"
                placeholder="Choose a username" />
              <label>Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                maxLength={150} required autoComplete="email"
                placeholder="you@example.com" />
            </>
          )}
          {mode === 'login' && (
            <>
              <label>Username or email</label>
              <input value={username} onChange={e => setUsername(e.target.value)}
                maxLength={150} required autoComplete="username"
                placeholder="Enter username or email" />
            </>
          )}
          <label>Password</label>
          <input type="password" value={password}
            onChange={e => setPassword(e.target.value)}
            minLength={8} maxLength={72} required
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            placeholder="At least 8 characters" />
          {message && <p className="auth-message" role="status">{message}</p>}
          <button className="auth-submit" type="submit" disabled={busy}>
            {busy ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="auth-footer">Secure appointment scheduling with MediSlot</p>
      </section>
    </main>
  )
}

import './AuthPage.css'

