import React, { useState, useEffect } from 'react';
import { generateApi, GeneratedBracket } from '../services/api';
import { BracketDetail } from './BracketDetail';
import { BracketExport } from './BracketExport';

interface BracketGeneratorProps {
  tournamentId: number;
  tournamentYear: number;
}

export function BracketGenerator({ tournamentId, tournamentYear }: BracketGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [brackets, setBrackets] = useState<GeneratedBracket[loadBrackets]>([]);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [selectedBracket, setSelectedBracket] = useState<any>(null);

  useEffect(() => {
    loadBrackets();
  }, [loadBrackets]);

  const loadBrackets = async () => {
    try {
      const response = await generateApi.getBrackets(tournamentId);
      setBrackets(response.data);
    } catch (error) {
      console.error('Failed to load brackets:', error);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setMessage('');

    try {
      await generateApi.generate(tournamentId, 200);
      setMessage('✅ Successfully generated 200 brackets!');
      await loadBrackets();
    } catch (error) {
      setMessage('❌ Generation failed. Make sure KenPom data is uploaded.');
      console.error('Generation error:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete all generated brackets?')) return;

    try {
      await generateApi.deleteBrackets(tournamentId);
      setMessage('✅ Deleted all brackets');
      setBrackets([loadBrackets]);
    } catch (error) {
      setMessage('❌ Delete failed');
    }
  };

  const filteredBrackets = filter === 'all' 
    ? brackets 
    : brackets.filter(b => b.strategy === filter);

  const strategyStats = {
    value: brackets.filter(b => b.strategy === 'value').length,
    chalk: brackets.filter(b => b.strategy === 'chalk').length,
    chaos: brackets.filter(b => b.strategy === 'chaos').length,
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h3 style={{ margin: 0, color: '#1a5490' }}>
          Generate Optimized Brackets
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleGenerate}
            disabled={generating}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: generating ? '#9ca3af' : '#1a5490',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: generating ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '1rem'
            }}
          >
            {generating ? 'Generating...' : 'Generate 200 Brackets'}
          </button>
          {brackets.length > 0 && (
            <button
              onClick={handleDelete}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Delete All
            </button>
          )}
        </div>
      </div>

      {message && (
        <p style={{ 
          padding: '1rem', 
          backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
          borderRadius: '6px',
          marginBottom: '1rem'
        }}>
          {message}
        </p>
      )}

      {brackets.length > 0 && (
        <>
          <BracketExport brackets={brackets} tournamentYear={tournamentYear} />

          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            marginTop: '1.5rem',
            marginBottom: '1rem',
            padding: '1rem',
            backgroundColor: '#f9fafb',
            borderRadius: '8px'
          }}>
            <div>
              <strong>Total Brackets:</strong> {brackets.length}
            </div>
            <div>
              <strong>Value:</strong> {strategyStats.value}
            </div>
            <div>
              <strong>Chalk:</strong> {strategyStats.chalk}
            </div>
            <div>
              <strong>Chaos:</strong> {strategyStats.chaos}
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ marginRight: '0.5rem', fontWeight: '600' }}>Filter:</label>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              style={{
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #e5e7eb'
              }}
            >
              <option value="all">All Strategies</option>
              <option value="value">Value Only</option>
              <option value="chalk">Chalk Only</option>
              <option value="chaos">Chaos Only</option>
            </select>
          </div>

          <div style={{ 
            maxHeight: '500px', 
            overflow: 'auto',
            border: '1px solid #e5e7eb',
            borderRadius: '8px'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ 
                backgroundColor: '#1a5490', 
                color: 'white',
                position: 'sticky',
                top: 0
              }}>
                <tr>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>ID</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Strategy</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Champion</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Final Four</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Expected Score</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Upsets</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Pool Tag</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBrackets.slice(0, 50).map((bracket, idx) => (
                  <tr 
                    key={bracket.id}
                    style={{ 
                      backgroundColor: idx % 2 === 0 ? 'white' : '#f9fafb',
                      borderBottom: '1px solid #e5e7eb'
                    }}
                  >
                    <td style={{ padding: '0.75rem' }}>{bracket.id}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        backgroundColor: 
                          bracket.strategy === 'value' ? '#dbeafe' :
                          bracket.strategy === 'chalk' ? '#dcfce7' :
                          '#fef3c7',
                        color:
                          bracket.strategy === 'value' ? '#1e40af' :
                          bracket.strategy === 'chalk' ? '#166534' :
                          '#92400e'
                      }}>
                        {bracket.strategy}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: '600' }}>
                      {bracket.champion}
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                      {bracket.final_four.join(', ')}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      {bracket.expected_score}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      {bracket.upset_count}
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                      {bracket.pool_tag}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <button
                        onClick={() => setSelectedBracket(bracket)}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#2a6ab0',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        View Full
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredBrackets.length > 50 && (
              <div style={{ 
                padding: '1rem', 
                textAlign: 'center',
                color: '#6b7280',
                backgroundColor: '#f9fafb'
              }}>
                Showing first 50 of {filteredBrackets.length} brackets
              </div>
            )}
          </div>
        </>
      )}

      {selectedBracket && (
        <BracketDetail 
          bracket={selectedBracket} 
          onClose={() => setSelectedBracket(null)} 
        />
      )}
    </div>
  );
}
