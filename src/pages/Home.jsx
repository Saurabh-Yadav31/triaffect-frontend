import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowRight, Brain, Mic, PenLine, ScanFace, Check, Smartphone,
  Shield, Users, HeartPulse,
} from "lucide-react"

/* ─── animation helpers ─── */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
}

const cardHoverIn = (e) => {
  e.currentTarget.style.transform = "translateY(-4px)"
  e.currentTarget.style.boxShadow = "0 20px 40px -12px rgba(28, 28, 22, 0.12)"
}
const cardHoverOut = (e) => {
  e.currentTarget.style.transform = "translateY(0)"
  e.currentTarget.style.boxShadow = "0 1px 3px rgba(28, 28, 22, 0.06)"
}

/* ─── shared inline styles ─── */

const FONT = "'Calisto MT', 'Crimson Text', Georgia, serif"

const S = {
  heading: {
    fontFamily: FONT,
    fontWeight: 700,
    letterSpacing: "-0.02em",
    color: "var(--color-text)",
  },
  body: {
    fontFamily: FONT,
    fontSize: 16,
    lineHeight: 1.75,
    color: "var(--color-text-muted)",
    fontWeight: 400,
  },
  caption: {
    fontFamily: FONT,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "var(--color-text-faint)",
  },
  sectionPad: { padding: "80px 24px" },
  maxW: { maxWidth: 1400, margin: "0 auto", padding: "0 32px" },
  card: {
    background: "var(--color-surface)",
    borderRadius: 20,
    border: "1px solid color-mix(in oklch, var(--color-border) 30%, transparent)",
    boxShadow: "0 1px 3px rgba(28, 28, 22, 0.06)",
    transition: "all 0.35s cubic-bezier(0.2, 1, 0.3, 1)",
  },
  btn: {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "14px 34px", borderRadius: 9999,
    fontFamily: FONT, fontWeight: 600, fontSize: 16,
    textDecoration: "none", cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  },
}

/* ─── data ─── */

const modalities = [
  {
    icon: PenLine,
    accent: "var(--color-primary)",
    title: "Textual Analysis",
    desc: "Deep semantic parsing of journals and notes via DistilBERT fine-tuned on GoEmotions — uncovering hidden sentiment trends across 28 emotion classes.",
  },
  {
    icon: ScanFace,
    accent: "var(--emotion-happy)",
    title: "Facial Mapping",
    desc: "Micro-expression detection powered by MobileNetV2 trained on RAF-DB — capturing authentic emotional responses invisible to the naked eye.",
  },
  {
    icon: Mic,
    accent: "var(--emotion-sad)",
    title: "Voice Intelligence",
    desc: "Tonal shifts, pitch variation, and prosody analysis via YAMNet trained on RAVDESS & CREMA-D — mapping vocal patterns to emotional states.",
  },
]

const stats = [
  { value: "Real-time", label: "Inference Engine" },
  { value: "Adaptive", label: "Mood Contextualization" },
  { value: "Secure", label: "Local-First Storage" },
  { value: "Universal", label: "Emotion Recognition" },
]

const testimonials = [
  {
    initial: "A", name: "Anonymous Wanderer", emotion: "Reflective",
    emotionColor: "var(--emotion-sad)", cornerColor: "var(--emotion-sad)",
    avatarBg: "var(--emotion-sad-bg)",
    quote: "TriAffect helped me realize my voice tone changes significantly before a stressful meeting. Now I can breathe through it.",
  },
  {
    initial: "M", name: "Mindful Soul", emotion: "Grounded",
    emotionColor: "var(--emotion-happy)", cornerColor: "var(--emotion-happy)",
    avatarBg: "var(--emotion-happy-bg)",
    quote: "The facial mapping caught my micro-smiles when I thought I was having a bad day. It's a gentle reminder of joy.",
  },
  {
    initial: "E", name: "Explorer", emotion: "Inspired",
    emotionColor: "var(--emotion-stressed)", cornerColor: "var(--emotion-stressed)",
    avatarBg: "var(--emotion-stressed-bg)",
    quote: "Finally, an app that doesn't just ask 'how are you?' but actually listens to how I'm answering. Truly empathetic tech.",
  },
]

/* ═══════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════ */

