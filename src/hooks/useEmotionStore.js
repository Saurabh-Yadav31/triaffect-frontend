import { useState, useEffect } from "react";

const defaultEmotion = {
  text: null,
  audio: null,
  face: null,
  combined: null,
  timestamp: null,
};

let globalEmotion = defaultEmotion;
const listeners = new Set();

function setGlobalEmotion(newEmotion) {
  globalEmotion = { ...newEmotion, timestamp: new Date().toISOString() };
  listeners.forEach((fn) => fn(globalEmotion));
}

export function useEmotionStore() {
  const [emotion, setEmotion] = useState(globalEmotion);

  useEffect(() => {
    listeners.add(setEmotion);
    return () => listeners.delete(setEmotion);
  }, []);

  const setDetectedEmotion = (result) => {
    setGlobalEmotion(result);
  };

  const clearEmotion = () => {
    setGlobalEmotion(defaultEmotion);
  };

  return { emotion, setDetectedEmotion, clearEmotion };
}