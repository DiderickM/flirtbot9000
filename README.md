# FlirtBot9000 🤖

A modern AI-powered chatbot application featuring an Angular frontend and Node.js backend that communicates with local Ollama models.

## ✨ Features

- **Modern Chat Interface**: Beautiful, responsive chat UI built with Angular 17
- **Ollama Integration**: Seamlessly connects to local Ollama models
- **Real-time Communication**: Instant message exchange with typing indicators
- **Environment Configuration**: Easy model and server configuration via environment variables
- **Responsive Design**: Mobile-friendly interface with modern animations
- **Health Monitoring**: Built-in backend health checks
- **Conversation Management**: Clear chat history and model information

## 🏗️ Architecture

```
┌─────────────────┐    HTTP/WebSocket    ┌─────────────────┐
│   Angular       │ ◄──────────────────► │   Node.js       │
│   Frontend      │                      │   Backend       │
│   (Port 4200)   │                      │   (Port 3000)   │
└─────────────────┘                      └─────────────────┘
                                                      │
                                                      ▼
                                              ┌─────────────────┐
                                              │   Ollama        │
                                              │   (Port 11434)  │
                                              └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 20 LTS** (use nvm with the provided `.nvmrc`)
- **nvm** (recommended for managing Node versions)
- **Angular CLI** (v17 or higher)
- **Ollama** installed and running locally
- **Git**

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd flirtbot9000
```

Use the project's Node version:

```bash
# Install and use the Node version from .nvmrc
nvm install
nvm use

# Verify
node -v   # should be v20.x
```

### 2. Backend Setup

```bash
# Install backend dependencies
npm install

# Copy environment configuration
cp env.example .env

# Edit .env file with your Ollama configuration
nano .env
```

**Environment Variables:**
```bash
# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2          # Your preferred model
OLLAMA_TEMPERATURE=0.7
OLLAMA_MAX_TOKENS=2048

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:4200
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Angular dependencies
npm install

# Install Angular CLI globally (if not already installed)
npm install -g @angular/cli
```

### 4. Start Services

**Terminal 1 - Backend:**
```bash
# From project root
npm run dev
```

**Terminal 2 - Frontend:**
```bash
# From frontend directory
ng serve
```

**Terminal 3 - Ollama (if not running):**
```bash
# Start Ollama service
ollama serve

# Pull a model (if not already downloaded)
ollama pull llama2
```

### 5. Access the Application

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000
- **Ollama**: http://localhost:11434

## 🔧 Configuration

### Ollama Models

The application automatically detects available models from your Ollama installation. You can specify which model to use by setting the `OLLAMA_MODEL` environment variable.

**Popular Models:**
- `llama2` - Meta's Llama 2 (7B, 13B, 70B variants)
- `mistral` - Mistral AI's 7B model
- `codellama` - Code-optimized Llama variant
- `llama2-uncensored` - Uncensored conversation model

### Customizing the Chat Experience

You can adjust the AI's behavior by modifying these environment variables:

- **Temperature**: Controls randomness (0.0 = deterministic, 1.0 = creative)
- **Max Tokens**: Maximum response length
- **Model**: Choose different Ollama models for different use cases

## 📱 Usage

1. **Start a Conversation**: Type your message in the chat input
2. **Send Messages**: Press Enter or click the send button
3. **Clear Chat**: Use the "Clear Chat" button to start fresh
4. **Health Check**: Monitor backend status with the health check button
5. **Model Info**: See which Ollama model is currently active

## 🛠️ Development

### Project Structure

```
flirtbot9000/
├── backend/                 # Node.js/Express server
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── frontend/               # Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── chat/       # Chat component
│   │   │   ├── services/   # Chat service
│   │   │   └── ...
│   │   ├── styles.scss     # Global styles
│   │   └── main.ts         # App entry point
│   └── package.json        # Frontend dependencies
├── .env                     # Environment configuration
├── env.example             # Environment template
└── README.md               # This file
```

### Available Scripts

**Backend:**
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

**Frontend:**
- `ng serve` - Start development server
- `ng build` - Build for production
- `ng test` - Run unit tests

### Adding New Features

1. **New API Endpoints**: Add routes in `server.js`
2. **New Components**: Use Angular CLI: `ng generate component component-name`
3. **New Services**: Create in `frontend/src/app/services/`
4. **Styling**: Modify `frontend/src/styles.scss` or component-specific styles

## 🧪 Testing

```bash
# Run backend tests (when implemented)
npm test

# Run frontend tests
cd frontend
ng test
```

## 🚀 Deployment

### Production Build

```bash
# Build frontend
cd frontend
ng build --configuration production

# Build backend
npm run build  # If you implement a build script
```

### Environment Considerations

- Set `NODE_ENV=production`
- Configure production database (if applicable)
- Set up proper CORS origins
- Use environment-specific Ollama configurations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

**Backend won't start:**
- Check if port 3000 is available
- Verify Ollama is running on port 11434
- Check environment variable configuration

**Frontend won't start:**
- Ensure Angular CLI is installed globally
- Check if port 4200 is available
- Verify all dependencies are installed

**Chat not working:**
- Check browser console for errors
- Verify backend is running and accessible
- Check CORS configuration
- Ensure Ollama model is downloaded and running

**Ollama connection issues:**
- Verify Ollama service is running: `ollama serve`
- Check if model is downloaded: `ollama list`
- Test Ollama API directly: `curl http://localhost:11434/api/tags`

### Getting Help

- Check the browser console for error messages
- Review backend server logs
- Verify Ollama service status
- Check network connectivity between services

## 🔮 Future Enhancements

- [ ] User authentication and conversation persistence
- [ ] Multiple chat rooms/conversations
- [ ] File upload and document processing
- [ ] Voice input/output capabilities
- [ ] Advanced model parameter controls
- [ ] Conversation export/import
- [ ] Real-time collaborative features
- [ ] Mobile app versions

---

**Happy Chatting! 🤖💬**
