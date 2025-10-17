import { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';

export const useSession = () => {
  const [isLoading, setIsLoading] = useState(false);

  const createSession = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/consent/create-session`);
      return response.data.data.sessionId;
    } catch (error) {
      console.error('Failed to create session:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getSessionStatus = async (_sessionId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/chat/status`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get session status:', error);
      throw error;
    }
  };

  const clearSession = async (_sessionId: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/chat/session/${_sessionId}`);
    } catch (error) {
      console.error('Failed to clear session:', error);
      throw error;
    }
  };

  return {
    isLoading,
    createSession,
    getSessionStatus,
    clearSession
  };
};
