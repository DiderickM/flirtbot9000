import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ChatService, ChatMessage, Language } from "../services/chat.service";

@Component({
  selector: "app-chat",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.scss"],
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild("chatMessages") private chatMessages!: ElementRef;

  messages: ChatMessage[] = [];
  currentMessage = "";
  isTyping = false;
  currentModel = "";
  isCheckingHealth = false;

  // Language selection
  availableLanguages: Language[] = [];
  selectedLanguage = "english";
  showLanguageSelector = true;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.checkBackendHealth();
    this.loadAvailableModels();
    this.loadAvailableLanguages();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  sendMessage(): void {
    const message = this.currentMessage.trim();
    if (!message || this.isTyping) return;

    // Show the user message immediately in the UI
    const userMessage: ChatMessage = {
      id: this.generateId(),
      content: message,
      role: "user",
      timestamp: new Date(),
    };
    this.messages.push(userMessage);
    this.scrollToBottom();

    this.isTyping = true;
    this.currentMessage = "";

    // Add a placeholder message for the assistant's response
    const assistantMessageId = this.generateId();
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      content: "",
      role: "assistant",
      timestamp: new Date(),
    };
    this.messages.push(assistantMessage);

    this.chatService.sendMessage(message, true).subscribe({
      next: (response) => {
        // Update the assistant's message in real-time
        const messageIndex = this.messages.findIndex(
          (msg) => msg.id === assistantMessageId
        );
        if (messageIndex !== -1) {
          this.messages[messageIndex].content = response.message;
          this.messages[messageIndex].timestamp = new Date(response.timestamp);

          // Update model info if available
          if (response.model && response.model !== "streaming") {
            this.currentModel = response.model;
          }
        }

        this.scrollToBottom();
      },
      error: (error) => {
        this.isTyping = false;
        console.error("Error sending message:", error);

        // Update the assistant's message with error
        const messageIndex = this.messages.findIndex(
          (msg) => msg.id === assistantMessageId
        );
        if (messageIndex !== -1) {
          this.messages[messageIndex].content = `Error: ${error.message}`;
        }

        this.scrollToBottom();
      },
      complete: () => {
        this.isTyping = false;
        this.scrollToBottom();
      },
    });
  }

  clearChat(): void {
    this.chatService.clearConversation();
    this.messages = [];

    // Add welcome message if language is selected
    if (!this.showLanguageSelector) {
      this.addWelcomeMessage();
    }
  }

  checkBackendHealth(): void {
    this.isCheckingHealth = true;
    this.chatService.checkHealth().subscribe({
      next: (health) => {
        this.isCheckingHealth = false;
        console.log("Backend health:", health);
        // You could show a success notification here
      },
      error: (error) => {
        this.isCheckingHealth = false;
        console.error("Backend health check failed:", error);
        // You could show an error notification here
      },
    });
  }

  loadAvailableModels(): void {
    this.chatService.getAvailableModels().subscribe({
      next: (models) => {
        if (models.length > 0) {
          this.currentModel = models[0].name;
        }
      },
      error: (error) => {
        console.error("Failed to load models:", error);
      },
    });
  }

  loadAvailableLanguages(): void {
    this.chatService.getAvailableLanguages().subscribe({
      next: (languages) => {
        this.availableLanguages = languages;
        // Set default language
        this.selectedLanguage = this.chatService.getSelectedLanguage();
      },
      error: (error) => {
        console.error("Failed to load languages:", error);
      },
    });
  }

  selectLanguage(languageId: string): void {
    this.selectedLanguage = languageId;
    this.chatService.setLanguage(languageId);
    this.showLanguageSelector = false;

    // Clear conversation when switching languages (this already adds welcome message)
    this.clearChat();
  }

  toggleLanguageSelector(): void {
    this.showLanguageSelector = !this.showLanguageSelector;
  }

  getCurrentLanguage(): Language | undefined {
    return this.availableLanguages.find(
      (lang) => lang.id === this.selectedLanguage
    );
  }

  private addWelcomeMessage(): void {
    const selectedLang = this.availableLanguages.find(
      (lang) => lang.id === this.selectedLanguage
    );
    if (selectedLang) {
      const welcomeMessage: ChatMessage = {
        id: this.generateId(),
        content: `${selectedLang.emoji} Ready to practice flirting in ${selectedLang.name}! Let's start with something simple - say hello to me! 😉`,
        role: "assistant",
        timestamp: new Date(),
      };
      this.messages.push(welcomeMessage);

      this.scrollToBottom();
    }
  }

  trackByMessageId(index: number, message: ChatMessage): string {
    return message.id;
  }

  private scrollToBottom(): void {
    try {
      this.chatMessages.nativeElement.scrollTop =
        this.chatMessages.nativeElement.scrollHeight;
    } catch (err) {
      // Handle scroll error
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
