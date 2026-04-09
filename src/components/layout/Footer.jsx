import { Link } from "react-router-dom"

const FONT = "'Calisto MT', 'Crimson Text', Georgia, serif"

export default function Footer() {
  return (
    <footer style={{
      width: "100%",
      backgroundColor: "var(--color-bg)",
      borderTop: "1px solid color-mix(in oklch, var(--color-border) 30%, transparent)",
      fontFamily: FONT,
    }}>

      {/* Main footer content */}
      <div style={{
        maxWidth: 1400, margin: "0 auto", padding: "56px 40px",
        display: "flex", flexWrap: "wrap",
        justifyContent: "space-between", alignItems: "flex-start",
        gap: 48,
      }}>

        {/* Brand column */}
        <div style={{ maxWidth: 340 }}>
          <span style={{
            fontFamily: FONT, fontSize: 22, fontWeight: 700,
            color: "var(--color-text)", display: "block", marginBottom: 16,
          }}>
            TriAffect
          </span>
          <p style={{
            fontSize: 15, lineHeight: 1.8,
            color: "var(--color-text-muted)",
          }}>
            An AI-powered emotion intelligence platform. Designed for empathy, built for resilience.
          </p>
        </div>

        {/* Links columns */}
        <div style={{ display: "flex", gap: 80, flexWrap: "wrap" }}>

          {/* Platform */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <span style={{
              fontSize: 16, fontWeight: 700, color: "var(--color-text)",
              fontFamily: FONT, marginBottom: 4,
            }}>
              Platform
            </span>
            {[
              { label: "Core Detection", to: "/detect" },
              { label: "Activity Log", to: "/history" },
              { label: "Community", to: "/community" },
            ].map(({ label, to }) => (
              <Link key={label} to={to} style={{
                fontSize: 15, color: "var(--color-text-muted)",
                textDecoration: "none", fontFamily: FONT,
                transition: "color 0.2s ease",
              }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--color-text)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--color-text-muted)"}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Legal */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <span style={{
              fontSize: 16, fontWeight: 700, color: "var(--color-text)",
              fontFamily: FONT, marginBottom: 4,
            }}>
              Legal
            </span>
            {[
              { label: "Privacy Policy", to: "#" },
              { label: "Terms of Service", to: "#" },
              { label: "Contact Us", to: "#" },
            ].map(({ label, to }) => (
              <Link key={label} to={to} style={{
                fontSize: 15, color: "var(--color-text-muted)",
                textDecoration: "none", fontFamily: FONT,
                transition: "color 0.2s ease",
              }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--color-text)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--color-text-muted)"}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div style={{
        maxWidth: 1400, margin: "0 auto", padding: "24px 40px",
        borderTop: "1px solid color-mix(in oklch, var(--color-border) 20%, transparent)",
        fontSize: 14, color: "var(--color-text-faint)",
        fontFamily: FONT,
      }}>
        © {new Date().getFullYear()} TriAffect Intelligence Inc. All rights reserved.
      </div>
    </footer>
  )
}
