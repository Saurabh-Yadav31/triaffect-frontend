import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Brain, Mail, Lock, ArrowRight, Loader2 } from "lucide-react"
import { useAuth } from "../context/AuthContext"

const FONT = "'Calisto MT', 'Crimson Text', Georgia, serif"

export default function Login() {
  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await login(email, password)
      navigate("/dashboard")
    } catch (err) {
      setError("Failed to sign in. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError("")
    setLoading(true)
    try {
      await loginWithGoogle()
      navigate("/dashboard")
    } catch (err) {
      setError("Failed to sign in with Google.")
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "calc(100vh - 80px)", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "40px 24px", fontFamily: FONT,
      background: "linear-gradient(135deg, var(--color-bg) 0%, var(--color-surface-offset) 100%)",
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: "100%", maxWidth: 460, padding: 48,
          background: "var(--color-surface)", borderRadius: 32,
          border: "1px solid color-mix(in oklch, var(--color-border) 40%, transparent)",
          boxShadow: "0 24px 60px -16px rgba(28, 28, 22, 0.1)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: "0 auto 24px",
            background: "color-mix(in oklch, var(--color-primary) 10%, transparent)",
            border: "1px solid color-mix(in oklch, var(--color-primary) 20%, transparent)",
            display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-primary)",
          }}>
            <Brain size={28} />
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "var(--color-text)", letterSpacing: "-0.02em", marginBottom: 12 }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 16, color: "var(--color-text-muted)" }}>
            Log in to continue your emotional journey.
          </p>
        </div>

        {error && (
          <div style={{
            padding: "14px 18px", borderRadius: 12, marginBottom: 24,
            background: "color-mix(in oklch, var(--color-error) 10%, transparent)",
            border: "1px solid color-mix(in oklch, var(--color-error) 20%, transparent)",
            color: "var(--color-error)", fontSize: 14, fontWeight: 500, textAlign: "center",
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 28 }}>
          <div>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--color-text)", marginBottom: 8 }}>Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: "100%", padding: "14px 16px 14px 46px", borderRadius: 12,
                  background: "var(--color-bg)", border: "1px solid var(--color-border)",
                  fontSize: 16, fontFamily: FONT, color: "var(--color-text)", outline: "none",
                  transition: "all 0.2s ease"
                }}
                onFocus={e => { e.currentTarget.style.borderColor = "var(--color-primary)"; e.currentTarget.style.boxShadow = "0 0 0 3px color-mix(in oklch, var(--color-primary) 15%, transparent)" }}
                onBlur={e => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.boxShadow = "none" }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)" }}>Password</label>
              <Link to="#" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-primary)", textDecoration: "none" }}>Forgot password?</Link>
            </div>
            <div style={{ position: "relative" }}>
              <Lock size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
              <input
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%", padding: "14px 16px 14px 46px", borderRadius: 12,
                  background: "var(--color-bg)", border: "1px solid var(--color-border)",
                  fontSize: 16, fontFamily: FONT, color: "var(--color-text)", outline: "none",
                  transition: "all 0.2s ease"
                }}
                onFocus={e => { e.currentTarget.style.borderColor = "var(--color-primary)"; e.currentTarget.style.boxShadow = "0 0 0 3px color-mix(in oklch, var(--color-primary) 15%, transparent)" }}
                onBlur={e => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.boxShadow = "none" }}
              />
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            style={{
              width: "100%", padding: "16px", borderRadius: 12, marginTop: 8,
              background: "var(--color-primary)", color: "white",
              fontSize: 16, fontWeight: 600, fontFamily: FONT,
              border: "none", cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.2s ease",
              boxShadow: "0 4px 16px color-mix(in oklch, var(--color-primary) 25%, transparent)",
            }}
            onMouseEnter={e => { if(!loading) e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px color-mix(in oklch, var(--color-primary) 30%, transparent)" }}
            onMouseLeave={e => { if(!loading) e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px color-mix(in oklch, var(--color-primary) 25%, transparent)" }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <>Log in <ArrowRight size={18} /></>}
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
          <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
          <span style={{ fontSize: 13, color: "var(--color-text-faint)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>Or continue with</span>
          <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
        </div>

        <button
          onClick={handleGoogleSignIn} disabled={loading}
          style={{
            width: "100%", padding: "14px", borderRadius: 12,
            background: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            fontSize: 16, fontWeight: 600, fontFamily: FONT, color: "var(--color-text)",
            cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
            transition: "all 0.2s ease"
          }}
          onMouseEnter={e => { if(!loading) e.currentTarget.style.background = "var(--color-surface-offset)" }}
          onMouseLeave={e => { if(!loading) e.currentTarget.style.background = "var(--color-bg)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </button>

        <p style={{ textAlign: "center", marginTop: 32, fontSize: 15, color: "var(--color-text-muted)" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ fontWeight: 600, color: "var(--color-primary)", textDecoration: "none" }}>
            Create one now
          </Link>
        </p>

      </motion.div>
    </div>
  )
}