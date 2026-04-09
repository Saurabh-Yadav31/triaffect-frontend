import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Webcam from "react-webcam";
import { useAuth } from "@/context/AuthContext";
import { useEmotionStore } from "@/hooks/useEmotionStore";
import { saveLog } from "@/firebase/firestore";

export default function Detect() {
  const { currentUser } = useAuth();
  const { setDetectedEmotion } = useEmotionStore();
  
  // ─── State ──────────────────────────────────────────────────────
  const [textInput, setTextInput] = useState("");
  const [capturedImage, setCapturedImage] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareText, setShareText] = useState("");
  const [savingToFirestore, setSavingToFirestore] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);

  const webcamRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // ─── Cleanup ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      if (mediaRecorderRef.current && isRecording) mediaRecorderRef.current.stop();
    };
  }, []);

  // ─── Webcam Capture ─────────────────────────────────────────────
  const captureWebcam = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      setUploadedImage(null);
      setShowWebcam(false);
      setError(null);
    }
  };

  const clearCapture = () => {
    setCapturedImage(null);
    setUploadedImage(null);
  };

  // ─── Image Upload ───────────────────────────────────────────────
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image file size must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result);
        setCapturedImage(null);
        setShowWebcam(false);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // ─── WAV Encoding Function ──────────────────────────────────────
  const encodeWAV = (audioChunks, sampleRate) => {
    const pcmData = [];
    audioChunks.forEach((chunk) => {
      pcmData.push(...chunk);
    });

    const pcm32bit = new Float32Array(pcmData);
    const pcm16bit = new Int16Array(pcmData.length);

    for (let i = 0; i < pcmData.length; i++) {
      pcm16bit[i] = Math.max(-1, Math.min(1, pcmData[i])) < 0 
        ? pcmData[i] * 0x8000 
        : pcmData[i] * 0x7fff;
    }

    const channels = 1;
    const bitDepth = 16;
    const byteRate = sampleRate * channels * (bitDepth / 8);
    const blockAlign = channels * (bitDepth / 8);

    const buffer = new ArrayBuffer(44 + pcm16bit.byteLength);
    const view = new DataView(buffer);

    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + pcm16bit.byteLength, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, "data");
    view.setUint32(40, pcm16bit.byteLength, true);

    new Int16Array(buffer, 44).set(pcm16bit);

    return buffer;
  };

  // ─── Audio Recording (FIXED - Time now shows correctly) ─────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
        }
      });
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const mediaStreamAudioSource = audioContext.createMediaStreamSource(stream);
      const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
      
      const audioChunks = [];

      scriptProcessor.onaudioprocess = (event) => {
        const audioData = event.inputBuffer.getChannelData(0);
        audioChunks.push(new Float32Array(audioData));
      };

      mediaStreamAudioSource.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);

      mediaRecorderRef.current = {
        stop: async () => {
          scriptProcessor.disconnect();
          mediaStreamAudioSource.disconnect();
          stream.getTracks().forEach((track) => track.stop());

          try {
            const wav = encodeWAV(audioChunks, audioContext.sampleRate);
            const wavBlob = new Blob([wav], { type: "audio/wav" });
            console.log("✓ Recorded and converted to WAV, size:", wavBlob.size);
            setAudioBlob(wavBlob);
          } catch (err) {
            console.error("Error encoding WAV:", err);
            setError("Failed to process audio recording");
          }
        },
      };

      setIsRecording(true);
      setRecordingTime(0);
      setError(null);

      // FIX: Use a separate interval that doesn't depend on re-renders
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone error:", err);
      setError("Microphone access denied. Please allow microphone permissions.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const clearAudio = () => {
    setAudioBlob(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // ─── Validate Input ─────────────────────────────────────────────
  const hasValidInput = () => {
    return textInput.trim() || capturedImage || uploadedImage || audioBlob;
  };

  // ─── Analyse Emotion ────────────────────────────────────────────
  const analyzeEmotion = async () => {
    console.log("=== ANALYSIS START ===");
    console.log("Current state:", {
      textInput: textInput.trim(),
      capturedImage: !!capturedImage,
      uploadedImage: !!uploadedImage,
      audioBlob: !!audioBlob,
    });

    if (!hasValidInput()) {
      console.warn("❌ No valid input provided");
      setError("Please provide at least one input to analyse");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const hasText = !!textInput.trim();
      const hasImage = !!(uploadedImage || capturedImage);
      const hasAudio = !!audioBlob;
      const modalityCount = (hasText ? 1 : 0) + (hasImage ? 1 : 0) + (hasAudio ? 1 : 0);

      console.log(`📊 Modality count: ${modalityCount}`);
      console.log(`   - Text: ${hasText ? "✓" : "✗"}`);
      console.log(`   - Image: ${hasImage ? "✓" : "✗"}`);
      console.log(`   - Audio: ${hasAudio ? "✓" : "✗"}`);

      let response;

      // ─── TEXT ONLY ───────────────────────────────────────────
      if (modalityCount === 1 && hasText) {
        console.log("🚀 Routing to: /predict/text (JSON)");
        response = await fetch("http://localhost:8000/predict/text", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: textInput.trim(),
          }),
        });
      }
      // ─── FACE ONLY ───────────────────────────────────────────
      else if (modalityCount === 1 && hasImage) {
        console.log("🚀 Routing to: /predict/face (multipart, field: 'file')");
        const formData = new FormData();
        const imageToSend = uploadedImage || capturedImage;
        const base64Data = imageToSend.split(",")[1];
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const imageBlob = new Blob([bytes], { type: "image/jpeg" });
        formData.append("file", imageBlob, "capture.jpg");

        response = await fetch("http://localhost:8000/predict/face", {
          method: "POST",
          body: formData,
        });
      }
      // ─── AUDIO ONLY ──────────────────────────────────────────
      else if (modalityCount === 1 && hasAudio) {
        console.log("🚀 Routing to: /predict/audio (multipart, field: 'file')");
        const formData = new FormData();
        formData.append("file", audioBlob, "recording.wav");

        response = await fetch("http://localhost:8000/predict/audio", {
          method: "POST",
          body: formData,
        });
      }
      // ─── COMBINED (2 or 3 modalities) ─────────────────────────
      else {
        console.log("🚀 Routing to: /predict/combined (multipart)");
        const formData = new FormData();

        if (hasText) {
          console.log("  ✓ Adding 'text' field");
          formData.append("text", textInput.trim());
        }

        if (hasImage) {
          console.log("  ✓ Adding 'face_file' field");
          const imageToSend = uploadedImage || capturedImage;
          const base64Data = imageToSend.split(",")[1];
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const imageBlob = new Blob([bytes], { type: "image/jpeg" });
          formData.append("face_file", imageBlob, "capture.jpg");
        }

        if (hasAudio) {
          console.log("  ✓ Adding 'audio_file' field");
          formData.append("audio_file", audioBlob, "recording.wav");
        }

        response = await fetch("http://localhost:8000/predict/combined", {
          method: "POST",
          body: formData,
        });
      }

      console.log(`Response Status: ${response.status}`);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          console.error("❌ Backend error response:", errorData);
          errorMessage = errorData.detail || errorMessage;
        } catch (e) {
          const text = await response.text();
          console.error("❌ Backend error text:", text);
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("✅ SUCCESS! Response:", data);

      const transformedResult = {
        emotion: data.top_emotion,
        scores: data.all_emotions,
        modalities_used: data.inputs_used || (data.modality ? [data.modality] : []),
      };

      setResults(transformedResult);
      setDetectedEmotion(transformedResult);

      if (currentUser) {
        setSavingToFirestore(true);
        try {
          await saveLog(currentUser.uid, {
            emotion: transformedResult.emotion,
            scores: transformedResult.scores,
            modalities_used: transformedResult.modalities_used,
            text_snippet: textInput.trim().slice(0, 100),
          });
          console.log("✓ Saved to Firestore");
        } catch (err) {
          console.error("❌ Firestore save error:", err);
        } finally {
          setSavingToFirestore(false);
        }
      }
    } catch (err) {
      console.error("❌ FULL ERROR:", err);
      setError(err.message || "Analysis failed. Check console for details.");
    } finally {
      setLoading(false);
      console.log("=== ANALYSIS END ===\n");
    }
  };

  // ─── Share to Community ─────────────────────────────────────────
  const handleShareClick = () => {
    if (!results) return;
    setShowShareModal(true);
  };

  const submitCommunityPost = async () => {
    if (!currentUser || !results) return;

    try {
      setSavingToFirestore(true);
      const { savePost } = await import("@/firebase/firestore");
      
      await savePost({
        userId: currentUser.uid,
        userName: currentUser.displayName || "Anonymous",
        userPhotoURL: currentUser.photoURL || null,
        text: shareText || `I'm feeling ${results.emotion}!`,
        emotion: results.emotion,
        likes: 0,
      });

      setShowShareModal(false);
      setShareText("");
    } catch (err) {
      console.error("Community post error:", err);
      setError("Failed to share. Please try again.");
    } finally {
      setSavingToFirestore(false);
    }
  };

  // ─── Clear All ──────────────────────────────────────────────────
  const clearAll = () => {
    setTextInput("");
    setCapturedImage(null);
    setUploadedImage(null);
    setAudioBlob(null);
    setRecordingTime(0);
    setResults(null);
    setError(null);
    setShareText("");
    setShowWebcam(false);
  };

  // ─── Emotion Config ─────────────────────────────────────────────
  const emotionEmojis = {
    angry: "😠",
    happy: "😊",
    neutral: "😐",
    sad: "😢",
    stressed: "😰",
  };

  const emotionColors = {
    angry: { color: "#ef4444", bg: "#fee2e2" },
    happy: { color: "#eab308", bg: "#fef9c3" },
    neutral: { color: "#6b7280", bg: "#f3f4f6" },
    sad: { color: "#3b82f6", bg: "#dbeafe" },
    stressed: { color: "#a855f7", bg: "#f3e8ff" },
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{
        padding: "2.5rem 2rem",
        minHeight: "100vh",
        backgroundColor: "var(--color-bg)",
        fontFamily: "Manrope, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2.5rem" }}>
        
        {/* ─── Header ────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          style={{ 
            textAlign: "center", 
            display: "flex", 
            flexDirection: "column", 
            gap: "0.75rem",
            alignItems: "center",
            width: "100%",
          }}
        >
          <h1 style={{ 
            fontSize: "3rem", 
            fontWeight: "900", 
            color: "var(--color-text)",
            margin: 0,
            fontFamily: "Manrope, sans-serif",
            letterSpacing: "-0.02em",
            width: "100%",
          }}>
            Detect Your Emotion
          </h1>
          <p style={{ 
            fontSize: "1.05rem", 
            color: "var(--color-text-muted)", 
            margin: 0,
            lineHeight: 1.6,
            fontFamily: "Manrope, sans-serif",
            fontWeight: "500",
            maxWidth: "700px",
            width: "100%",
          }}>
            Our multimodal AI engine analyzes your sentiment across text, vision, and audio. Give us all three inputs for the best result.
          </p>
        </motion.section>

        {/* ─── Input Cards ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "2rem",
            width: "100%",
          }}
        >
          {/* TEXT CARD */}
          <motion.div
            whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.10)" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              backgroundColor: "var(--color-surface)",
              padding: "2.25rem",
              borderRadius: "1.75rem",
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
              minHeight: "600px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
              <div style={{ width: "50px", height: "50px", borderRadius: "1rem", backgroundColor: "#eff4db", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>
                💬
              </div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--color-text)", margin: 0, fontFamily: "Manrope, sans-serif" }}>
                How are you feeling?
              </h3>
            </div>

            <textarea
              value={textInput}
              onChange={(e) => {
                setTextInput(e.target.value.slice(0, 1000));
                setError(null);
              }}
              placeholder="Type or paste your thoughts here. Be as descriptive as you like..."
              style={{
                width: "100%",
                minHeight: "180px",
                padding: "1.25rem",
                borderRadius: "1.25rem",
                border: "none",
                backgroundColor: "var(--color-surface-2)",
                color: "var(--color-text)",
                fontSize: "1rem",
                fontFamily: "Manrope, sans-serif",
                fontWeight: "500",
                resize: "none",
                outline: "none",
                transition: "all 200ms ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-surface)";
                e.currentTarget.style.boxShadow = "0 0 0 2px var(--color-primary-highlight)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-surface-2)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--color-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "Manrope, sans-serif" }}>
                {textInput.length} / 1000 CHARS
              </span>
              {textInput && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTextInput("")}
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: "700",
                    color: "var(--color-primary)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "Manrope, sans-serif",
                  }}
                >
                  Clear
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* FACE CARD */}
          <motion.div
            whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.10)" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              backgroundColor: "var(--color-surface)",
              padding: "2.25rem",
              borderRadius: "1.75rem",
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
              minHeight: "600px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
              <div style={{ width: "50px", height: "50px", borderRadius: "1rem", backgroundColor: "#d2e1f7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>
                📷
              </div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--color-text)", margin: 0, fontFamily: "Manrope, sans-serif" }}>
                Capture Your Expression
              </h3>
            </div>

            {/* Preview or Webcam */}
            <div style={{ position: "relative", width: "100%", aspectRatio: "1", borderRadius: "1.25rem", overflow: "hidden", backgroundColor: "var(--color-surface-2)", border: "2px dashed var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {uploadedImage || capturedImage ? (
                <img src={uploadedImage || capturedImage} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : showWebcam ? (
                <Webcam ref={webcamRef} style={{ width: "100%", height: "100%" }} />
              ) : (
                <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "2.5rem" }}>📸</span>
                  <p style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-text-muted)", margin: 0, fontFamily: "Manrope, sans-serif" }}>
                    Webcam Ready
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "auto" }}>
              {uploadedImage || capturedImage ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearCapture}
                  style={{
                    padding: "1rem",
                    borderRadius: "0.9rem",
                    backgroundColor: "transparent",
                    color: "var(--color-primary)",
                    border: "2px solid var(--color-primary)",
                    fontWeight: "700",
                    fontSize: "0.85rem",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    fontFamily: "Manrope, sans-serif",
                  }}
                >
                  ✕ Clear
                </motion.button>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowWebcam(!showWebcam)}
                    style={{
                      padding: "1rem",
                      borderRadius: "0.9rem",
                      backgroundColor: "#5a6b54",
                      color: "white",
                      border: "none",
                      fontWeight: "700",
                      fontSize: "0.85rem",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      fontFamily: "Manrope, sans-serif",
                    }}
                  >
                    {showWebcam ? "🚫 Hide Camera" : "📷 Capture Live"}
                  </motion.button>

                  {showWebcam && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={captureWebcam}
                      style={{
                        padding: "1rem",
                        borderRadius: "0.9rem",
                        backgroundColor: "#22c55e",
                        color: "white",
                        border: "none",
                        fontWeight: "700",
                        fontSize: "0.85rem",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        fontFamily: "Manrope, sans-serif",
                      }}
                    >
                      ✓ Take Photo
                    </motion.button>
                  )}

                  <label
                    style={{
                      padding: "1rem",
                      borderRadius: "0.9rem",
                      backgroundColor: "var(--color-surface-2)",
                      color: "var(--color-primary)",
                      border: "2px solid var(--color-primary)",
                      fontWeight: "700",
                      fontSize: "0.85rem",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      textAlign: "center",
                      fontFamily: "Manrope, sans-serif",
                      transition: "all 200ms ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--color-primary)";
                      e.currentTarget.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--color-surface-2)";
                      e.currentTarget.style.color = "var(--color-primary)";
                    }}
                  >
                    📤 Upload Image/Video
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                  </label>
                </>
              )}
            </div>
          </motion.div>

          {/* AUDIO CARD */}
          <motion.div
            whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.10)" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              backgroundColor: "var(--color-surface)",
              padding: "2.25rem",
              borderRadius: "1.75rem",
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
              minHeight: "600px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
              <div style={{ width: "50px", height: "50px", borderRadius: "1rem", backgroundColor: "#ffeddb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>
                🎙️
              </div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--color-text)", margin: 0, fontFamily: "Manrope, sans-serif" }}>
                Record Your Voice
              </h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem", padding: "1.75rem", backgroundColor: "var(--color-surface-2)", borderRadius: "1.25rem", flex: 1, justifyContent: "center" }}>
              <motion.button
                animate={isRecording ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 0.8, repeat: Infinity }}
                onClick={isRecording ? stopRecording : startRecording}
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-primary)",
                  color: "white",
                  border: "none",
                  fontSize: "2.5rem",
                  cursor: "pointer",
                  boxShadow: "0 8px 24px rgba(99, 102, 241, 0.3)",
                  transition: "all 200ms ease",
                }}
              >
                🎙️
              </motion.button>

              <div style={{ textAlign: "center", width: "100%" }}>
                <p style={{ fontSize: "2.2rem", fontWeight: "900", color: "var(--color-text)", margin: 0, fontFamily: "Manrope, sans-serif" }}>
                  {formatTime(recordingTime)}
                </p>
                <p style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--color-text-muted)", marginTop: "0.5rem", margin: 0, fontFamily: "Manrope, sans-serif", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {isRecording ? "🔴 Recording..." : audioBlob ? "✓ Done" : "Tap to Start Recording"}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "auto" }}>
              {audioBlob ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearAudio}
                  style={{
                    padding: "1rem",
                    borderRadius: "0.9rem",
                    backgroundColor: "transparent",
                    color: "var(--color-primary)",
                    border: "2px solid var(--color-primary)",
                    fontWeight: "700",
                    fontSize: "0.85rem",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    fontFamily: "Manrope, sans-serif",
                  }}
                >
                  ✕ Clear Audio
                </motion.button>
              ) : (
                <label
                  style={{
                    padding: "1rem",
                    borderRadius: "0.9rem",
                    backgroundColor: "var(--color-surface-2)",
                    color: "var(--color-primary)",
                    border: "2px solid var(--color-primary)",
                    fontWeight: "700",
                    fontSize: "0.85rem",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    textAlign: "center",
                    fontFamily: "Manrope, sans-serif",
                    transition: "all 200ms ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--color-primary)";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--color-surface-2)";
                    e.currentTarget.style.color = "var(--color-primary)";
                  }}
                >
                  📁 Upload Audio File
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 50 * 1024 * 1024) {
                          setError("Audio file size must be less than 50MB");
                          return;
                        }
                        setAudioBlob(file);
                        setError(null);
                      }
                    }}
                    style={{ display: "none" }}
                  />
                </label>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* ─── Error Message ──────────────────────────────────────────── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                padding: "1.25rem 1.5rem",
                borderRadius: "1rem",
                backgroundColor: "#fee2e2",
                border: "1px solid #fecaca",
                color: "#dc2626",
                fontSize: "0.95rem",
                fontWeight: "600",
                fontFamily: "Manrope, sans-serif",
              }}
            >
              ⚠️ {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Analyse Button ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem" }}
        >
          <motion.button
            whileHover={hasValidInput() ? { scale: 1.06 } : {}}
            whileTap={hasValidInput() ? { scale: 0.94 } : {}}
            onClick={analyzeEmotion}
            disabled={loading || !hasValidInput()}
            style={{
              padding: "1.1rem 3rem",
              borderRadius: "9999px",
              backgroundColor: hasValidInput() ? "#5a6b54" : "var(--color-text-muted)",
              color: "white",
              border: "none",
              fontWeight: "900",
              fontSize: "1rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: hasValidInput() && !loading ? "pointer" : "not-allowed",
              fontFamily: "Manrope, sans-serif",
              opacity: hasValidInput() ? 1 : 0.5,
              transition: "all 200ms ease",
              boxShadow: "0 8px 24px rgba(90, 107, 84, 0.2)",
            }}
          >
            {loading ? "⏳ Analysing..." : "✨ Analyse Emotion"}
          </motion.button>

          <p style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--color-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", margin: 0, fontFamily: "Manrope, sans-serif", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#22c55e" }} />
            Processing handled locally for your privacy
          </p>
        </motion.div>

        {/* ─── Results Section (ORIGINAL CLEAN DESIGN) ────────────────── */}
        <AnimatePresence>
          {results && (
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.6 }}
              style={{
                backgroundColor: "var(--color-surface)",
                padding: "3.5rem",
                borderRadius: "2rem",
                boxShadow: "0 20px 60px rgba(0,0,0,0.10)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2rem",
              }}
            >
              {/* Emotion Emoji - WITH ANIMATION */}
              <motion.div
                animate={{ scale: [0.9, 1.1, 0.9] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ fontSize: "5.5rem" }}
              >
                {emotionEmojis[results.emotion]}
              </motion.div>

              {/* Emotion Label */}
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "0.8rem", fontWeight: "800", color: "var(--color-text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0, marginBottom: "0.5rem", fontFamily: "Manrope, sans-serif" }}>
                  Detected Primary State
                </p>
                <h2 style={{ fontSize: "3.5rem", fontWeight: "900", color: "var(--color-text)", margin: 0, fontFamily: "Manrope, sans-serif", letterSpacing: "-0.01em" }}>
                  {results.emotion.charAt(0).toUpperCase() + results.emotion.slice(1)}
                </h2>
              </div>

              {/* Confidence Badge */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  paddingLeft: "1.25rem",
                  paddingRight: "1.25rem",
                  paddingTop: "0.75rem",
                  paddingBottom: "0.75rem",
                  borderRadius: "9999px",
                  backgroundColor: "#5a6b54",
                  color: "white",
                  fontSize: "0.9rem",
                  fontWeight: "700",
                  fontFamily: "Manrope, sans-serif",
                }}
              >
                ✓ Fusion Confidence: {Math.round(results.scores[results.emotion] * 100)}%
              </div>

              {/* Modalities Breakdown */}
              <div style={{ width: "100%", maxWidth: "500px", display: "flex", flexDirection: "column", gap: "2rem" }}>
                {results.modalities_used.map((mod, idx) => {
                  const labels = { text: "Text Sentiment", face: "Facial Landmarks", audio: "Audio Prosody" };
                  const colors = { text: "#5a6b54", face: "#14b8a6", audio: "#9a6100" };
                  const confidence = Math.round(results.scores[results.emotion] * 100);
                  
                  return (
                    <motion.div
                      key={mod}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 + 0.3 }}
                      style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: "700", textTransform: "uppercase", color: "var(--color-text)", fontFamily: "Manrope, sans-serif", letterSpacing: "0.05em" }}>
                          {labels[mod]}
                        </span>
                        <span style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--color-text)", fontFamily: "Manrope, sans-serif" }}>
                          {confidence}%
                        </span>
                      </div>
                      <div style={{ width: "100%", height: "8px", borderRadius: "9999px", backgroundColor: "var(--color-surface-2)", overflow: "hidden" }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${confidence}%` }}
                          transition={{ delay: idx * 0.1 + 0.4, duration: 1 }}
                          style={{
                            height: "100%",
                            backgroundColor: colors[mod],
                            borderRadius: "9999px",
                          }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", width: "100%", maxWidth: "500px" }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShareClick}
                  disabled={savingToFirestore}
                  style={{
                    flex: 1,
                    padding: "0.9rem",
                    borderRadius: "0.9rem",
                    backgroundColor: "#5a6b54",
                    color: "white",
                    border: "none",
                    fontWeight: "700",
                    fontSize: "0.85rem",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    fontFamily: "Manrope, sans-serif",
                    letterSpacing: "0.06em",
                  }}
                >
                  📤 Share to Community
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearAll}
                  style={{
                    flex: 1,
                    padding: "0.9rem",
                    borderRadius: "0.9rem",
                    backgroundColor: "var(--color-surface-2)",
                    color: "var(--color-primary)",
                    border: "2px solid var(--color-primary)",
                    fontWeight: "700",
                    fontSize: "0.85rem",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    fontFamily: "Manrope, sans-serif",
                    letterSpacing: "0.06em",
                  }}
                >
                  🔄 Try Again
                </motion.button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Share Modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 50,
              padding: "1rem",
            }}
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: "var(--color-surface)",
                borderRadius: "1.75rem",
                padding: "2.25rem",
                maxWidth: "500px",
                width: "100%",
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              }}
            >
              <h3 style={{ fontSize: "1.5rem", fontWeight: "900", marginBottom: "1.25rem", color: "var(--color-text)", margin: 0, fontFamily: "Manrope, sans-serif" }}>
                Share Your Discovery
              </h3>

              {/* Emotion Badge */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  paddingLeft: "1rem",
                  paddingRight: "1rem",
                  paddingTop: "0.5rem",
                  paddingBottom: "0.5rem",
                  borderRadius: "9999px",
                  backgroundColor: emotionColors[results?.emotion]?.bg,
                  color: emotionColors[results?.emotion]?.color,
                  fontSize: "0.9rem",
                  fontWeight: "700",
                  marginBottom: "1.5rem",
                  fontFamily: "Manrope, sans-serif",
                }}
              >
                {emotionEmojis[results?.emotion]} {results?.emotion.charAt(0).toUpperCase() + results?.emotion.slice(1)}
              </div>

              {/* Message Input */}
              <textarea
                value={shareText}
                onChange={(e) => setShareText(e.target.value)}
                placeholder="Add a message..."
                style={{
                  width: "100%",
                  minHeight: "120px",
                  padding: "1rem",
                  borderRadius: "1rem",
                  border: "none",
                  backgroundColor: "var(--color-surface-2)",
                  color: "var(--color-text)",
                  fontSize: "1rem",
                  fontFamily: "Manrope, sans-serif",
                  resize: "none",
                  marginBottom: "1.5rem",
                  outline: "none",
                  transition: "all 200ms ease",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-surface)";
                  e.currentTarget.style.boxShadow = "0 0 0 2px var(--color-primary-highlight)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-surface-2)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />

              {/* Buttons */}
              <div style={{ display: "flex", gap: "1rem" }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={submitCommunityPost}
                  disabled={savingToFirestore}
                  style={{
                    flex: 1,
                    padding: "0.9rem",
                    borderRadius: "0.9rem",
                    backgroundColor: "#5a6b54",
                    color: "white",
                    border: "none",
                    fontWeight: "700",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    fontFamily: "Manrope, sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {savingToFirestore ? "..." : "Share"}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowShareModal(false)}
                  style={{
                    flex: 1,
                    padding: "0.9rem",
                    borderRadius: "0.9rem",
                    backgroundColor: "var(--color-surface-2)",
                    color: "var(--color-text)",
                    border: "none",
                    fontWeight: "700",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    fontFamily: "Manrope, sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}