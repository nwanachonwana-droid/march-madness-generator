import React from 'react';

interface BracketDetailProps {
  bracket: any;
  onClose: () => void;
}

export function BracketDetail({ bracket, onClose }: BracketDetailProps) {
  const picks = bracket.picks;

  const renderRound = (roundName: string, roundPicks: any) => {
    if (!roundPicks) return null;

    let picksList: Array<[string, any]> = [];
    
    if (typeof roundPicks === 'object' && !Array.isArray(roundPicks)) {
      picksList = Object.entries(roundPicks);
    } else if (Array.isArray(roundPicks)) {
      picksList = roundPicks.map((p, i) => [`Game ${i + 1}`, p]);
    }

    if (picksList.length === 0) return null;

    return (
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ 
          color: '#1a5490', 
          borderBottom: '2px solid #2a6ab0',
          paddingBottom: '0.5rem',
          marginBottom: '1rem'
        }}>
          {roundName}
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '0.75rem'
        }}>
          {picksList.map((item) => {
            const key = item[0];
            const value = item[1];
            return (
              <div 
                key={key}
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb'
                }}
              >
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                  {key}
                </div>
                <div style={{ fontWeight: '600', color: '#1a5490' }}>
                  {value}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        maxWidth: '1200px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        padding: '2rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '2rem',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '1rem'
        }}>
          <div>
            <h2 style={{ margin: 0, color: '#1a5490' }}>
              Bracket #{bracket.id} - {bracket.strategy.toUpperCase()}
            </h2>
            <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280' }}>
              Champion: <strong>{bracket.champion}</strong> | 
              Expected Score: <strong>{bracket.expected_score}</strong> | 
              Upsets: <strong>{bracket.upset_count}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Close
          </button>
        </div>

        <div style={{ 
          padding: '1.5rem',
          backgroundColor: '#dbeafe',
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#1e40af' }}>Final Four</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {bracket.final_four.map((team: string, idx: number) => (
              <div 
                key={idx}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '1.1rem',
                  color: '#1a5490'
                }}
              >
                {team}
              </div>
            ))}
          </div>
        </div>

        {picks.round_64 && renderRound('Round of 64', picks.round_64)}
        {picks.round_32 && renderRound('Round of 32', picks.round_32)}
        {picks.sweet_16 && renderRound('Sweet 16', picks.sweet_16)}
        {picks.elite_8 && renderRound('Elite 8', picks.elite_8)}
        
        {picks.championship && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ 
              color: '#1a5490', 
              borderBottom: '2px solid #2a6ab0',
              paddingBottom: '0.5rem',
              marginBottom: '1rem'
            }}>
              Championship Game
            </h3>
            <div style={{
              padding: '1.5rem',
              backgroundColor: '#fef3c7',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                {Array.isArray(picks.championship) 
                  ? picks.championship.join(' vs ') 
                  : 'Championship matchup'}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#92400e' }}>
                Winner: {bracket.champion}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
