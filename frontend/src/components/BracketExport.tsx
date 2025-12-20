import React from 'react';
import { GeneratedBracket } from '../services/api';

interface BracketExportProps {
  brackets: GeneratedBracket[];
  tournamentYear: number;
}

export function BracketExport({ brackets, tournamentYear }: BracketExportProps) {
  
  const formatBracketReadable = (bracket: any): string => {
    const picks = bracket.picks || {};
    let output = [];
    
    output.push('='.repeat(80));
    output.push(`BRACKET #${bracket.id} - ${bracket.strategy.toUpperCase()} STRATEGY`);
    output.push('='.repeat(80));
    output.push(`Expected Score: ${bracket.expected_score}`);
    output.push(`Upset Count: ${bracket.upset_count}`);
    output.push(`Pool Tag: ${bracket.pool_tag}`);
    output.push(`Champion: ${bracket.champion}`);
    output.push('');
    
    // Final Four
    output.push('-'.repeat(80));
    output.push('FINAL FOUR');
    output.push('-'.repeat(80));
    bracket.final_four.forEach((team: string, i: number) => {
      output.push(`  ${i + 1}. ${team}`);
    });
    output.push('');
    
    // Championship
    if (picks.championship) {
      output.push('-'.repeat(80));
      output.push('CHAMPIONSHIP GAME');
      output.push('-'.repeat(80));
      const champ = picks.championship;
      if (Array.isArray(champ) && champ.length >= 2) {
        output.push(`  ${champ[0]} vs ${champ[1]}`);
        output.push(`  WINNER: ${bracket.champion}`);
      }
      output.push('');
    }
    
    // Elite 8
    if (picks.elite_8) {
      output.push('-'.repeat(80));
      output.push('ELITE 8 (Regional Championships)');
      output.push('-'.repeat(80));
      Object.entries(picks.elite_8).forEach(([region, winner]) => {
        output.push(`  ${region}: ${winner}`);
      });
      output.push('');
    }
    
    // Sweet 16
    if (picks.sweet_16) {
      output.push('-'.repeat(80));
      output.push('SWEET 16');
      output.push('-'.repeat(80));
      Object.entries(picks.sweet_16).sort().forEach(([game, winner]) => {
        output.push(`  ${game}: ${winner}`);
      });
      output.push('');
    }
    
    // Round of 32
    if (picks.round_32) {
      output.push('-'.repeat(80));
      output.push('ROUND OF 32');
      output.push('-'.repeat(80));
      Object.entries(picks.round_32).sort().forEach(([game, winner]) => {
        output.push(`  ${game}: ${winner}`);
      });
      output.push('');
    }
    
    // Round of 64
    if (picks.round_64) {
      output.push('-'.repeat(80));
      output.push('ROUND OF 64 (First Round)');
      output.push('-'.repeat(80));
      Object.entries(picks.round_64).sort().forEach(([game, winner]) => {
        output.push(`  ${game}: ${winner}`);
      });
      output.push('');
    }
    
    output.push('\n\n');
    return output.join('\n');
  };

  const exportReadableBrackets = async () => {
    // Fetch full bracket data with all picks
    const response = await fetch('http://localhost:8000/api/v1/tournament/1/brackets');
    const fullBrackets = await response.json();
    
    // Format all brackets as readable text
    let textContent = '';
    textContent += `MARCH MADNESS ${tournamentYear} - GENERATED BRACKETS\n`;
    textContent += `Generated: ${new Date().toLocaleString()}\n`;
    textContent += `Total Brackets: ${fullBrackets.length}\n`;
    textContent += `\n${'='.repeat(80)}\n\n`;
    
    fullBrackets.forEach((bracket: any) => {
      textContent += formatBracketReadable(bracket);
    });
    
    // Download as text file
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `march_madness_${tournamentYear}_READABLE_BRACKETS.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };


  const exportToCSV = () => {
    let csv = 'Bracket_ID,Strategy,Pool_Tag,Champion,Final_Four_1,Final_Four_2,Final_Four_3,Final_Four_4,Expected_Score,Upset_Count\n';
    
    brackets.forEach(bracket => {
      const ff = bracket.final_four;
      csv += bracket.id + ',' + bracket.strategy + ',' + bracket.pool_tag + ',' + bracket.champion + ',';
      csv += (ff[0] || '') + ',' + (ff[1] || '') + ',' + (ff[2] || '') + ',' + (ff[3] || '') + ',';
      csv += bracket.expected_score + ',' + bracket.upset_count + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'march_madness_' + tournamentYear + '_summary.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = async () => {
    const response = await fetch('http://localhost:8000/api/v1/tournament/1/brackets');
    const fullBrackets = await response.json();
    
    const data = {
      tournament_year: tournamentYear,
      generated_at: new Date().toISOString(),
      bracket_count: fullBrackets.length,
      note: 'Full bracket data with all 63 game picks',
      brackets: fullBrackets
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'march_madness_' + tournamentYear + '_full_data.json';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (brackets.length === 0) return null;

  return (
    <div style={{ 
      marginTop: '1.5rem',
      padding: '1.5rem',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      border: '2px solid #e5e7eb'
    }}>
      <h3 style={{ margin: '0 0 1rem 0', color: '#1a5490' }}>
        📥 Export Brackets
      </h3>
      <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: '#6b7280' }}>
        Download your {brackets.length} generated brackets
      </p>
      
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button onClick={exportReadableBrackets} style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.875rem'
          }}>
          📄 Export ALL Brackets (Readable Text)
        </button>

        <button onClick={exportToCSV} style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.875rem'
          }}>
          📊 Export CSV (Summary)
        </button>
        
        <button onClick={exportToJSON} style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.875rem'
          }}>
          💾 Export JSON (Full Data)
        </button>
      </div>

      <div style={{ 
        marginTop: '1rem',
        padding: '1rem',
        backgroundColor: '#dbeafe',
        borderRadius: '6px',
        fontSize: '0.875rem'
      }}>
        <strong>💡 For ESPN/Yahoo Pools:</strong> Use "Export ALL Brackets (Readable Text)" to get a text file with all 200 brackets formatted for easy reading. Each bracket shows all 63 picks in order from Round of 64 → Championship. Perfect for manually entering into pool websites!
      </div>

      <div style={{ 
        marginTop: '0.75rem',
        padding: '1rem',
        backgroundColor: '#fef3c7',
        borderRadius: '6px',
        fontSize: '0.875rem'
      }}>
        <strong>📋 Pro Tip:</strong> Click "View Full" on any bracket below to see the picks, then download just that one bracket's text file for quick reference.
      </div>
    </div>
  );
}
