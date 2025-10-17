import { useState, useEffect } from 'react';
import axios from 'axios';
import { ChatMessage, ChatRequest, ChatResponse } from '@sjsu-mhc/types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';

export const useChat = (sessionId: string | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      loadChatHistory();
    }
  }, [sessionId]);

  const loadChatHistory = async () => {
    if (!sessionId) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/api/chat/history/${sessionId}`);
      setMessages(response.data.data.messages || []);
    } catch (error) {
      console.error('Failed to load chat history:', error);
      // Don't set error for history loading failure, just start with empty messages
    }
  };

  const sendMessage = async (message: string) => {
    if (!sessionId) {
      throw new Error('No session ID available');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Add user message immediately to UI
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        sessionId,
        content: message,
        role: 'user',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);

      // Send to API
      const request: ChatRequest = {
        sessionId,
        message
      };

      const response = await axios.post<ChatResponse>(`${API_BASE_URL}/api/chat/send`, request);

      if (response.data.success) {
        // Add assistant response
        const assistantMessage: any = {
          id: `assistant-${Date.now()}`,
          sessionId,
          content: response.data.message || 'No response received',
          role: 'assistant',
          timestamp: new Date(),
          cards: response.data.cards
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(response.data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Remove the user message we added optimistically
      setMessages(prev => prev.slice(0, -1));
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      setError(errorMessage);
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setError(null);
  };

  const retryLastMessage = async () => {
    if (messages.length === 0) return;

    const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
    if (lastUserMessage) {
      // Remove the last user message and any assistant response
      setMessages(prev => {
        const lastUserIndex = prev.findIndex(msg => msg.id === lastUserMessage.id);
        return prev.slice(0, lastUserIndex);
      });
      
      // Retry sending the message
      await sendMessage(lastUserMessage.content);
    }
  };

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    retryLastMessage,
    loadChatHistory
  };
};
