import React, { useState } from 'react';
import { kenpomApi } from '../services/api';

interface KenPomUploadProps {
  tournamentId: number;
  onUploadComplete: () => void;
}

export function KenPomUpload({ tournamentId, onUploadComplete }: KenPomUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage('');

    try {
      const response = await kenpomApi.upload(tournamentId, file);
      setMessage(`✅ ${response.data.message}`);
      onUploadComplete();
    } catch (error) {
      setMessage('❌ Upload failed. Check CSV format.');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
      <h3 style={{ margin: '0 0 1rem 0', color: '#1a5490' }}>Upload KenPom Data</h3>
      <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
        CSV format: Team, AdjEM, AdjO, AdjD, Tempo
      </p>
      
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        disabled={uploading}
        style={{
          padding: '0.5rem',
          border: '2px solid #e5e7eb',
          borderRadius: '6px',
          cursor: uploading ? 'not-allowed' : 'pointer'
        }}
      />
      
      {uploading && <p style={{ marginTop: '0.5rem', color: '#6b7280' }}>Uploading...</p>}
      {message && <p style={{ marginTop: '0.5rem', fontWeight: '600' }}>{message}</p>}
    </div>
  );
}
