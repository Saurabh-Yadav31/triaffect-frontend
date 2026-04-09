import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/context/AuthContext";
import { getLogs, getPosts, savePost } from "@/firebase/firestore";
import { format, subDays, startOfDay } from "date-fns";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [logs, setLogs] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reflectionText, setReflectionText] = useState("");
  const [submittingPost, setSubmittingPost] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      try {
        const userLogs = await getLogs(currentUser.uid);
        setLogs(userLogs);
        const communityPosts = await getPosts();
        setPosts(communityPosts);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser]);

  const lastEmotion = logs[0];
  const lastEmotionLabel = lastEmotion?.emotion || "neutral";
  const lastConfidence = lastEmotion?.scores?.[lastEmotionLabel] || 0;
  const totalDetections = logs.length;

  const emotionFrequency = logs.reduce((acc, log) => {
    acc[log.emotion] = (acc[log.emotion] || 0) + 1;
    return acc;
  }, {});
  const mostFrequentEmotion = Object.entries(emotionFrequency).sort((a, b) => b[1] - a[1])[0]?.[0] || "neutral";

  const calculateStreak = () => {
    const dates = new Set();
    logs.forEach((log) => {
      const date = log.timestamp?.toDate?.() || new Date(log.timestamp);
      dates.add(format(startOfDay(date), "yyyy-MM-dd"));
    });
    let streak = 0;
    let currentDate = new Date();
    while (dates.has(format(startOfDay(currentDate), "yyyy-MM-dd"))) {
      streak++;
      currentDate = subDays(currentDate, 1);
    }
    return streak;
  };
  const streak = calculateStreak();

  const prepareWeeklyData = () => {
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const today = new Date();
    const weekData = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(startOfDay(date), "yyyy-MM-dd");
      const dayLogsForDate = logs.filter((log) => {
        const logDate = log.timestamp?.toDate?.() || new Date(log.timestamp);
        return format(startOfDay(logDate), "yyyy-MM-dd") === dateStr;
      });
      const emotionScores = { angry: 0, happy: 0, neutral: 0, sad: 0, stressed: 0 };
      dayLogsForDate.forEach((log) => {
        Object.assign(emotionScores, log.scores);
      });
      weekData.push({
        day: days[date.getDay()],
        stability: Math.round((emotionScores.neutral || 0) * 100),
        mood: Math.round((emotionScores.happy || 0) * 100),
      });
    }
    return weekData;
  };
  const weeklyData = prepareWeeklyData();

  // ─── 30 Wellness Tips (6 per emotion, rotating by day) ──────────────
  const wellnessTips = {
    angry: [
      "Try box breathing — inhale 4s, hold 4s, exhale 4s. It helps calm your nervous system instantly.",
      "Listen to calming music or nature sounds for 10 minutes. Let your mind relax completely.",
      "Go for a brisk walk to release tension. Physical movement helps burn off anger.",
      "Write down what's bothering you, then crumple the paper. Symbolically let it go.",
      "Practice progressive muscle relaxation. Tense and release each muscle group.",
      "Splash cold water on your face to reset. The shock helps reset your emotional state.",
    ],
    happy: [
      "Great energy today! Channel it into something creative or productive.",
      "Share your joy with someone you care about. Happiness multiplies when shared.",
      "Take a photo of this moment to remember it. Capture the good vibes.",
      "Do something nice for someone else today. Spread the happiness around.",
      "Dance to your favorite song for 2 minutes. Move and celebrate your mood.",
      "Start a project you've been putting off. Use this energy wisely.",
    ],
    neutral: [
      "A short walk can help shift your focus and mood. Change your environment.",
      "Try a 5-minute meditation or breathing exercise. Center yourself.",
      "Connect with a friend or family member. Social connection helps.",
      "Change your environment — move to a different room. Fresh perspective helps.",
      "Listen to a podcast or audiobook you enjoy. Engage your mind.",
      "Drink water and have a healthy snack. Nourish yourself.",
    ],
    sad: [
      "Be gentle with yourself. Reach out to someone you trust. You don't have to feel alone.",
      "Watch your favorite feel-good movie or show. Distract yourself positively.",
      "Do something kind for yourself today. Self-compassion matters.",
      "Call a friend or loved one and talk. Connection heals.",
      "Write down 3 things you're grateful for. Shift your perspective.",
      "Take a warm bath with your favorite music. Comfort yourself.",
    ],
    stressed: [
      "Step away from screens for 10 minutes. You deserve a real break.",
      "Try the 4-7-8 breathing technique: inhale 4s, hold 7s, exhale 8s.",
      "Do some gentle stretching or yoga. Release physical tension.",
      "Organize one small area to feel more in control. Small wins help.",
      "Have a cup of herbal tea and relax. Take time to pause.",
      "Take a short power nap (15-20 minutes). Rest resets your mind.",
    ],
  };

  // Rotate tip by day of month (cycles through 6 tips per emotion)
  const dayOfMonth = new Date().getDate();
  const tipIndex = dayOfMonth % 6;
  const currentTip = wellnessTips[lastEmotionLabel][tipIndex];

  const emotionColors = {
    angry: { color: "#ef4444", bg: "#fee2e2" },
    happy: { color: "#eab308", bg: "#fef9c3" },
    neutral: { color: "#6b7280", bg: "#f3f4f6" },
    sad: { color: "#3b82f6", bg: "#dbeafe" },
    stressed: { color: "#a855f7", bg: "#f3e8ff" },
  };

  const emotionEmojis = {
    angry: "😠",
    happy: "😊",
    neutral: "😐",
    sad: "😢",
    stressed: "😰",
  };

  const getEmotionGradient = () => {
    const emotionGradients = {
      angry: "linear-gradient(135deg, #ef4444 0%, #991b1b 100%)",
      happy: "linear-gradient(135deg, #eab308 0%, #854d0e 100%)",
      neutral: "linear-gradient(135deg, #6b7280 0%, #374151 100%)",
      sad: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
      stressed: "linear-gradient(135deg, #a855f7 0%, #6b21a8 100%)",
    };
    return emotionGradients[lastEmotionLabel];
  };

  const handleSubmitReflection = async () => {
    if (!reflectionText.trim() || !currentUser) return;
    try {
      setSubmittingPost(true);
      await savePost({
        userId: currentUser.uid,
        userName: currentUser.displayName || "Anonymous",
        userPhotoURL: currentUser.photoURL || null,
        text: reflectionText,
        emotion: lastEmotionLabel,
        likes: 0,
      });
      setReflectionText("");
      const updatedPosts = await getPosts();
      setPosts(updatedPosts);
    } catch (error) {
      console.error("Error submitting post:", error);
    } finally {
      setSubmittingPost(false);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          padding: "3rem 3.5rem",
          minHeight: "100vh",
          backgroundColor: "var(--color-bg)",
          fontFamily: "Manrope, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}
      >
        <div style={{ textAlign: "center", color: "var(--color-text-muted)", fontSize: "1.1rem" }}>
          Loading dashboard...
        </div>
      </motion.div>
    );
  }

  // ─── Empty State when no detection logs ──────────────────────────────
  if (totalDetections === 0) {
    return (
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{
          padding: "2.5rem 3.5rem",
          paddingTop: "2.5rem",
          paddingBottom: "3rem",
          minHeight: "100vh",
          backgroundColor: "var(--color-bg)",
          width: "100%",
          boxSizing: "border-box",
          fontFamily: "Manrope, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}
      >
        <div style={{ maxWidth: "1500px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2.5rem" }}>
          
          {/* Greeting */}
          <motion.section
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}
          >
            <h1 style={{ 
              fontSize: "3.2rem", 
              fontWeight: "900", 
              letterSpacing: "-0.02em", 
              color: "var(--color-text)",
              fontFamily: "Manrope, sans-serif",
              margin: 0
            }}>
              Good morning, {currentUser?.displayName?.split(" ")[0]} 👋
            </h1>
            <p style={{ 
              fontSize: "1.05rem", 
              color: "var(--color-text-muted)", 
              fontWeight: "500",
              fontFamily: "Manrope, sans-serif",
              margin: 0
            }}>
              {format(new Date(), "EEEE, MMMM do")}
            </p>
          </motion.section>

          {/* Empty State */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            style={{
              textAlign: "center",
              padding: "5rem 3rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "2.5rem",
            }}
          >
            {/* Large Illustration Emoji */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ fontSize: "8rem" }}
            >
              📊
            </motion.div>
            
            {/* Text Content */}
            <div style={{ maxWidth: "500px" }}>
              <h2 style={{ 
                fontSize: "2.4rem", 
                fontWeight: "900", 
                marginBottom: "1rem", 
                color: "var(--color-text)",
                fontFamily: "Manrope, sans-serif",
                margin: 0
              }}>
                No emotion data yet
              </h2>
              <p style={{ 
                fontSize: "1.1rem", 
                color: "var(--color-text-muted)", 
                fontFamily: "Manrope, sans-serif", 
                marginBottom: "2.5rem",
                lineHeight: 1.7,
                margin: 0,
                marginBottom: "2.5rem"
              }}>
                Start your first emotion detection to see insights, analytics, and personalized wellness tips here.
              </p>
            </div>

            {/* CTA Button */}
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => window.location.href = "/detect"}
              style={{
                backgroundColor: "var(--color-primary)",
                color: "white",
                padding: "1.1rem 2.5rem",
                borderRadius: "9999px",
                fontWeight: "900",
                fontSize: "1.05rem",
                cursor: "pointer",
                border: "none",
                fontFamily: "Manrope, sans-serif",
                boxShadow: "0 8px 24px rgba(99, 102, 241, 0.3)",
                letterSpacing: "0.05em"
              }}
            >
              Start Detection →
            </motion.button>

            {/* Subtitle */}
            <p style={{ 
              fontSize: "0.95rem", 
              color: "var(--color-text-muted)", 
              fontFamily: "Manrope, sans-serif",
              marginTop: "1rem"
            }}>
              Takes less than a minute to get started
            </p>
          </motion.div>
        </div>
      </motion.main>
    );
  }

  // ─── Main Dashboard (when data exists) ────────────────────────────────
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{
        padding: "2.5rem 3.5rem",
        paddingTop: "2.5rem",
        paddingBottom: "3rem",
        minHeight: "100vh",
        backgroundColor: "var(--color-bg)",
        width: "100%",
        boxSizing: "border-box",
        fontFamily: "Manrope, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      }}
    >
      <div style={{ maxWidth: "1500px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2.5rem" }}>
        
        {/* ─── Greeting ──────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}
        >
          <h1 style={{ 
            fontSize: "3.2rem", 
            fontWeight: "900", 
            letterSpacing: "-0.02em", 
            color: "var(--color-text)",
            fontFamily: "Manrope, sans-serif",
            margin: 0
          }}>
            Good morning, {currentUser?.displayName?.split(" ")[0]} 👋
          </h1>
          <p style={{ 
            fontSize: "1.05rem", 
            color: "var(--color-text-muted)", 
            fontWeight: "500",
            fontFamily: "Manrope, sans-serif",
            margin: 0
          }}>
            {format(new Date(), "EEEE, MMMM do")}
          </p>
        </motion.section>

        {/* ─── Main Grid ─────────────────────────────────────────────── */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1.35fr 1fr", 
          gap: "2rem", 
          alignItems: "start"
        }}>
          
          {/* LEFT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            
            {/* Current Mood Card - NO BORDER */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              style={{
                backgroundColor: "var(--color-surface)",
                borderRadius: "1.75rem",
                padding: "3rem",
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              }}
              whileHover={{ 
                y: -6,
                boxShadow: "0 20px 40px rgba(0,0,0,0.10)"
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  backgroundColor: `${emotionColors[lastEmotionLabel].color}20`,
                  paddingLeft: "1.2rem",
                  paddingRight: "1.2rem",
                  paddingTop: "0.5rem",
                  paddingBottom: "0.5rem",
                  borderRadius: "9999px",
                  marginBottom: "1.5rem",
                }}
              >
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: emotionColors[lastEmotionLabel].color,
                  }}
                />
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: "900",
                    letterSpacing: "0.12em",
                    color: emotionColors[lastEmotionLabel].color,
                    textTransform: "uppercase",
                    fontFamily: "Manrope, sans-serif"
                  }}
                >
                  Real-time State
                </span>
              </motion.div>

              {/* Content */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "2rem", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
                  {/* Emoji */}
                  <motion.div
                    animate={{ scale: [0.9, 1.1, 0.9] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    style={{ fontSize: "5.5rem", position: "relative", flexShrink: 0 }}
                  >
                    {emotionEmojis[lastEmotionLabel]}
                    <motion.div
                      animate={{ scale: [0.6, 1.5, 0.6], opacity: [0.5, 0.2, 0.5] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      style={{
                        position: "absolute",
                        inset: "-15px",
                        borderRadius: "50%",
                        border: `3px solid ${emotionColors[lastEmotionLabel].color}`,
                        zIndex: -1,
                      }}
                    />
                  </motion.div>

                  {/* Text */}
                  <div>
                    <h2 style={{ 
                      fontSize: "2.8rem", 
                      fontWeight: "900", 
                      letterSpacing: "-0.02em", 
                      color: "var(--color-text)", 
                      marginBottom: "0.8rem",
                      margin: 0,
                      fontFamily: "Manrope, sans-serif"
                    }}>
                      {lastEmotionLabel.charAt(0).toUpperCase() + lastEmotionLabel.slice(1)}
                    </h2>
                    <p style={{ 
                      fontSize: "1.05rem", 
                      color: "var(--color-text-muted)", 
                      lineHeight: 1.6, 
                      maxWidth: "350px",
                      margin: 0,
                      fontFamily: "Manrope, sans-serif",
                      fontWeight: "500"
                    }}>
                      You're radiating positive energy today. Your baseline stability is higher than average, suggesting a restful weekend.
                    </p>
                  </div>
                </div>

                {/* Confidence Circle */}
                <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: "150px", height: "150px", flexShrink: 0 }}>
                  <svg style={{ width: "100%", height: "100%", transform: "rotateZ(-90deg)" }} viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="85" fill="transparent" stroke="var(--color-surface-2)" strokeWidth="10" />
                    <motion.circle
                      cx="100"
                      cy="100"
                      r="85"
                      fill="transparent"
                      stroke={emotionColors[lastEmotionLabel].color}
                      strokeWidth="10"
                      strokeDasharray={534}
                      initial={{ strokeDashoffset: 534 }}
                      animate={{ strokeDashoffset: 534 * (1 - lastConfidence) }}
                      transition={{ duration: 1.8, ease: "easeOut" }}
                      strokeLinecap="round"
                      style={{ filter: `drop-shadow(0 0 12px ${emotionColors[lastEmotionLabel].color}50)` }}
                    />
                  </svg>
                  <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ 
                      fontSize: "2rem", 
                      fontWeight: "900", 
                      color: "var(--color-text)",
                      fontFamily: "Manrope, sans-serif",
                      margin: 0
                    }}>
                      {Math.round(lastConfidence * 100)}%
                    </span>
                    <span style={{ 
                      fontSize: "0.7rem", 
                      fontWeight: "900", 
                      color: "var(--color-text-muted)", 
                      letterSpacing: "0.08em", 
                      textTransform: "uppercase",
                      fontFamily: "Manrope, sans-serif",
                      margin: 0
                    }}>
                      Confidence
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Weekly Chart - NO BORDER */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              style={{
                backgroundColor: "var(--color-surface)",
                borderRadius: "1.75rem",
                padding: "2.5rem",
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              }}
              whileHover={{ 
                y: -6,
                boxShadow: "0 20px 40px rgba(0,0,0,0.10)"
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ 
                  fontSize: "1.4rem", 
                  fontWeight: "900", 
                  color: "var(--color-text)",
                  fontFamily: "Manrope, sans-serif",
                  margin: 0
                }}>
                  Weekly Emotion Trend
                </h3>
                <div style={{ display: "flex", gap: "1.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "var(--color-primary)" }} />
                    <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "Manrope, sans-serif" }}>
                      Stability
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#eab308" }} />
                    <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--color-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "Manrope, sans-serif" }}>
                      Mood
                    </span>
                  </div>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="4 4" stroke="var(--color-surface-2)" vertical={false} />
                  <XAxis dataKey="day" stroke="var(--color-text-muted)" style={{ fontSize: "0.75rem", fontWeight: "700" }} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: "var(--color-surface)", borderRadius: "0.75rem", fontSize: "0.9rem" }} />
                  <Line type="monotone" dataKey="stability" stroke="var(--color-primary)" strokeWidth={3.5} dot={{ r: 5 }} isAnimationActive />
                  <Line type="monotone" dataKey="mood" stroke="#eab308" strokeWidth={3.5} dot={{ r: 5 }} isAnimationActive />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            {/* Stats Cards - NO BORDER */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}
            >
              {/* Detections */}
              <motion.div
                style={{
                  backgroundColor: "var(--color-surface)",
                  padding: "1.8rem",
                  borderRadius: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                }}
                whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(0,0,0,0.08)" }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <div>
                  <p style={{ 
                    fontSize: "0.75rem", 
                    fontWeight: "900", 
                    letterSpacing: "0.1em", 
                    color: "var(--color-text-muted)", 
                    textTransform: "uppercase", 
                    marginBottom: "0.4rem",
                    fontFamily: "Manrope, sans-serif",
                    margin: 0
                  }}>
                    Detections
                  </p>
                  <span style={{ 
                    fontSize: "2.2rem", 
                    fontWeight: "900", 
                    color: "var(--color-text)",
                    fontFamily: "Manrope, sans-serif"
                  }}>
                    {totalDetections}
                  </span>
                </div>
                <span style={{ fontSize: "0.85rem", fontWeight: "700", backgroundColor: "#fef9c3", color: "#eab308", padding: "0.4rem 0.9rem", borderRadius: "9999px", fontFamily: "Manrope, sans-serif" }}>
                  📈 +12%
                </span>
              </motion.div>

              {/* Frequency */}
              <motion.div
                style={{
                  backgroundColor: "var(--color-surface)",
                  padding: "1.8rem",
                  borderRadius: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                }}
                whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(0,0,0,0.08)" }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <div>
                  <p style={{ 
                    fontSize: "0.75rem", 
                    fontWeight: "900", 
                    letterSpacing: "0.1em", 
                    color: "var(--color-text-muted)", 
                    textTransform: "uppercase", 
                    marginBottom: "0.4rem",
                    fontFamily: "Manrope, sans-serif",
                    margin: 0
                  }}>
                    Frequency
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <span style={{ fontSize: "1.4rem" }}>{emotionEmojis[mostFrequentEmotion]}</span>
                    <span style={{ 
                      fontSize: "1.2rem", 
                      fontWeight: "900", 
                      color: "var(--color-text)",
                      fontFamily: "Manrope, sans-serif"
                    }}>
                      {mostFrequentEmotion.charAt(0).toUpperCase() + mostFrequentEmotion.slice(1)}
                    </span>
                  </div>
                </div>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: emotionColors[mostFrequentEmotion].color }} />
              </motion.div>

              {/* Streak */}
              <motion.div
                style={{
                  backgroundColor: "var(--color-surface)",
                  padding: "1.8rem",
                  borderRadius: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                }}
                whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(0,0,0,0.08)" }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <div>
                  <p style={{ 
                    fontSize: "0.75rem", 
                    fontWeight: "900", 
                    letterSpacing: "0.1em", 
                    color: "var(--color-text-muted)", 
                    textTransform: "uppercase", 
                    marginBottom: "0.4rem",
                    fontFamily: "Manrope, sans-serif",
                    margin: 0
                  }}>
                    Streak
                  </p>
                  <span style={{ 
                    fontSize: "2.2rem", 
                    fontWeight: "900", 
                    color: "var(--color-text)",
                    fontFamily: "Manrope, sans-serif"
                  }}>
                    {streak} days
                  </span>
                </div>
                <span style={{ fontSize: "1.5rem" }}>🔥</span>
              </motion.div>
            </motion.div>

            {/* Wellness Tip - NO BORDER (NOW WITH 30 ROTATING TIPS) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              style={{
                backgroundColor: "#5a6b54",
                color: "white",
                padding: "2.2rem",
                borderRadius: "1.75rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "280px",
                boxShadow: "0 8px 28px rgba(90, 107, 84, 0.2)",
                position: "relative",
                overflow: "hidden",
              }}
              whileHover={{ 
                y: -6,
                boxShadow: "0 16px 40px rgba(90, 107, 84, 0.3)"
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <motion.div
                animate={{ opacity: [0.08, 0.12, 0.08] }}
                transition={{ duration: 4, repeat: Infinity }}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.08) 0%, transparent 50%)",
                  pointerEvents: "none"
                }}
              />
              
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ width: "55px", height: "55px", borderRadius: "1rem", backgroundColor: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem", backdropFilter: "blur(8px)" }}>
                  <span style={{ fontSize: "1.8rem" }}>💡</span>
                </div>
                <h3 style={{ 
                  fontSize: "1.5rem", 
                  fontWeight: "900", 
                  marginBottom: "1rem", 
                  lineHeight: 1.2,
                  fontFamily: "Manrope, sans-serif",
                  margin: 0
                }}>
                  Daily Wellness Tip
                </h3>
                <p style={{ 
                  fontSize: "1rem", 
                  fontWeight: "500", 
                  opacity: 0.95, 
                  lineHeight: 1.7,
                  fontFamily: "Manrope, sans-serif",
                  margin: 0
                }}>
                  {currentTip}
                </p>
              </div>

              <motion.button
                whileHover={{ x: 4 }}
                style={{
                  width: "fit-content",
                  marginTop: "1.5rem",
                  borderBottom: "2px solid white",
                  paddingBottom: "0.2rem",
                  fontSize: "0.75rem",
                  fontWeight: "900",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  background: "none",
                  color: "white",
                  cursor: "pointer",
                  position: "relative",
                  zIndex: 2,
                  fontFamily: "Manrope, sans-serif",
                  border: "none",
                  padding: 0
                }}
              >
                Learn More
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* ─── Bottom Row ────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: "2rem" }}>
          
          {/* Emotional Balance - NO BORDER */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: "1.75rem",
              minHeight: "320px",
              cursor: "pointer",
              display: "flex",
              alignItems: "flex-end",
              boxShadow: "0 8px 28px rgba(0,0,0,0.10)"
            }}
            whileHover={{ 
              y: -6,
              boxShadow: "0 20px 48px rgba(0,0,0,0.15)"
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <motion.div
              style={{
                position: "absolute",
                inset: 0,
                background: getEmotionGradient(),
              }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.8 }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.5), rgba(0,0,0,0.25), transparent)" }} />
            
            <div style={{ position: "relative", zIndex: 1, padding: "2.5rem", color: "white" }}>
              <h3 style={{ 
                fontSize: "2rem", 
                fontWeight: "900", 
                marginBottom: "1rem",
                fontFamily: "Manrope, sans-serif",
                margin: 0
              }}>
                Emotional Balance
              </h3>
              <p style={{ 
                fontSize: "1rem", 
                maxWidth: "320px", 
                marginBottom: "1.75rem", 
                opacity: 0.95, 
                lineHeight: 1.6,
                fontFamily: "Manrope, sans-serif",
                margin: 0,
                fontWeight: "500"
              }}>
                Your emotional volatility index has dropped by 14% this week. You are approaching your peak wellness window.
              </p>
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                style={{
                  backgroundColor: "white",
                  color: "var(--color-text)",
                  paddingLeft: "1.8rem",
                  paddingRight: "1.8rem",
                  paddingTop: "0.85rem",
                  paddingBottom: "0.85rem",
                  borderRadius: "9999px",
                  fontWeight: "900",
                  fontSize: "0.8rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  boxShadow: "0 12px 28px rgba(0,0,0,0.25)",
                  cursor: "pointer",
                  border: "none",
                  fontFamily: "Manrope, sans-serif"
                }}
              >
                Full Report
              </motion.button>
            </div>
          </motion.div>

          {/* Daily Reflection - NO BORDER */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{
              backgroundColor: "var(--color-surface)",
              padding: "2.2rem",
              borderRadius: "1.75rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "320px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)"
            }}
            whileHover={{ 
              y: -6,
              boxShadow: "0 20px 40px rgba(0,0,0,0.10)"
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                <span style={{ 
                  fontSize: "0.75rem", 
                  fontWeight: "900", 
                  letterSpacing: "0.12em", 
                  color: "var(--color-text-muted)", 
                  textTransform: "uppercase",
                  fontFamily: "Manrope, sans-serif"
                }}>
                  Daily Reflection
                </span>
                <div style={{ display: "flex", marginLeft: "-0.6rem" }}>
                  {posts.slice(0, 3).map((post, idx) => (
                    <img
                      key={idx}
                      src={post.userPhotoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.userName}`}
                      alt={post.userName}
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        border: "2.5px solid var(--color-surface)",
                        marginLeft: "-10px",
                        objectFit: "cover",
                      }}
                    />
                  ))}
                  {posts.length > 3 && (
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        backgroundColor: "var(--color-primary)",
                        color: "white",
                        fontSize: "0.65rem",
                        fontWeight: "900",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2.5px solid var(--color-surface)",
                        marginLeft: "-10px",
                      }}
                    >
                      +{posts.length - 3}
                    </div>
                  )}
                </div>
              </div>

              <h3 style={{ 
                fontSize: "1.3rem", 
                fontWeight: "900", 
                color: "var(--color-text)", 
                marginBottom: "0.75rem", 
                lineHeight: 1.3,
                fontFamily: "Manrope, sans-serif",
                margin: 0
              }}>
                What is one thing that made you smile unexpectedly today?
              </h3>
              <p style={{ 
                color: "var(--color-text-muted)", 
                fontSize: "1rem",
                fontFamily: "Manrope, sans-serif",
                margin: 0,
                fontWeight: "500"
              }}>
                Join {posts.length || 42} others sharing their joy in the Community.
              </p>
            </div>

            <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.8rem", alignItems: "flex-end" }}>
              <textarea
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                placeholder="Type your thoughts..."
                style={{
                  flex: 1,
                  height: "52px",
                  backgroundColor: "var(--color-surface-2)",
                  borderRadius: "9999px",
                  padding: "0.9rem 1.5rem",
                  border: "none",
                  color: "var(--color-text)",
                  fontSize: "1rem",
                  fontFamily: "Manrope, sans-serif",
                  resize: "none",
                  outline: "none",
                  transition: "all 200ms ease",
                  fontWeight: "500"
                }}
                onFocus={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-surface)";
                  e.currentTarget.style.boxShadow = "0 0 0 2px var(--color-primary)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-surface-2)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
                onClick={handleSubmitReflection}
                disabled={!reflectionText.trim() || submittingPost}
                style={{
                  width: "52px",
                  height: "52px",
                  backgroundColor: "#5a6b54",
                  color: "white",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "none",
                  cursor: submittingPost ? "not-allowed" : "pointer",
                  fontSize: "1.2rem",
                  boxShadow: "0 4px 16px rgba(90, 107, 84, 0.3)",
                  opacity: submittingPost ? 0.6 : 1,
                  transition: "all 200ms ease",
                  flexShrink: 0,
                }}
              >
                {submittingPost ? "..." : "→"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.main>
  );
}