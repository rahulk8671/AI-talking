# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## ElevenLabs text to speech

Copy `.env.example` to `.env` and add your ElevenLabs API key plus voice IDs:

```env
VITE_ELEVENLABS_API_KEY=your_api_key
VITE_ELEVENLABS_FEMALE_VOICE_ID=voice_id_for_speaker_one
VITE_ELEVENLABS_MALE_VOICE_ID=voice_id_for_speaker_two
```

If these values are missing, the app falls back to the browser's built-in speech synthesis.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
