import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = process.env.PORT || 3000;
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.7-flash';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/chat', async (req, res) => {
  try {
    const messages = req.body?.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'A non-empty messages array is required.' });
    }

    const safeMessages = messages
      .filter(m => m && ['user', 'assistant'].includes(m.role) && typeof m.content === 'string')
      .slice(-30);

    const conversationText = safeMessages.map(m =>
      `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
    ).join('\n\n');

    let response;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: MODEL,
          contents: conversationText,
          config: {
            systemInstruction: 'You are Hiruy AI, a helpful, friendly and accurate assistant. Explain things clearly, especially for beginners. Use concise structure and examples when useful.'
          }
        });
        break;
      } catch (error) {
        if (error.status !== 503 || attempt === 3) throw error;
        console.log(`Gemini temporarily unavailable. Retrying (${attempt}/3)...`);
        await new Promise(resolve => setTimeout(resolve, attempt * 3000));
      }
    }

    res.json({ response: response.text });
  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({ error: error?.message || 'AI request failed.' });
  }
});

app.listen(PORT, () => console.log(`AI Chat App running at http://localhost:${PORT}`));
