import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ChevronDown, LogOut, User, Settings } from "lucide-react"
import { useAuth } from "../../context/AuthContext"

export default function Navbar() {
  const { currentUser, logout } = useAuth()
  const location  = useLocation()
  const navigate  = useNavigate()
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [dropdown,  setDropdown]  = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setDropdown(false)
  }, [location.pathname])

  const handleLogout = async () => {
    try { await logout(); navigate("/") } catch (e) { console.error(e) }
  }

  const navLinks = currentUser
    ? [
        { to: "/dashboard", label: "Dashboard" },
        { to: "/detect",    label: "Detect" },
        { to: "/history",   label: "History" },
        { to: "/community", label: "Community" },
      ]
    : [
        { to: "/#features",     label: "Features" },
        { to: "/#how-it-works", label: "About" },
        { to: "/community",     label: "Community" },
      ]

  const isActive = (path) => location.pathname === path
  const avatarLetter = (currentUser?.displayName || currentUser?.email || "U")[0].toUpperCase()

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          transition: "all 300ms ease",
          backgroundColor: scrolled
            ? "color-mix(in oklch, var(--color-bg) 88%, transparent)"
            : "transparent",
          backdropFilter:       scrolled ? "blur(20px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid var(--color-border)" : "1px solid transparent",
          boxShadow:    scrolled ? "var(--shadow-sm)" : "none",
        }}
      >
        <div style={{
          maxWidth: 1940, margin: "0 auto", padding: "0 24px",
          height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>

          {/* ── Logo (Left) — Text only, no icon ── */}
          <Link to="/" style={{ textDecoration: "none" }}>
            <span style={{
              fontFamily: "'Calisto MT', 'Crimson Text', Georgia, serif",
              fontWeight: 700, fontSize: 22, letterSpacing: "-0.01em",
              color: "var(--color-text)",
            }}>
              TriAffect
            </span>
          </Link>

          {/* ── Desktop Nav Links (Center) ── */}
          <ul style={{
            display: currentUser ? "none" : "flex", alignItems: "center", gap: 6,
            listStyle: "none", margin: 0, padding: 0, position: "absolute",
            left: "50%", transform: "translateX(-50%)",
          }} className={currentUser ? "hidden" : "hidden md:flex"}>
            {navLinks.map((link) => (
              <li key={link.to} style={{ margin: 0, padding: 0 }}>
                <Link
                  to={link.to}
                  style={{
                    display: "block", padding: "8px 20px", borderRadius: 9999,
                    fontSize: 15, fontWeight: 500, textDecoration: "none",
                    fontFamily: "'Calisto MT', 'Crimson Text', Georgia, serif",
                    transition: "all 200ms ease",
                    color: isActive(link.to) ? "var(--color-primary)" : "var(--color-text-muted)",
                    background: isActive(link.to)
                      ? "color-mix(in oklch, var(--color-primary) 10%, transparent)"
                      : "transparent",
                  }}
                  onMouseEnter={e => {
                    if (!isActive(link.to)) {
                      e.currentTarget.style.color      = "var(--color-text)"
                      e.currentTarget.style.background = "var(--color-surface-2)"
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive(link.to)) {
                      e.currentTarget.style.color      = "var(--color-text-muted)"
                      e.currentTarget.style.background = "transparent"
                    }
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* ── Right Actions ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

            {currentUser ? (
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setDropdown(!dropdown)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "4px 12px 4px 6px", borderRadius: 9999,
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    cursor: "pointer", transition: "all 200ms ease",
                  }}
                >
                  {currentUser.photoURL ? (
                    <img src={currentUser.photoURL} alt="avatar" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }} />
                  ) : (
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "var(--color-primary)", color: "white",
                      fontSize: 12, fontWeight: 700,
                    }}>
                      {avatarLetter}
                    </div>
                  )}
                  <motion.div animate={{ rotate: dropdown ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={14} style={{ color: "var(--color-text-muted)" }} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {dropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        position: "absolute", right: 0, top: "calc(100% + 8px)",
                        width: 220, borderRadius: 16, padding: 6, zIndex: 50,
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        boxShadow: "var(--shadow-lg)",
                      }}
                    >
                      <div style={{ padding: "8px 12px", marginBottom: 4 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)", fontFamily: "'Calisto MT', Georgia, serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {currentUser.displayName || "User"}
                        </p>
                        <p style={{ fontSize: 12, color: "var(--color-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {currentUser.email}
                        </p>
                      </div>
                      <div style={{ height: 1, background: "var(--color-border)", margin: "2px 0" }} />

                      {[
                        { to: "/profile",  icon: User,     label: "Profile" },
                        { to: "/settings", icon: Settings, label: "Settings" },
                      ].map(({ to, icon: Icon, label }) => (
                        <Link key={to} to={to} style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "8px 12px", borderRadius: 10,
                          fontSize: 14, fontWeight: 500, textDecoration: "none",
                          fontFamily: "'Calisto MT', Georgia, serif",
                          color: "var(--color-text-muted)", transition: "all 150ms ease",
                        }}
                          onMouseEnter={e => { e.currentTarget.style.background = "var(--color-surface-2)"; e.currentTarget.style.color = "var(--color-text)" }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--color-text-muted)" }}
                        >
                          <Icon size={14} /> {label}
                        </Link>
                      ))}

                      <div style={{ height: 1, background: "var(--color-border)", margin: "2px 0" }} />
                      <button onClick={handleLogout} style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 10,
                        padding: "8px 12px", borderRadius: 10, textAlign: "left",
                        fontSize: 14, fontWeight: 500, color: "var(--color-error)",
                        fontFamily: "'Calisto MT', Georgia, serif",
                        cursor: "pointer", transition: "background 150ms ease",
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = "color-mix(in oklch, var(--color-error) 8%, transparent)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }} className="hidden md:flex">
                <Link to="/login" style={{ textDecoration: "none" }}>
                  <button style={{
                    padding: "10px 24px", borderRadius: 9999,
                    fontSize: 15, fontWeight: 600,
                    fontFamily: "'Calisto MT', 'Crimson Text', Georgia, serif",
                    background: "transparent", color: "var(--color-text)",
                    border: "1px solid var(--color-border)",
                    cursor: "pointer", transition: "all 200ms ease",
                  }}>
                    Log in
                  </button>
                </Link>
                <Link to="/register" style={{ textDecoration: "none" }}>
                  <button style={{
                    padding: "10px 24px", borderRadius: 9999,
                    fontSize: 15, fontWeight: 600, color: "white",
                    fontFamily: "'Calisto MT', 'Crimson Text', Georgia, serif",
                    background: "var(--color-primary)",
                    border: "none", cursor: "pointer",
                    transition: "all 200ms ease",
                  }}>
                    Get Started
                  </button>
                </Link>
              </div>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                width: 36, height: 36, borderRadius: 10,
                display: "none", alignItems: "center", justifyContent: "center",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text)", cursor: "pointer",
              }}
              className="md:hidden flex"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "fixed", top: 64, left: 0, right: 0, zIndex: 40,
              padding: "12px 24px", display: "flex", flexDirection: "column", gap: 4,
              background: "color-mix(in oklch, var(--color-bg) 95%, transparent)",
              backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            {navLinks.map((link, i) => (
              <motion.div key={link.to}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link to={link.to} style={{
                  display: "block", padding: "10px 16px", borderRadius: 10,
                  fontSize: 15, fontWeight: 500, textDecoration: "none",
                  fontFamily: "'Calisto MT', Georgia, serif",
                  color: isActive(link.to) ? "var(--color-primary)" : "var(--color-text-muted)",
                  background: isActive(link.to) ? "color-mix(in oklch, var(--color-primary) 10%, transparent)" : "transparent",
                }}>
                  {link.label}
                </Link>
              </motion.div>
            ))}

            <div style={{ height: 1, background: "var(--color-border)", margin: "4px 0" }} />

            {currentUser ? (
              <button onClick={handleLogout} style={{
                padding: "10px 16px", borderRadius: 10, textAlign: "left",
                fontSize: 15, fontWeight: 500, color: "var(--color-error)",
                fontFamily: "'Calisto MT', Georgia, serif", cursor: "pointer",
              }}>
                Sign Out
              </button>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <Link to="/login" style={{ textDecoration: "none" }}>
                  <button style={{
                    width: "100%", padding: "10px 16px", borderRadius: 10,
                    fontSize: 15, fontWeight: 500, textAlign: "center",
                    fontFamily: "'Calisto MT', Georgia, serif",
                    border: "1px solid var(--color-border)", color: "var(--color-text)",
                    background: "transparent", cursor: "pointer",
                  }}>
                    Log in
                  </button>
                </Link>
                <Link to="/register" style={{ textDecoration: "none" }}>
                  <button style={{
                    width: "100%", padding: "10px 16px", borderRadius: 10,
                    fontSize: 15, fontWeight: 600, textAlign: "center",
                    fontFamily: "'Calisto MT', Georgia, serif",
                    color: "white", background: "var(--color-primary)",
                    border: "none", cursor: "pointer",
                  }}>
                    Get Started
                  </button>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
