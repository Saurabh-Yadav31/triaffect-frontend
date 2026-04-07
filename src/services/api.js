import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000',
});

export const predictText = (text) =>
  API.post('/predict/text', { text });

export const predictFace = (imageFile) => {
  const form = new FormData();
  form.append('file', imageFile);
  return API.post('/predict/face', form);
};

export const predictAudio = (audioFile) => {
  const form = new FormData();
  form.append('file', audioFile);
  return API.post('/predict/audio', form);
};

export const predictCombined = (text, faceFile, audioFile) => {
  const form = new FormData();
  if (text) form.append('text', text);
  if (faceFile) form.append('face_file', faceFile);
  if (audioFile) form.append('audio_file', audioFile);
  return API.post('/predict/combined', form);
};