export default function Home() {
  return (
    <div style={{ backgroundColor: "var(--color-bg)", overflowX: "hidden", fontFamily: FONT }}>

      {/* ═════════════════════════════════════
          SECTION 1 — HERO
      ═════════════════════════════════════ */}
      <section style={{
        position: "relative", padding: "80px 24px 64px", overflow: "hidden",
        minHeight: "90vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(180deg, var(--color-bg) 0%, var(--color-surface-offset) 100%)",
      }}>

        {/* Morphing orbs */}
        <motion.div
          style={{
            position: "absolute", top: "10%", left: "15%", width: 420, height: 420,
            background: "color-mix(in oklch, var(--color-primary) 8%, transparent)",
            filter: "blur(60px)", pointerEvents: "none", zIndex: 0,
          }}
          animate={{
            scale: [1, 1.08, 1], opacity: [0.4, 0.7, 0.4],
            borderRadius: [
              "60% 40% 30% 70% / 60% 30% 70% 40%",
              "30% 60% 70% 40% / 50% 60% 30% 60%",
              "60% 40% 30% 70% / 60% 30% 70% 40%",
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          style={{
            position: "absolute", bottom: "10%", right: "15%", width: 350, height: 350,
            background: "color-mix(in oklch, var(--emotion-happy) 8%, transparent)",
            filter: "blur(60px)", pointerEvents: "none", zIndex: 0,
          }}
          animate={{
            scale: [1, 1.12, 1], opacity: [0.3, 0.6, 0.3],
            borderRadius: [
              "30% 60% 70% 40% / 50% 60% 30% 60%",
              "60% 40% 30% 70% / 60% 30% 70% 40%",
              "30% 60% 70% 40% / 50% 60% 30% 60%",
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />

        {/* Hero content */}
        <div style={{ position: "relative", zIndex: 1, maxWidth: 860, margin: "0 auto", textAlign: "center" }}>

          {/* Eyebrow badge */}
          <motion.div variants={fadeUp} custom={0} initial="hidden" animate="visible">
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "8px 20px", borderRadius: 9999, marginBottom: 28,
              fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase",
              fontFamily: FONT,
              background: "color-mix(in oklch, var(--color-surface) 60%, transparent)",
              backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
              border: "1px solid color-mix(in oklch, var(--color-border) 30%, transparent)",
              color: "var(--color-primary)",
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%",
                background: "var(--emotion-happy)", display: "inline-block",
                animation: "pulseGlow 2s ease-in-out infinite",
              }} />
              AI-Powered Emotion Intelligence Platform
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp} custom={1} initial="hidden" animate="visible"
            style={{
              ...S.heading, fontWeight: 800,
              fontSize: "clamp(2.8rem, 7vw, 4.5rem)",
              lineHeight: 1.08, letterSpacing: "-0.03em",
              marginBottom: 24,
            }}
          >
            Understand your{" "}
            <span style={{
              background: "linear-gradient(to right, var(--color-primary), #B9935E, var(--emotion-happy))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text", fontStyle: "italic",
            }}>
              emotions
            </span>{" "}
            with clarity.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp} custom={2} initial="hidden" animate="visible"
            style={{
              ...S.body, fontSize: "clamp(1.05rem, 2.2vw, 1.2rem)",
              maxWidth: 580, margin: "0 auto 36px",
            }}
          >
            A serene platform fusing{" "}
            <strong style={{ color: "var(--color-text)", fontWeight: 600 }}>text</strong>,{" "}
            <strong style={{ color: "var(--color-text)", fontWeight: 600 }}>facial</strong>, and{" "}
            <strong style={{ color: "var(--color-text)", fontWeight: 600 }}>voice</strong>{" "}
            signals into one unified emotion prediction — powered by DistilBERT, MobileNetV2, and YAMNet.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp} custom={3} initial="hidden" animate="visible"
            style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", marginBottom: 56 }}
          >
            <Link to="/register" style={{
              ...S.btn,
              background: "var(--color-primary)", color: "white",
              boxShadow: "0 4px 16px color-mix(in oklch, var(--color-primary) 25%, transparent)",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.boxShadow = "0 8px 24px color-mix(in oklch, var(--color-primary) 30%, transparent)" }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 16px color-mix(in oklch, var(--color-primary) 25%, transparent)" }}
            >
              Begin Your Journey
            </Link>
            <Link to="/#how-it-works" style={{
              ...S.btn,
              background: "var(--color-surface)", color: "var(--color-primary)",
              border: "1px solid var(--color-border)",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(28,28,22,0.08)" }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none" }}
            >
              See How It Works
            </Link>
          </motion.div>

          {/* Hero Visual Panel */}
          <motion.div variants={fadeUp} custom={4} initial="hidden" animate="visible" style={{ width: "100%", maxWidth: 940, margin: "0 auto" }}>
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              style={{
                width: "100%", aspectRatio: "16/7", borderRadius: 20,
                background: "color-mix(in oklch, var(--color-surface) 50%, transparent)",
                backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                border: "1px solid color-mix(in oklch, var(--color-surface) 60%, transparent)",
                overflow: "hidden", position: "relative",
                boxShadow: "0 20px 50px -12px rgba(28, 28, 22, 0.14)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {/* SVG wave animation */}
              <svg style={{ position: "absolute", width: "100%", height: "100%", opacity: 0.4 }} preserveAspectRatio="none" viewBox="0 0 800 300">
                <defs>
                  <linearGradient id="wg1" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" stopColor="#6B705C" stopOpacity="0" />
                    <stop offset="50%" stopColor="#6B705C" stopOpacity="1" />
                    <stop offset="100%" stopColor="#6B705C" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 150 C 200 50, 400 250, 800 150" fill="none" stroke="url(#wg1)" strokeWidth="3">
                  <animate attributeName="d" dur="8s" repeatCount="indefinite"
                    values="M0 150 C 200 50, 400 250, 800 150; M0 150 C 200 250, 400 50, 800 150; M0 150 C 200 50, 400 250, 800 150" />
                </path>
                <path d="M0 160 C 200 100, 400 220, 800 160" fill="none" stroke="#F59E0B" strokeWidth="2" opacity="0.6">
                  <animate attributeName="d" dur="10s" repeatCount="indefinite"
                    values="M0 160 C 200 100, 400 220, 800 160; M0 160 C 200 220, 400 100, 800 160; M0 160 C 200 100, 400 220, 800 160" />
                </path>
                <path d="M0 140 C 250 80, 550 220, 800 140" fill="none" stroke="#3B82F6" strokeWidth="1.5" opacity="0.4">
                  <animate attributeName="d" dur="12s" repeatCount="indefinite"
                    values="M0 140 C 250 80, 550 220, 800 140; M0 140 C 250 220, 550 80, 800 140; M0 140 C 250 80, 550 220, 800 140" />
                </path>
              </svg>

              {/* Blurred pulse circles */}
              <div style={{ position: "absolute", display: "flex", gap: 36, filter: "blur(40px)", opacity: 0.4 }}>
                {[
                  { w: 60, bg: "var(--color-primary)", d: 0 },
                  { w: 80, bg: "#F59E0B", d: 1.5 },
                  { w: 55, bg: "#3B82F6", d: 0.8 },
                  { w: 70, bg: "#A855F7", d: 2 },
                ].map((c, i) => (
                  <motion.div key={i}
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: c.d }}
                    style={{ width: c.w, height: c.w, borderRadius: "50%", background: c.bg }}
                  />
                ))}
              </div>

              {/* Center label + bars */}
              <div style={{ zIndex: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                  ...S.caption, color: "color-mix(in oklch, var(--color-primary) 60%, transparent)",
                  letterSpacing: "0.3em", fontSize: 11, marginBottom: 20,
                }}>
                  Live Multi-modal Visualization
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 48 }}>
                  {[1.2, 1.5, 1, 1.8, 1.3, 1.6].map((dur, i) => (
                    <motion.div key={i}
                      animate={{ height: ["30%", "100%", "30%"] }}
                      transition={{ duration: dur, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
                      style={{ width: 3, borderRadius: 9999, background: "color-mix(in oklch, var(--color-primary) 40%, transparent)" }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═════════════════════════════════════
          SECTION 2 — THREE LAYERS OF INSIGHT
      ═════════════════════════════════════ */}
      <section id="features" style={{ ...S.sectionPad, background: "color-mix(in oklch, var(--color-surface-offset) 30%, transparent)" }}>
        <div style={S.maxW}>

          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            style={{ textAlign: "center", marginBottom: 56 }}
          >
            <h2 style={{ ...S.heading, fontSize: "clamp(1.8rem, 4vw, 2.6rem)", marginBottom: 14 }}>
              Three Layers of Insight
            </h2>
            <p style={{ ...S.body, maxWidth: 560, margin: "0 auto" }}>
              Our holistic approach ensures no emotional signal goes unheard — text, face, and voice, mapped by three purpose-built deep learning models.
            </p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 28 }}>
            {modalities.map(({ icon: Icon, accent, title, desc }, i) => (
              <motion.div key={i}
                variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                style={{
                  ...S.card, padding: 36, position: "relative", overflow: "hidden",
                  display: "flex", flexDirection: "column", alignItems: "flex-start",
                }}
                onMouseEnter={cardHoverIn} onMouseLeave={cardHoverOut}
              >
                {/* Left accent bar */}
                <div style={{
                  position: "absolute", top: 0, left: 0, width: 4, height: "100%",
                  background: `color-mix(in oklch, ${accent} 25%, transparent)`,
                  transition: "background 0.4s ease",
                }} />

                {/* Icon */}
                <div style={{
                  width: 50, height: 50, borderRadius: 14,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "var(--color-surface-2)", color: accent,
                  marginBottom: 22,
                }}>
                  <Icon size={24} />
                </div>

                <h3 style={{ ...S.heading, fontSize: 21, marginBottom: 12 }}>{title}</h3>
                <p style={{ ...S.body, fontSize: 15 }}>{desc}</p>

                {/* Decorative dots */}
                <div style={{ marginTop: 24, display: "flex", gap: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: `color-mix(in oklch, ${accent} 40%, transparent)` }} />
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: `color-mix(in oklch, ${accent} 20%, transparent)` }} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════
          SECTION 3 — DESIGNED FOR DEPTH
      ═════════════════════════════════════ */}
      <section id="how-it-works" style={{ ...S.sectionPad, background: "var(--color-bg)" }}>
        <div style={S.maxW}>

          {/* Header row */}
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, gap: 24 }}
          >
            <div style={{ maxWidth: 520 }}>
              <h2 style={{ ...S.heading, fontSize: "clamp(1.8rem, 4vw, 2.6rem)", marginBottom: 12 }}>
                Designed for Depth
              </h2>
              <p style={S.body}>
                We don't just categorize emotions; we contextualize them within your daily life, creating a roadmap for resilience.
              </p>
            </div>
            <Link to="/detect" style={{
              display: "flex", alignItems: "center", gap: 8,
              color: "var(--color-primary)", fontWeight: 600, textDecoration: "none",
              fontSize: 16, fontFamily: FONT, transition: "gap 0.3s ease",
            }}
              onMouseEnter={e => e.currentTarget.style.gap = "14px"}
              onMouseLeave={e => e.currentTarget.style.gap = "8px"}
            >
              Explore Core Capabilities
              <ArrowRight size={18} />
            </Link>
          </motion.div>

          {/* Bento grid */}
          <div className="home-bento">

            {/* PRIMARY: Holistic Mood Fingerprinting */}
            <motion.div className="bento-lg"
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              style={{
                ...S.card, padding: "40px 44px",
                display: "flex", flexWrap: "wrap", alignItems: "center", gap: 44,
                position: "relative", overflow: "hidden",
                border: "1px solid color-mix(in oklch, var(--color-primary) 10%, transparent)",
              }}
              onMouseEnter={cardHoverIn} onMouseLeave={cardHoverOut}
            >
              {/* Decorative glow */}
              <div style={{
                position: "absolute", top: 0, right: 0, width: 200, height: 200,
                background: "color-mix(in oklch, var(--color-primary) 5%, transparent)",
                borderRadius: "50%", transform: "translate(40%, -40%)", filter: "blur(50px)",
                pointerEvents: "none",
              }} />

              {/* Text content */}
              <div style={{ flex: "1 1 280px", zIndex: 1 }}>
                <div style={{
                  ...S.caption, display: "inline-flex", alignItems: "center", gap: 6,
                  color: "var(--color-primary)", marginBottom: 18,
                }}>
                  <Brain size={15} />
                  MULTI-MODAL UNDERSTANDING
                </div>
                <h3 style={{ ...S.heading, fontSize: "clamp(1.5rem, 2.8vw, 2rem)", marginBottom: 16, lineHeight: 1.2 }}>
                  Holistic Mood Fingerprinting
                </h3>
                <p style={{ ...S.body, fontSize: 15, marginBottom: 28 }}>
                  Our adaptive weighted fusion algorithm analyzes resonance across text, facial micro-expressions, and vocal prosody — creating a unified 5-class emotion prediction with confidence scores.
                </p>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 14, margin: 0, padding: 0 }}>
                  {["Predictive Anxiety Forecasting", "Cognitive Distortion Detection"].map(t => (
                    <li key={t} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 15, fontWeight: 600, fontFamily: FONT, color: "var(--color-text-muted)" }}>
                      <span style={{
                        width: 26, height: 26, borderRadius: "50%",
                        background: "color-mix(in oklch, var(--color-primary) 10%, transparent)",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <Check size={13} style={{ color: "var(--color-primary)" }} />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Orbital animation */}
              <div style={{
                flex: "0 0 auto", width: 220, height: 220, borderRadius: "50%",
                background: "color-mix(in oklch, var(--color-primary) 5%, transparent)",
                position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <motion.div
                  animate={{ borderRadius: [
                    "60% 40% 30% 70% / 60% 30% 70% 40%",
                    "30% 60% 70% 40% / 50% 60% 30% 60%",
                    "60% 40% 30% 70% / 60% 30% 70% 40%",
                  ] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    width: 110, height: 110,
                    background: "color-mix(in oklch, var(--color-primary) 12%, transparent)",
                    filter: "blur(30px)", position: "absolute",
                  }}
                />
                <div style={{
                  position: "absolute", width: 80, height: 80,
                  border: "2px solid color-mix(in oklch, var(--color-primary) 15%, transparent)",
                  borderRadius: "50%", animation: "pulseGlow 2s ease-in-out infinite",
                }} />
                <div style={{
                  position: "absolute", width: 160, height: 160,
                  border: "1px solid color-mix(in oklch, var(--color-primary) 10%, transparent)",
                  borderRadius: "50%", animation: "spin 25s linear infinite",
                }}>
                  <div style={{
                    position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
                    width: 8, height: 8, borderRadius: "50%", background: "var(--color-primary)",
                    boxShadow: "0 0 10px color-mix(in oklch, var(--color-primary) 50%, transparent)",
                  }} />
                </div>
                <div style={{
                  position: "absolute", width: 110, height: 110,
                  border: "1px solid color-mix(in oklch, var(--emotion-happy) 15%, transparent)",
                  borderRadius: "50%", animation: "spin 15s linear infinite reverse",
                }}>
                  <div style={{
                    position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
                    width: 6, height: 6, borderRadius: "50%", background: "var(--emotion-happy)",
                  }} />
                </div>
              </div>
            </motion.div>

            {/* Privacy by Design */}
            <motion.div className="bento-sm"
              variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
              style={{
                ...S.card, padding: 32,
                display: "flex", flexDirection: "column",
              }}
              onMouseEnter={cardHoverIn} onMouseLeave={cardHoverOut}
            >
              <div style={{ marginBottom: "auto" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: "color-mix(in oklch, var(--color-primary) 10%, transparent)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 22, color: "var(--color-primary)",
                }}>
                  <Shield size={22} />
                </div>
                <h3 style={{ ...S.heading, fontSize: 20, marginBottom: 10 }}>Privacy by Design</h3>
                <p style={{ ...S.body, fontSize: 15 }}>
                  Your emotional data is locally processed and encrypted. You hold the only key.
                </p>
              </div>
              <div style={{
                marginTop: 28, padding: "12px 16px", borderRadius: 12,
                background: "color-mix(in oklch, var(--color-surface-offset) 50%, transparent)",
                border: "1px solid color-mix(in oklch, var(--color-border) 15%, transparent)",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: "#22c55e", display: "inline-block",
                  animation: "pulseGlow 2s ease-in-out infinite",
                }} />
                <span style={{ ...S.caption, fontSize: 10 }}>Secure Link Active</span>
              </div>
            </motion.div>

            {/* Seamless Ecosystem */}
            <motion.div className="bento-sm"
              variants={fadeUp} custom={2} initial="hidden" whileInView="visible" viewport={{ once: true }}
              style={{ ...S.card, padding: 32 }}
              onMouseEnter={cardHoverIn} onMouseLeave={cardHoverOut}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "color-mix(in oklch, var(--color-primary) 10%, transparent)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 22, color: "var(--color-primary)",
              }}>
                <Smartphone size={22} />
              </div>
              <h3 style={{ ...S.heading, fontSize: 20, marginBottom: 10 }}>Seamless Ecosystem</h3>
              <p style={{ ...S.body, fontSize: 15 }}>
                Journal from desktop, log emotions from your phone, and capture micro-expressions on any device.
              </p>
              <div style={{ marginTop: 24, display: "flex", gap: 5 }}>
                {[1, 2, 3].map(i => (
                  <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "color-mix(in oklch, var(--color-primary) 20%, transparent)" }} />
                ))}
              </div>
            </motion.div>

            {/* Collective Resilience */}
            <motion.div className="bento-lg"
              variants={fadeUp} custom={3} initial="hidden" whileInView="visible" viewport={{ once: true }}
              style={{
                ...S.card, padding: 32,
                display: "flex", flexWrap: "wrap", justifyContent: "space-between",
                alignItems: "center", gap: 28,
              }}
              onMouseEnter={cardHoverIn} onMouseLeave={cardHoverOut}
            >
              <div style={{ maxWidth: 440 }}>
                <h3 style={{ ...S.heading, fontSize: 20, marginBottom: 10 }}>Collective Resilience</h3>
                <p style={{ ...S.body, fontSize: 15 }}>
                  Join anonymous support circles where shared emotions become shared strengths. Connect with a community that understands you.
                </p>
              </div>
              {/* Avatar stack */}
              <div style={{ display: "flex" }}>
                {[
                  { bg: "color-mix(in oklch, var(--color-primary) 10%, transparent)", color: "var(--color-primary)", dot: "var(--emotion-happy)" },
                  { bg: "color-mix(in oklch, var(--emotion-happy) 10%, transparent)", color: "var(--emotion-happy)", dot: "var(--emotion-sad)" },
                  { bg: "color-mix(in oklch, var(--emotion-sad) 10%, transparent)", color: "var(--emotion-sad)", dot: null },
                ].map((a, i) => (
                  <div key={i} style={{
                    width: 42, height: 42, borderRadius: "50%",
                    border: "2px solid var(--color-surface)", marginLeft: i > 0 ? -10 : 0,
                    background: a.bg, display: "flex", alignItems: "center", justifyContent: "center",
                    position: "relative",
                  }}>
                    <Users size={16} style={{ color: a.color, opacity: 0.5 }} />
                    {a.dot && (
                      <div style={{
                        position: "absolute", bottom: -1, right: -1,
                        width: 10, height: 10, borderRadius: "50%",
                        background: a.dot, border: "2px solid var(--color-surface)",
                      }} />
                    )}
                  </div>
                ))}
                <div style={{
                  width: 42, height: 42, borderRadius: "50%",
                  border: "2px solid var(--color-surface)", marginLeft: -10,
                  background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, color: "white", fontFamily: FONT,
                }}>
                  +12k
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════
          SECTION 4 — STATS BAR
      ═════════════════════════════════════ */}
      <section style={{ padding: "56px 24px", background: "var(--color-surface)" }}>
        <div style={S.maxW}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 36 }}>
            {stats.map(({ value, label }, i) => (
              <motion.div key={i}
                variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                style={{ textAlign: "center", cursor: "default" }}
                onMouseEnter={e => {
                  const line = e.currentTarget.querySelector("[data-line]")
                  const text = e.currentTarget.querySelector("[data-val]")
                  if (line) line.style.width = "44px"
                  if (text) text.style.transform = "scale(1.06)"
                }}
                onMouseLeave={e => {
                  const line = e.currentTarget.querySelector("[data-line]")
                  const text = e.currentTarget.querySelector("[data-val]")
                  if (line) line.style.width = "32px"
                  if (text) text.style.transform = "scale(1)"
                }}
              >
                <div data-val style={{
                  ...S.heading, fontSize: "clamp(1.5rem, 3vw, 2rem)",
                  color: "var(--color-primary)", marginBottom: 8,
                  transition: "transform 0.5s ease",
                }}>
                  {value}
                </div>
                <p style={{ ...S.caption, fontSize: 10, opacity: 0.6 }}>
                  {label}
                </p>
                <div data-line style={{
                  width: 32, height: 2, borderRadius: 9999, margin: "12px auto 0",
                  background: "color-mix(in oklch, var(--color-primary) 15%, transparent)",
                  transition: "width 0.4s ease",
                }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════
          SECTION 5 — SHARED JOURNEYS
      ═════════════════════════════════════ */}
      <section style={{ ...S.sectionPad, background: "color-mix(in oklch, var(--color-surface-offset) 40%, transparent)" }}>
        <div style={S.maxW}>

          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            style={{ textAlign: "center", marginBottom: 48 }}
          >
            <h2 style={{ ...S.heading, fontSize: "clamp(1.8rem, 4vw, 2.6rem)", marginBottom: 10 }}>
              Shared Journeys
            </h2>
            <p style={S.body}>
              Echoes from the TriAffect community.
            </p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 28 }}>
            {testimonials.map(({ initial, name, emotion, emotionColor, cornerColor, avatarBg, quote }, i) => (
              <motion.div key={i}
                variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                style={{
                  ...S.card, padding: 36, position: "relative", overflow: "hidden",
                }}
                onMouseEnter={cardHoverIn} onMouseLeave={cardHoverOut}
              >
                {/* Corner accent */}
                <div style={{
                  position: "absolute", top: 0, right: 0,
                  width: 60, height: 60,
                  background: `color-mix(in oklch, ${cornerColor} 5%, transparent)`,
                  borderBottomLeftRadius: "100%",
                }} />

                {/* User row */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: avatarBg, display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: 15, fontFamily: FONT, color: emotionColor,
                  }}>
                    {initial}
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, fontFamily: FONT, color: "var(--color-text)", marginBottom: 3 }}>{name}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{
                        width: 7, height: 7, borderRadius: "50%", display: "inline-block",
                        background: emotionColor,
                        boxShadow: `0 0 6px color-mix(in oklch, ${emotionColor} 50%, transparent)`,
                      }} />
                      <span style={{ ...S.caption, fontSize: 10 }}>
                        Feeling: {emotion}
                      </span>
                    </div>
                  </div>
                </div>

                <p style={{ ...S.body, fontSize: 15, fontStyle: "italic" }}>
                  "{quote}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════
          SECTION 6 — CRISIS SUPPORT CTA
      ═════════════════════════════════════ */}
      <section style={{ padding: "0 24px 56px" }}>
        <div style={S.maxW}>
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            style={{
              ...S.card, padding: "32px 40px",
              display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 24,
              position: "relative", overflow: "hidden",
              border: "1px solid color-mix(in oklch, var(--color-error) 10%, transparent)",
            }}
          >
            {/* Left accent */}
            <div style={{
              position: "absolute", top: 0, left: 0, width: 4, height: "100%",
              background: "color-mix(in oklch, var(--color-error) 40%, transparent)",
            }} />

            <div style={{ display: "flex", alignItems: "center", gap: 24, zIndex: 1, flex: "1 1 auto" }}>
              <div style={{
                width: 54, height: 54, borderRadius: 16,
                background: "color-mix(in oklch, var(--color-error) 6%, transparent)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <HeartPulse size={24} style={{ color: "var(--color-error)" }} />
                </motion.div>
              </div>
              <div>
                <h4 style={{ ...S.heading, fontSize: 19, marginBottom: 6 }}>In a difficult moment?</h4>
                <p style={{ ...S.body, fontSize: 15, maxWidth: 400 }}>
                  Access immediate breathing exercises or crisis resources instantly.
                </p>
              </div>
            </div>

            <Link to="/detect" style={{
              ...S.btn, background: "var(--color-error)", color: "white",
              boxShadow: "0 4px 16px color-mix(in oklch, var(--color-error) 20%, transparent)",
              zIndex: 1, flexShrink: 0,
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.03)" }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)" }}
            >
              Get Support Now
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
