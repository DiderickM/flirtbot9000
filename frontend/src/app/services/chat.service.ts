import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";

export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  isTyping?: boolean;
}

export interface ChatResponse {
  message: string;
  timestamp: string;
  model: string;
  conversationId: string;
  isPartial?: boolean;
}

export interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
}

export interface Language {
  id: string;
  name: string;
  emoji: string;
  culture: string;
}

@Injectable({
  providedIn: "root",
})
export class ChatService {
  private apiUrl = "http://localhost:3000/api";
  private conversationHistory: ChatMessage[] = [];
  private selectedLanguage: string = "english";

  constructor(private http: HttpClient) {}

  /**
   * Send a message to the chatbot with streaming support
   */
  sendMessage(
    message: string,
    stream: boolean = true
  ): Observable<ChatResponse> {
    const userMessage: ChatMessage = {
      id: this.generateId(),
      content: message,
      role: "user",
      timestamp: new Date(),
    };

    // Add user message to conversation history
    this.conversationHistory.push(userMessage);

    // Prepare conversation history for the API
    const apiHistory = this.conversationHistory
      .filter((msg) => msg.role === "user" || msg.role === "assistant")
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

    if (stream) {
      // Return streaming response
      return new Observable((observer) => {
        fetch(`${this.apiUrl}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
            conversationHistory: apiHistory,
            stream: true,
            language: this.selectedLanguage,
          }),
        })
          .then((response) => {
            const reader = response.body?.getReader();
            let fullResponse = "";

            if (reader) {
              const processText = ({
                done,
                value,
              }: {
                done: boolean;
                value?: Uint8Array;
              }) => {
                if (done) {
                  // Stream complete, emit final response
                  const finalResponse: ChatResponse = {
                    message: fullResponse,
                    timestamp: new Date().toISOString(),
                    model: "streaming",
                    conversationId: Date.now().toString(),
                  };

                  // Add bot response to conversation history
                  const botMessage: ChatMessage = {
                    id: this.generateId(),
                    content: fullResponse,
                    role: "assistant",
                    timestamp: new Date(),
                  };
                  this.conversationHistory.push(botMessage);

                  observer.next(finalResponse);
                  observer.complete();
                  return;
                }

                const chunk = new TextDecoder().decode(value);
                fullResponse += chunk;

                // Emit partial response for real-time updates
                observer.next({
                  message: fullResponse,
                  timestamp: new Date().toISOString(),
                  model: "streaming",
                  conversationId: Date.now().toString(),
                  isPartial: true,
                });

                // Continue reading
                reader.read().then(processText);
              };

              reader.read().then(processText);
            }
          })
          .catch((error) => {
            observer.error(error);
          });
      });
    } else {
      // Return regular response
      return this.http
        .post<ChatResponse>(`${this.apiUrl}/chat`, {
          message,
          conversationHistory: apiHistory,
          stream: false,
          language: this.selectedLanguage,
        })
        .pipe(
          map((response) => {
            // Add bot response to conversation history
            const botMessage: ChatMessage = {
              id: this.generateId(),
              content: response.message,
              role: "assistant",
              timestamp: new Date(response.timestamp),
            };
            this.conversationHistory.push(botMessage);
            return response;
          }),
          catchError((error) => {
            console.error("Error sending message:", error);
            return throwError(
              () => new Error("Failed to send message. Please try again.")
            );
          })
        );
    }
  }

  /**
   * Get available languages
   */
  getAvailableLanguages(): Observable<Language[]> {
    return this.http
      .get<{ languages: Language[] }>(`${this.apiUrl}/languages`)
      .pipe(
        map((response) => response.languages || []),
        catchError((error) => {
          console.error("Error fetching languages:", error);
          return throwError(
            () => new Error("Failed to fetch available languages.")
          );
        })
      );
  }

  /**
   * Set the selected language for conversations
   */
  setLanguage(language: string): void {
    this.selectedLanguage = language;
  }

  /**
   * Get the currently selected language
   */
  getSelectedLanguage(): string {
    return this.selectedLanguage;
  }

  /**
   * Get available Ollama models
   */
  getAvailableModels(): Observable<OllamaModel[]> {
    return this.http
      .get<{ models: OllamaModel[] }>(`${this.apiUrl}/models`)
      .pipe(
        map((response) => response.models || []),
        catchError((error) => {
          console.error("Error fetching models:", error);
          return throwError(
            () => new Error("Failed to fetch available models.")
          );
        })
      );
  }

  /**
   * Get conversation history
   */
  getConversationHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }

  /**
   * Clear conversation history
   */
  clearConversation(): void {
    this.conversationHistory = [];
  }

  /**
   * Generate a unique ID for messages
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Check if the backend is healthy
   */
  checkHealth(): Observable<any> {
    return this.http.get(`${this.apiUrl.replace("/api", "")}/health`).pipe(
      catchError((error) => {
        console.error("Health check failed:", error);
        return throwError(() => new Error("Backend service is not available."));
      })
    );
  }
}
