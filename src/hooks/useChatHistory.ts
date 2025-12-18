import { useState, useEffect } from 'react';
import type { ChatSession } from '../types';

export const useChatHistory = () => {
  // 1. Load from LocalStorage
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('gaia-sessions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // 2. Save to LocalStorage whenever sessions change
  useEffect(() => {
    localStorage.setItem('gaia-sessions', JSON.stringify(sessions));
  }, [sessions]);

  // 3. Add New Session (With 50 Limit Check Logic is handled in App.tsx mainly, but helper is here)
  const addSession = (newSession: ChatSession) => {
    let updatedSessions = [newSession, ...sessions];
    
    // Sort by date just in case
    updatedSessions.sort((a, b) => b.createdAt - a.createdAt);

    // Enforce 50 limit strictly here too
    if (updatedSessions.length > 50) {
      updatedSessions = updatedSessions.slice(0, 50);
    }
    
    setSessions(updatedSessions);
  };

  const removeSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const updateSessionMessages = (id: string, messages: any[]) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, messages } : s));
  };

  const updateSessionTitle = (id: string, title: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, title } : s));
  };

  // Force delete oldest (for the modal logic)
  const deleteOldestSession = () => {
    const sorted = [...sessions].sort((a, b) => b.createdAt - a.createdAt);
    sorted.pop(); // Remove last one
    setSessions(sorted);
  };

  return {
    sessions,
    addSession,
    removeSession,
    updateSessionMessages,
    updateSessionTitle,
    deleteOldestSession,
    setSessions // In case we need direct access
  };
};