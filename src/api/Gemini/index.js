import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { context as defaultContext } from "./Context/index.js"

class Gemini {
    constructor(context = false) {
        const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: context || defaultContext,
            safetySettings: [
				{
				  category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
				  threshold: HarmBlockThreshold.BLOCK_NONE,
				},
				{
				  category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
				  threshold: HarmBlockThreshold.BLOCK_NONE,
				},
				{
					category: HarmCategory.HARM_CATEGORY_HARASSMENT,
					threshold: HarmBlockThreshold.BLOCK_NONE,
				},
				{
					category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
					threshold: HarmBlockThreshold.BLOCK_NONE,
				}
			],
        });

        this.model = model;
    }

    generationConfig = {
        maxOutputTokens: 1000,
    }

    sendMessage = async ({ message, history }) => {
        try {
            const chat = this.model.startChat({
                history: history,
                generationConfig: this.generationConfig
            });
    
            const result = await chat.sendMessage(message);
            console.log('result',result)
    
            const response = await result.response
    
            const text = response.text()
    
            return text
        } catch (error) {
            console.error(error)

            return ''
        }
    }

    generateContent = async ({ message }) => {
        const result = await this.model.generateContent([message]);

        const response = await result.response

        const text = response.text()
        console.log('text',text)

        return text
    }
}

export default Gemini