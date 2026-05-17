import { useState, useEffect, useRef } from 'react';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
const ELEVENLABS_OUTPUT_FORMAT = 'mp3_44100_128';

export const useSpeechSynthesis = () => {
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [selectedVoice2, setSelectedVoice2] = useState(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const audioRef = useRef(null);
    const audioUrlRef = useRef(null);

    const elevenLabsApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    const elevenLabsModelId = import.meta.env.VITE_ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';
    const elevenLabsVoiceId = import.meta.env.VITE_ELEVENLABS_VOICE_ID;
    const elevenLabsFemaleVoiceId = import.meta.env.VITE_ELEVENLABS_FEMALE_VOICE_ID || elevenLabsVoiceId;
    const elevenLabsMaleVoiceId = import.meta.env.VITE_ELEVENLABS_MALE_VOICE_ID || elevenLabsVoiceId;

    useEffect(() => {
        const synth = window.speechSynthesis;

        const loadVoices = () => {
            const voices = synth.getVoices();
            console.log(voices);
            setVoices(voices);

            // Set the first available voice as the default selection
            if (voices.length > 0) {
                setSelectedVoice(voices[49]?.name || voices[0]?.name);
                setSelectedVoice2(voices[51]?.name || voices[0]?.name);
            }
        };

        if (!synth) {
            return;
        }

        if (synth.getVoices().length > 0) {
            loadVoices();
        } else {
            synth.addEventListener("voiceschanged", loadVoices);
        }

        return () => {
            synth.removeEventListener("voiceschanged", loadVoices);
        };
    }, []);

    const releaseAudioUrl = () => {
        if (audioUrlRef.current) {
            URL.revokeObjectURL(audioUrlRef.current);
            audioUrlRef.current = null;
        }
    };

    const speakWithElevenLabs = async (text, cb, type) => {
        const voiceId = type === 'male' ? elevenLabsMaleVoiceId : elevenLabsFemaleVoiceId;

        if (!elevenLabsApiKey || !voiceId) {
            return false;
        }

        setIsSpeaking(true);

        try {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }

            releaseAudioUrl();

            const response = await fetch(
                `${ELEVENLABS_API_URL}/${voiceId}?output_format=${ELEVENLABS_OUTPUT_FORMAT}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'xi-api-key': elevenLabsApiKey,
                    },
                    body: JSON.stringify({
                        text,
                        model_id: elevenLabsModelId,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`ElevenLabs request failed with ${response.status}`);
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);

            audioUrlRef.current = audioUrl;
            audioRef.current = audio;

            audio.onended = () => {
                releaseAudioUrl();
                audioRef.current = null;
                setIsSpeaking(false);
                cb && cb();
            };

            audio.onerror = () => {
                releaseAudioUrl();
                audioRef.current = null;
                setIsSpeaking(false);
                console.error('ElevenLabs audio playback failed');
            };

            await audio.play();

            return true;
        } catch (error) {
            releaseAudioUrl();
            audioRef.current = null;
            setIsSpeaking(false);
            console.error(error);

            return false;
        }
    };

    const speakWithBrowser = (text, cb = false, type = 'female') => {
        if (selectedVoice && text) {
            setIsSpeaking(true);

            let voiceType = type === 'female' ? selectedVoice : selectedVoice2;

            const voice = voices.find((v) => v.name === voiceType);
            let utterance = new SpeechSynthesisUtterance(text);
            utterance.voice = voice;

            if (speechSynthesis.speaking) {
                speechSynthesis.cancel();
            }

            utterance.onend = () => {
                console.log('Speech has finished');
                cb && cb();
                setIsSpeaking(false);
            };

            speechSynthesis.speak(utterance);

            let r = setInterval(() => {
                if (!speechSynthesis.speaking) {
                    clearInterval(r);
                } else {
                    speechSynthesis.pause();
                    speechSynthesis.resume();
                }
            }, 14000);
        }
    };

    const speak = async (text, cb = false, type = 'female') => {
        if (!text) {
            return;
        }

        const didSpeakWithElevenLabs = await speakWithElevenLabs(text, cb, type);

        if (!didSpeakWithElevenLabs) {
            speakWithBrowser(text, cb, type);
        }
    };

    const cancelSpeaking = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
            releaseAudioUrl();
        }

        speechSynthesis.cancel();
        setIsSpeaking(false);
    };

    return {
        voices,
        selectedVoice,
        setSelectedVoice,
        speak,
        isSpeaking,
        cancelSpeaking,
    };
};
