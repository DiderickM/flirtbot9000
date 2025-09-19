#!/bin/bash

# FlirtBot9000 Startup Script
echo "🚀 Starting FlirtBot9000..."

# Check if Ollama is running
echo "🔍 Checking Ollama service..."
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "⚠️  Ollama is not running. Please start Ollama first:"
    echo "   ollama serve"
    echo ""
    echo "Then pull a model:"
    echo "   ollama pull llama2"
    echo ""
    read -p "Press Enter to continue anyway..."
else
    echo "✅ Ollama is running"
fi

# Start backend
echo "🔧 Starting backend server..."
cd "$(dirname "$0")"
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend using local Angular CLI via npm script
echo "🎨 Starting frontend..."
cd frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "🎉 FlirtBot9000 is starting up!"
echo ""
echo "📱 Frontend: http://localhost:4200"
echo "🔧 Backend:  http://localhost:3000"
echo "🤖 Ollama:   http://localhost:11434"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
