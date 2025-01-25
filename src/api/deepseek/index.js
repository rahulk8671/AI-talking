import { context as defaultContext } from "../Gemini/Context/index.js"

class DeepSeek {
    constructor(context = false) {
        this.context = context || defaultContext
    }

    sendMessage = async ({ message, history }) => {
        try {
            // normalize history
            history = history.map(item => {
                return {
                    role: item.role == 'model' ? "assistant" : "user",
                    content: item.parts[0].text
                }
            })

            if (this.context) {
                history.unshift({
                    role: 'system',
                    content: this.context
                })
            }

            let response = await fetch(import.meta.env.VITE_DEEP_SEEK_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ context: this.context, history }),
            })

            response = await response.json()

            return response.content
        } catch (error) {
            console.error(error)

            return ''
        }
    }
}

export default DeepSeek