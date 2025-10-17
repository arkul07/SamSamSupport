import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';

export const useConsent = () => {
  const [hasConsent, setHasConsent] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we have a session ID in localStorage
    const storedSessionId = localStorage.getItem('mhc_session_id');
    if (storedSessionId) {
      setSessionId(storedSessionId);
      checkConsentStatus(storedSessionId);
    } else {
      createNewSession();
    }
  }, []);

  const createNewSession = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/consent/create-session`);
      const newSessionId = response.data.data.sessionId;
      
      setSessionId(newSessionId);
      localStorage.setItem('mhc_session_id', newSessionId);
      setHasConsent(false);
    } catch (error) {
      console.error('Failed to create session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkConsentStatus = async (sessionId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/consent/status/${sessionId}`);
      setHasConsent(response.data.data.consentGiven);
    } catch (error) {
      console.error('Failed to check consent status:', error);
      setHasConsent(false);
    } finally {
      setIsLoading(false);
    }
  };

  const giveConsent = async () => {
    if (!sessionId) return;

    try {
      await axios.post(`${API_BASE_URL}/api/consent/give`, { sessionId });
      setHasConsent(true);
    } catch (error) {
      console.error('Failed to give consent:', error);
      throw error;
    }
  };

  const withdrawConsent = async () => {
    if (!sessionId) return;

    try {
      await axios.post(`${API_BASE_URL}/api/consent/withdraw`, { sessionId });
      setHasConsent(false);
    } catch (error) {
      console.error('Failed to withdraw consent:', error);
      throw error;
    }
  };

  const clearSession = () => {
    localStorage.removeItem('mhc_session_id');
    setSessionId(null);
    setHasConsent(false);
    createNewSession();
  };

  return {
    hasConsent,
    sessionId,
    isLoading,
    giveConsent,
    withdrawConsent,
    clearSession,
    createNewSession
  };
};
