import { useCallback, useEffect, useState } from 'react';

export function useSpeech() {
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    const checkSupport = () => {
      setIsSupported('speechSynthesis' in window);
    };

    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);

      // Prefer Spanish voices, then English, then any available
      const spanishVoice = availableVoices.find(voice => 
        voice.lang.startsWith('es') && voice.name.includes('Google')
      ) || availableVoices.find(voice => voice.lang.startsWith('es'));

      const englishVoice = availableVoices.find(voice => 
        voice.lang.startsWith('en') && voice.name.includes('Google')
      ) || availableVoices.find(voice => voice.lang.startsWith('en'));

      setSelectedVoice(spanishVoice || englishVoice || availableVoices[0] || null);
    };

    checkSupport();
    loadVoices();

    // Load voices when they become available
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  const speak = useCallback((text: string, options: { rate?: number; pitch?: number; volume?: number } = {}) => {
    if (!isSupported || !selectedVoice) return;

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.rate = options.rate || 0.9;
    utterance.pitch = options.pitch || 1.1;
    utterance.volume = options.volume || 0.8;

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
    };

    speechSynthesis.speak(utterance);
  }, [isSupported, selectedVoice]);

  const speakNumber = useCallback((number: number) => {
    if (!isSupported) return;

    const utterance = new SpeechSynthesisUtterance(`${number}`);
    utterance.rate = 0.8;
    utterance.volume = 0.7;

    speechSynthesis.speak(utterance);
  }, [isSupported]);

  const speakBingo = useCallback(() => {
    speak('¡BINGO!', { rate: 0.7, pitch: 1.3, volume: 1.0 });
  }, [speak]);

  return {
    speak,
    speakNumber,
    speakBingo,
    isSupported,
    voices,
    selectedVoice,
    setSelectedVoice
  };
}