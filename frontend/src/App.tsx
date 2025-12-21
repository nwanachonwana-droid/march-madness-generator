import React, { useState, useEffect } from 'react';
import { tournamentApi, Tournament } from './services/api';
import { BracketGenerator } from './components/BracketGenerator';
import { StatsPage } from './components/StatsPage';

type Page = 'generator' | 'stats';

function App() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('generator');

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      const response = await tournamentApi.list();
      const data = response.data;
      setTournaments(data);
      if (data.length > 0) {
        setSelectedTournament(data[0]);
      }
    } catch (error) {
      console.error('Failed to load tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '1.25rem',
        color: '#1a5490'
      }}>
        Loading...
      </div>
    );
  }

  if (!selectedTournament) {
    return (
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#1a5490', marginBottom: '1rem' }}>
          🏀 March Madness Bracket Generator
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
          No tournaments found. Please create one via the API.
        </p>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f3f4f6'
    }}>
      {/* Navigation Bar */}
      <nav style={{
        backgroundColor: 'white',
        borderBottom: '2px solid #e5e7eb',
        padding: '1rem 2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ 
            margin: 0,
            color: '#1a5490',
            fontSize: '1.5rem'
          }}>
            🏀 March Madness Bracket Generator
          </h1>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setCurrentPage('generator')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: currentPage === 'generator' ? '#3b82f6' : 'white',
                color: currentPage === 'generator' ? 'white' : '#1a5490',
                border: '2px solid #3b82f6',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.875rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (currentPage !== 'generator') {
                  e.currentTarget.style.backgroundColor = '#eff6ff';
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== 'generator') {
                  e.currentTarget.style.backgroundColor = 'white';
                }
              }}
            >
              Generate Brackets
            </button>
            
            <button
              onClick={() => setCurrentPage('stats')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: currentPage === 'stats' ? '#3b82f6' : 'white',
                color: currentPage === 'stats' ? 'white' : '#1a5490',
                border: '2px solid #3b82f6',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.875rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (currentPage !== 'stats') {
                  e.currentTarget.style.backgroundColor = '#eff6ff';
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== 'stats') {
                  e.currentTarget.style.backgroundColor = 'white';
                }
              }}
            >
              📊 Stats & Analysis
            </button>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      {currentPage === 'stats' ? (
        <StatsPage />
      ) : (
        <div style={{ padding: '2rem' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ 
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '12px',
              marginBottom: '2rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ 
                margin: 0,
                color: '#1a5490',
                fontSize: '2rem',
                marginBottom: '0.5rem'
              }}>
                Generate 200 Optimized Brackets
              </h2>
              <p style={{ 
                margin: 0,
                color: '#6b7280',
                fontSize: '1.125rem'
              }}>
                Using KenPom data (68% base accuracy, up to 75% with logistic regression)
              </p>
              <div style={{ 
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: '#f0f9ff',
                borderRadius: '6px',
                borderLeft: '4px solid #3b82f6'
              }}>
                <strong style={{ color: '#1e40af' }}>Tournament:</strong>{' '}
                <span style={{ color: '#1e3a8a' }}>
                  NCAA March Madness {selectedTournament.year}
                </span>
              </div>
            </div>

            {/* Bracket Generator Section */}
            <div style={{ 
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <BracketGenerator 
                tournamentId={selectedTournament.id}
                tournamentYear={selectedTournament.year}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
