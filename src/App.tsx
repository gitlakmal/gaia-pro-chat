import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { Send, Bot, User, Paperclip } from 'lucide-react';
import type { ChatSession, Message } from './types';
import Sidebar from './components/Sidebar';
import Modal from './components/Modal';
import { useChatHistory } from './hooks/useChatHistory';

import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

function App() {
  const { sessions, addSession, removeSession, updateSessionMessages, updateSessionTitle, deleteOldestSession } = useChatHistory();

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sessions, currentSessionId, isLoading, isUploading]);

  const handleNewChatClick = () => {
    if (sessions.length >= 50) {
      setIsLimitModalOpen(true);
    } else {
      startNewChat();
    }
  };

  const startNewChat = (replaceOldest: boolean = false) => {
    if (replaceOldest) {
      deleteOldestSession();
    }

    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      createdAt: Date.now(),
      messages: [{ role: 'system', content: 'You are Gaia.', timestamp: Date.now() }]
    };

    addSession(newSession);
    setCurrentSessionId(newSession.id);
    setIsLimitModalOpen(false);
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure?')) {
      removeSession(id);
      if (currentSessionId === id) setCurrentSessionId(null);
    }
  };

  const downloadSession = (session: ChatSession, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const chatText = session.messages.filter(m => m.role !== 'system').map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${session.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeSession = sessions.find(s => s.id === currentSessionId);
  const activeMessages = activeSession ? activeSession.messages : [];
  const oldestSession = [...sessions].sort((a, b) => a.createdAt - b.createdAt)[0];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      let extractedText = "";

      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(" ");
          extractedText += `--- Page ${i} ---\n${pageText}\n\n`;
        }
      } else {
        extractedText = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsText(file);
        });
      }

      if (extractedText.trim()) {
         setInput((prev) => prev + `\n\n--- Content of ${file.name} ---\n${extractedText}\n-----------------\nSummarize this document.`);
      } else {
         alert("Could not extract text. If this is a PDF, it might contain only images.");
      }
    
    } catch (error) {
      console.error("File upload error:", error);
      alert("Failed to read file.");
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    let sessionId = currentSessionId;

    if (!sessionId && sessions.length >= 50) {
      setIsLimitModalOpen(true);
      return;
    }

    if (!sessionId) {
        const newSession: ChatSession = {
            id: Date.now().toString(),
            title: input.slice(0, 30),
            createdAt: Date.now(),
            messages: [{ role: 'system', content: 'You are Gaia.', timestamp: Date.now() }]
        };
        addSession(newSession);
        setCurrentSessionId(newSession.id);
        sessionId = newSession.id;
    }

    const userMsg: Message = { role: 'user', content: input, timestamp: Date.now() };
    const currentSession = sessions.find(s => s.id === sessionId) || { messages: [] };
    
    // මෙන්න මෙතන තමයි අපි කලින් වරද්දගත්තේ. අපි සම්පූර්ණ ලිස්ට් එකම ගන්න ඕනේ.
    const updatedMessages = [...(currentSession.messages || []), userMsg];
    updateSessionMessages(sessionId!, updatedMessages);
    
    setInput('');
    setIsLoading(true);

    try {
        const apiMessages = updatedMessages.map(m => ({ role: m.role, content: m.content }));
        const response = await fetch("http://localhost:8000/api/v0/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": "Bearer local" },
            body: JSON.stringify({
                model: "Qwen2.5-0.5B-Instruct-CPU",
                messages: apiMessages,
                temperature: 0.7
            })
        });

        const data = await response.json();
        if (data.choices?.[0]?.message) {
            const aiMsg = { 
                role: 'assistant', 
                content: data.choices[0].message.content, 
                timestamp: Date.now() 
            } as Message;
            updateSessionMessages(sessionId!, [...updatedMessages, aiMsg]);
            if (updatedMessages.length <= 2) {
                updateSessionTitle(sessionId!, input.slice(0, 30));
            }
        }
    } catch (e) {
        console.error(e);
        // 👇 නිවැරදි කළ කොටස (Fixed Part): දැන් අපි Error එකත් ලිස්ට් එකට එකතු කරලා යවනවා
        const errorMsg = { role: 'assistant', content: "Error: Cannot connect to Gaia Server.", timestamp: Date.now() } as Message;
        updateSessionMessages(sessionId!, [...updatedMessages, errorMsg]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar 
        sessions={sessions} 
        activeSessionId={currentSessionId} 
        onNewChat={handleNewChatClick} 
        onSelectSession={setCurrentSessionId}
        onDeleteSession={handleDeleteSession}
        onDownloadSession={downloadSession}
      />
      
      <div className="chat-container">
        {!currentSessionId ? (
           <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', flexDirection: 'column' }}>
             <h1 style={{color: '#ececec'}}>Gaia AI</h1>
             <p>Select a chat or start a new conversation</p>
          </div>
        ) : (
          <>
             <div className="messages-list">
              {activeMessages.filter(m => m.role !== 'system').map((msg, index) => (
                <div key={index} className={`message-wrapper ${msg.role}`}>
                  <div className={`avatar ${msg.role === 'user' ? 'user' : 'gaia'}`}>
                    {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                  </div>
                  <div className="content" style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                </div>
              ))}
              {isLoading && <div className="message-wrapper ai"><div className="content">Thinking...</div></div>}
              <div ref={messagesEndRef} />
            </div>

            <div className="input-area">
              <div className="input-box">
                <input 
                  type="file" 
                  id="file-upload" 
                  style={{ display: 'none' }} 
                  onChange={handleFileUpload}
                  accept=".pdf,.txt,.js,.py,.ts,.tsx,.html,.css,.json,.md" 
                />

                <label htmlFor="file-upload" style={{ cursor: isUploading ? 'wait' : 'pointer', color: isUploading ? '#666' : '#ccc', marginRight: '10px', display: 'flex', alignItems: 'center' }} title="Upload File">
                  <Paperclip size={18} />
                </label>

                <input 
                  type="text" 
                  value={isUploading ? "Reading file..." : input} 
                  onChange={e => setInput(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && !isUploading && sendMessage()} 
                  placeholder="Send a message or upload a PDF/Code file..." 
                  disabled={isUploading}
                />
                
                <button className="send-btn" onClick={sendMessage} disabled={isLoading || isUploading}>
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <Modal 
        isOpen={isLimitModalOpen}
        onClose={() => setIsLimitModalOpen(false)}
        onConfirm={() => startNewChat(true)}
        title="Storage Limit Reached"
        message={<>You have 50 chats. Replacing: <b style={{color:'#ff4d4d'}}>{oldestSession?.title}</b></>}
      />
    </div>
  );
}

export default App;