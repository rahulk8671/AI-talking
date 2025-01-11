import { useState } from 'react';

export const useSpeechRecognition = (onResultCallback) => {
	const [spokenText, setSpokenText] = useState("");
    const [isListening, setIsListening] = useState(false);

	const startListening = () => {
		const recognition = new window.webkitSpeechRecognition();
		recognition.lang = "en-US";
		recognition.interimResults = false;

		recognition.onresult = (event) => {
            setIsListening(false);
			const text = event.results[0][0].transcript;
			setSpokenText(text);

			if (onResultCallback) {
				onResultCallback(text);
			}
		};

		recognition.onerror = (event) => {
			setIsListening(false)
			console.error("Speech recognition error", event.error);
		};

        setIsListening(true);
		recognition.start();
	};

	return {
        isListening,
		spokenText,
		startListening,
	};
};
