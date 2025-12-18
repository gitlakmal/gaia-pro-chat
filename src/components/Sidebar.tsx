import React from 'react';
import { Plus, MessageSquare, Trash2, Download } from 'lucide-react';
import type { ChatSession } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onDownloadSession: (session: ChatSession, e: React.MouseEvent) => void; // අලුත් Download function එක
}

const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, 
  activeSessionId, 
  onNewChat, 
  onSelectSession, 
  onDeleteSession,
  onDownloadSession 
}) => {
  return (
    <div className="sidebar">
      <button className="new-chat-btn" onClick={onNewChat}>
        <Plus size={16} /> New Chat
      </button>

      <div style={{ marginTop: '20px', color: '#8e8ea0', fontSize: '0.75rem', fontWeight: 'bold', paddingLeft: '10px' }}>
        HISTORY ({sessions.length}/50)
      </div>

      <div className="history-list" style={{ overflowY: 'auto', flex: 1, marginTop: '10px' }}>
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => onSelectSession(session.id)}
            className={`history-item ${activeSessionId === session.id ? 'active' : ''}`}
            style={{
              padding: '10px',
              cursor: 'pointer',
              borderRadius: '5px',
              color: activeSessionId === session.id ? 'white' : '#ececec',
              backgroundColor: activeSessionId === session.id ? '#343541' : 'transparent',
              marginBottom: '5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              fontSize: '0.9rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', flex: 1 }}>
              <MessageSquare size={14} style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {session.title || 'New Chat'}
              </span>
            </div>
            
            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '5px' }}>
              <button 
                onClick={(e) => onDownloadSession(session, e)}
                style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', padding: '2px' }}
                title="Download Chat"
              >
                <Download size={14} />
              </button>
              <button 
                onClick={(e) => onDeleteSession(session.id, e)}
                style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: '2px' }}
                title="Delete Chat"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;