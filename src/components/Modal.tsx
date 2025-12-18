import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#202123', padding: '20px', borderRadius: '8px', width: '400px',
        border: '1px solid #565656', color: '#ececec', boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
      }}>
        <h3 style={{ marginTop: 0 }}>{title}</h3>
        <div style={{ marginBottom: '20px', fontSize: '0.9rem', lineHeight: '1.5' }}>
          {message}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button 
            onClick={onClose}
            style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #565656', background: 'transparent', color: '#ececec', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', background: '#ff4d4d', color: 'white', cursor: 'pointer' }}
          >
            Confirm & Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;