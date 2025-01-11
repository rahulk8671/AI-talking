import { useState, useMemo, useEffect } from 'react';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import microphone from './assets/microphone.svg';
import speaker from './assets/speaker.svg';
import loading from './assets/loading.svg';
import stop from './assets/stop.svg';
import Gemini from './api/Gemini';

function App() {
	const gemini = useMemo(() => new Gemini(), []);
	const gemini1 = useMemo(() => new Gemini(), []);
	const gemini2 = useMemo(() => new Gemini(), []);
	
	const { speak, isSpeaking, cancelSpeaking } = useSpeechSynthesis();
	const { speak: speak1, isSpeaking: isSpeaking1, cancelSpeaking: cancelSpeaking1 } = useSpeechSynthesis();
	const { speak: speak2, isSpeaking: isSpeaking2, cancelSpeaking: cancelSpeaking2 } = useSpeechSynthesis();

	const [history, setHistory] = useState([]);

	const [history1, setHistory1] = useState([]);
	const [history2, setHistory2] = useState([]);

	const [isLoading, setIsLoading] = useState(false);

	const [isGemeni1Loading, setIsGemeni1Loading] = useState(false);
	const [isGemeni2Loading, setIsGemeni2Loading] = useState(false);

	const onRecognitionResult = async (text) => {
		setHistory((prevHistory) => [...prevHistory, { role: "user", parts: [{ text }] }]);

		setIsLoading(true);

		const responseText = await gemini.sendMessage({ message: text, history: history });

		if (!responseText) {
			alert('Something went wrong. Please try again.');
		}

		setIsLoading(false);
		setHistory((prevHistory) => [...prevHistory, { role: "model", parts: [{ text: responseText }] }]);

		speak(responseText, () => {
			startListening();
		}); // Repeat the response from the server
	};

	const onRecognitionResult1 = async (text) => {
		console.log('onRecognitionResult1', text);
		setHistory1((prevHistory) => [...prevHistory, { role: "user", parts: [{ text }] }]);

		setIsGemeni1Loading(true);

		const responseText = await gemini1.sendMessage({ message: text, history: history1 });

		if (!responseText) {
			alert('Something went wrong. Please try again.');
		}

		setIsGemeni1Loading(false);
		setHistory1((prevHistory) => [...prevHistory, { role: "model", parts: [{ text: responseText }] }]);

		speak1(responseText, () => {
			console.log('done speaking speak1', responseText);
			onRecognitionResult2(responseText);
		}, 'female'); // Repeat the response from the server
	}; 

	const onRecognitionResult2 = async (text) => {
		console.log('onRecognitionResult2', text);
		setHistory2((prevHistory) => [...prevHistory, { role: "user", parts: [{ text }] }]);

		setIsGemeni2Loading(true);

		const responseText = await gemini2.sendMessage({ message: text, history: history2 });

		if (!responseText) {
			alert('Something went wrong. Please try again.');
		}

		setIsGemeni2Loading(false);
		setHistory2((prevHistory) => [...prevHistory, { role: "model", parts: [{ text: responseText }] }]);

		speak2(responseText, () => {
			console.log('done speaking speak2', responseText);
			onRecognitionResult1(responseText);
		}, 'male'); // Repeat the response from the server
	};

	// useEffect(() => {
	// 	setTimeout(() => {
	// 		onRecognitionResult1('Hello');
	// 	}, 5000)
	// }, [])

	const { startListening, isListening } = useSpeechRecognition(onRecognitionResult);

	return (
		<div style={{ display: 'flex', background: 'gray', height: '100vh', width: '100vw' }}>
			{/*<div style={{ display: 'flex', borderRight: '5px solid #222831', background: '#31363F', height: '100%', width: '50%', justifyContent: 'center', alignItems: 'center' }}>
				<div onClick={startListening} style={{ cursor: 'pointer', animation: isListening ? 'expand 0.8s ease-in-out infinite' : 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '200px', height: '200px', background: '#222831', borderRadius: '50%' }}>
					<img src={microphone} style={{ width: '100px', height: '100px' }} onClick={startListening} />
				</div>
			</div>*/}
			<button onClick={() => onRecognitionResult1('Hello')}>Start</button>
			<div style={{ borderRight: '5px solid #222831', position: 'relative', display: 'flex', background: '#31363F', height: '100%', width: '50%', justifyContent: 'center', alignItems: 'center' }}>
				<div style={{ animation: isSpeaking1 ? 'expand 0.8s ease-in-out infinite' : 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '200px', height: '200px', background: '#222831', borderRadius: '50%' }}>
					<img src={speaker} style={{ width: '100px', height: '100px' }} />
				</div>

				{isGemeni1Loading && <div style={{ position: 'absolute', bottom: '0', left: '50%', transform: 'translate(-50%, -50%)' }}>
					<img src={loading} style={{ width: '100px', height: '100px' }} />
				</div>}

				{isSpeaking1 && <div style={{ cursor: 'pointer', position: 'absolute', bottom: '0', left: '50%', transform: 'translate(-50%, -50%)' }}>
					<img src={stop} style={{ width: '100px', height: '100px' }} onClick={() => cancelSpeaking1()} />
				</div>}
			</div>
			<div style={{ position: 'relative', display: 'flex', background: '#31363F', height: '100%', width: '50%', justifyContent: 'center', alignItems: 'center' }}>
				<div style={{ animation: isSpeaking2 ? 'expand 0.8s ease-in-out infinite' : 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '200px', height: '200px', background: '#222831', borderRadius: '50%' }}>
					<img src={speaker} style={{ width: '100px', height: '100px' }} />
				</div>

				{isGemeni2Loading && <div style={{ position: 'absolute', bottom: '0', left: '50%', transform: 'translate(-50%, -50%)' }}>
					<img src={loading} style={{ width: '100px', height: '100px' }} />
				</div>}

				{isSpeaking2 && <div style={{ cursor: 'pointer', position: 'absolute', bottom: '0', left: '50%', transform: 'translate(-50%, -50%)' }}>
					<img src={stop} style={{ width: '100px', height: '100px' }} onClick={() => cancelSpeaking2()} />
				</div>}
			</div>
		</div>
	);
}

export default App;
