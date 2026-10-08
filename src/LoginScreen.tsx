import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function LoginScreen() {
  const [error, setError] = useState<string | null>(null)
  const [signingIn, setSigningIn] = useState(false)

  async function signInWithGoogle() {
    if (!supabase) return
    setSigningIn(true)
    setError(null)
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (oauthError) {
      setError(oauthError.message)
      setSigningIn(false)
    }
    // On success the browser redirects to Google; no further state changes needed here.
  }

  return (
    <div className="login-screen">
      <div className="card login-card">
        <h1>Email Template Generator</h1>
        <p className="login-tagline">
          Store reusable email templates and generate finished emails from them.
        </p>
        <button className="btn btn-primary" onClick={signInWithGoogle} disabled={signingIn}>
          {signingIn ? 'Redirecting…' : 'Sign in with Google'}
        </button>
        {error && <p className="login-error">{error}</p>}
      </div>
    </div>
  )
}
