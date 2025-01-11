import { useState, useEffect } from 'react';

export const useSpeechSynthesis = () => {
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [selectedVoice2, setSelectedVoice2] = useState(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

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

        if (synth.getVoices().length > 0) {
            loadVoices();
        } else {
            synth.addEventListener("voiceschanged", loadVoices);
        }

        return () => {
            synth.removeEventListener("voiceschanged", loadVoices);
        };
    }, []);

    const speak = (text, cb = false, type = 'female') => {
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

    const cancelSpeaking = () => {
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
