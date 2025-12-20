import React, { useState, useEffect } from 'react';

interface KenPomBulkUploadProps {
  tournamentId: number;
}

interface YearStatus {
  year: number;
  hasData: boolean;
  teamCount: number;
  uploading: boolean;
  error?: string;
  success?: boolean;
}

export function KenPomBulkUpload({ tournamentId }: KenPomBulkUploadProps) {
  const [yearStatuses, setYearStatuses] = useState<YearStatus[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<File[]>([]);

  const years = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

  useEffect(() => {
    checkExistingData();
  }, []);

  const checkExistingData = async () => {
    const statuses: YearStatus[] = [];
    
    for (const year of years) {
      try {
        const response = await fetch(`http://localhost:8000/api/v1/tournament/${tournamentId}/kenpom`);
        const data = await response.json();
        
        statuses.push({
          year,
          hasData: data.length > 0 && data[0]?.year === year,
          teamCount: data.length,
          uploading: false
        });
      } catch {
        statuses.push({
          year,
          hasData: false,
          teamCount: 0,
          uploading: false
        });
      }
    }
    
    setYearStatuses(statuses);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.csv'));
      setUploadQueue(files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).filter(f => f.name.endsWith('.csv'));
      setUploadQueue(files);
    }
  };

  const extractYearFromFilename = (filename: string): number | null => {
    const match = filename.match(/(\d{4})/);
    return match ? parseInt(match[1]) : null;
  };

  const uploadFile = async (file: File) => {
    const year = extractYearFromFilename(file.name);
    if (!year) {
      console.error(`Could not extract year from filename: ${file.name}`);
      return;
    }

    // Update status to uploading
    setYearStatuses(prev => prev.map(s => 
      s.year === year ? { ...s, uploading: true, error: undefined } : s
    ));

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `http://localhost:8000/api/v1/tournament/${tournamentId}/kenpom`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      
      setYearStatuses(prev => prev.map(s => 
        s.year === year 
          ? { ...s, hasData: true, teamCount: data.entries?.length || 0, uploading: false, success: true } 
          : s
      ));

      setTimeout(() => {
        setYearStatuses(prev => prev.map(s => 
          s.year === year ? { ...s, success: false } : s
        ));
      }, 2000);

    } catch (error) {
      setYearStatuses(prev => prev.map(s => 
        s.year === year 
          ? { ...s, uploading: false, error: 'Upload failed' } 
          : s
      ));
    }
  };

  const uploadAll = async () => {
    for (const file of uploadQueue) {
      await uploadFile(file);
    }
    setUploadQueue([]);
  };

  const getStatusColor = (status: YearStatus) => {
    if (status.uploading) return '#3b82f6';
    if (status.success) return '#10b981';
    if (status.error) return '#ef4444';
    if (status.hasData) return '#10b981';
    return '#9ca3af';
  };

  const getStatusText = (status: YearStatus) => {
    if (status.uploading) return 'Uploading...';
    if (status.success) return '✓ Uploaded!';
    if (status.error) return '✗ Error';
    if (status.hasData) return `✓ ${status.teamCount} teams`;
    return '○ No data';
  };

  return (
    <div style={{ 
      marginTop: '2rem',
      padding: '2rem',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      border: '2px solid #e5e7eb'
    }}>
      <h2 style={{ margin: '0 0 1.5rem 0', color: '#1a5490' }}>
        📊 Historical KenPom Data
      </h2>

      {/* Year Status Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {yearStatuses.map(status => (
          <div
            key={status.year}
            style={{
              padding: '1rem',
              backgroundColor: 'white',
              borderRadius: '6px',
              border: `2px solid ${getStatusColor(status)}`,
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1a5490' }}>
              {status.year}
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: getStatusColor(status),
              marginTop: '0.5rem',
              fontWeight: '600'
            }}>
              {getStatusText(status)}
            </div>
          </div>
        ))}
      </div>

      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        style={{
          padding: '3rem',
          border: `2px dashed ${dragActive ? '#3b82f6' : '#d1d5db'}`,
          borderRadius: '8px',
          backgroundColor: dragActive ? '#eff6ff' : 'white',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          accept=".csv"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
        
        <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
          <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1a5490', marginBottom: '0.5rem' }}>
            Drag & drop CSV files here
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            or click to browse
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
            Supports multiple files • CSV only
          </div>
        </label>
      </div>

      {/* Upload Queue */}
      {uploadQueue.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#1a5490' }}>
            Ready to Upload ({uploadQueue.length} files)
          </h3>
          
          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '6px',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            {uploadQueue.map((file, idx) => (
              <div 
                key={idx}
                style={{
                  padding: '0.75rem',
                  borderBottom: idx < uploadQueue.length - 1 ? '1px solid #e5e7eb' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ fontSize: '0.875rem' }}>{file.name}</span>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={uploadAll}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.875rem'
            }}
          >
            ⬆️ Upload All Files
          </button>
        </div>
      )}

      {/* Instructions */}
      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        backgroundColor: '#dbeafe',
        borderRadius: '6px'
      }}>
        <strong style={{ color: '#1e40af' }}>💡 How to add historical data:</strong>
        <ol style={{ 
          margin: '0.5rem 0 0 0',
          paddingLeft: '1.5rem',
          color: '#1e3a8a',
          fontSize: '0.875rem'
        }}>
          <li>Visit <code>https://kenpom.com/index.php?y=2023</code> (change year as needed)</li>
          <li>Copy the top 68 teams from the table</li>
          <li>Paste into Excel/Google Sheets</li>
          <li>Save as CSV with format: <code>2023_KenPom.csv</code></li>
          <li>Drag & drop all CSVs here or click to upload</li>
        </ol>
      </div>
    </div>
  );
}
