import React, { useState, useRef, useEffect } from 'react';
import { Send, AlertTriangle, MessageCircle } from 'lucide-react';
import { SupportCardComponent } from './SupportCard';
import { useChat } from '../hooks/useChat';

interface ChatInterfaceProps {
  sessionId: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ sessionId }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, error } = useChat(sessionId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage('');
    setIsLoading(true);

    try {
      await sendMessage(userMessage);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Welcome Message */}
      {messages.length === 0 && (
        <div className="card mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <MessageCircle className="h-8 w-8 text-sjsu-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Welcome to SJSU Mental Health Concierge
            </h2>
          </div>
          <p className="text-gray-700 mb-4">
            I'm here to help you find the right CAPS resources. You can ask me about:
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
            <li>• Scheduling appointments</li>
            <li>• Drop-in counseling hours</li>
            <li>• Stress management workshops</li>
            <li>• Crisis support resources</li>
            <li>• Mental health workshops</li>
            <li>• Peer support groups</li>
          </ul>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="crisis-alert mb-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span className="font-medium">Error:</span>
            <span className="ml-2">{error}</span>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="space-y-4 mb-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message ${msg.role}`}>
            <div className="flex items-start space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                msg.role === 'user' 
                  ? 'bg-sjsu-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {msg.role === 'user' ? 'U' : 'A'}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-sm">
                    {msg.role === 'user' ? 'You' : 'Assistant'}
                  </span>
                  {msg.isCrisis && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      Crisis Detected
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-gray-800 whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="chat-message assistant">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                A
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-sm">Assistant</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="animate-pulse flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-500 ml-2">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Support Cards */}
      {messages.length > 0 && (messages[messages.length - 1] as any)?.cards && (
        <div className="space-y-4 mb-6">
          {(messages[messages.length - 1] as any).cards?.map((card: any) => (
            <SupportCardComponent key={card.id} card={card} />
          ))}
        </div>
      )}

      {/* Chat Input */}
      <form onSubmit={handleSubmit} className="card">
        <div className="flex space-x-3">
          <div className="flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
              className="input-field resize-none"
              rows={3}
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="btn-primary self-end disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          Your messages are processed securely and not stored beyond this session.
        </div>
      </form>
    </div>
  );
};
