# My AI Chat - HIRUY TECHNOLOGIES

A simple AI chat application built for a beginner web development project.

## Technologies

- HTML
- CSS
- JavaScript
- Node.js and Express
- Gemini API

## Features

### Main project requirements
- Type a prompt and click Send
- Display user messages
- Get an AI response from Gemini
- Continue the conversation
- Send previous conversation messages to the AI
- Loading/typing indicator
- Empty message validation
- Error handling

### Bonus features
- Clear Chat
- New Chat button
- Sidebar with quick questions
- Dark Mode
- Character counter
- Enter-to-send
- Shift + Enter for a new line
- AI typing animation
- LocalStorage chat history
- Responsive mobile layout

## Setup

1. Open a terminal in this project folder.
2. Run `npm install`.
3. Copy `.env.example` to `.env`.
4. Put your Gemini API key in `.env`.
5. Run `npm start`.
6. Open http://localhost:3000.

## Important

Never put your API key in the `public` folder or upload `.env` to GitHub.

The chat history is stored in the browser with LocalStorage. The AI API key stays on the Node.js server.
