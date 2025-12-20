import React, { useState } from 'react';

interface Visualization {
  id: string;
  title: string;
  subtitle: string;
  imagePath: string;
  insights: string[];
  keyFinding: string;
}

const visualizations: Visualization[] = [
  {
    id: 'kenpom-accuracy',
    title: 'KenPom Model Accuracy: 75.3%',
    subtitle: 'Prediction accuracy by team quality difference',
    imagePath: '/visualizations/viz_kenpom_accuracy.png',
    keyFinding: 'Our model correctly predicts 75.3% of tournament games using KenPom efficiency ratings',
    insights: [
      'Larger AdjEM gaps lead to higher prediction accuracy',
      'Games with 15+ point AdjEM difference are predicted correctly 95%+ of the time',
      'Close matchups (0-3 AdjEM) are essentially coin flips',
      'Model performs well even with moderate team quality differences'
    ]
  },
  {
    id: 'upset-seed-gap',
    title: 'Upset Rate by Seed Difference',
    subtitle: 'How often does the underdog win?',
    imagePath: '/visualizations/viz_upset_by_seed_gap.png',
    keyFinding: 'The bigger the seed gap, the less likely an upset occurs',
    insights: [
      'Games between adjacent seeds (1 seed apart) have highest upset rate at ~35%',
      'Classic 5 vs 12 matchup (7 seed difference) sees upsets ~35% of the time',
      'Large seed gaps (10+) almost never produce upsets',
      'Most tournament chaos comes from games with 1-3 seed differences'
    ]
  },
  {
    id: 'offense-defense',
    title: 'Tournament Winners: Offense vs Defense',
    subtitle: 'Balance between offensive and defensive efficiency',
    imagePath: '/visualizations/viz_offense_defense.png',
    keyFinding: 'Weak negative correlation (-0.2 to -0.3) shows elite teams excel at both',
    insights: [
      'Lower defensive numbers = better defense (fewer points allowed per 100 possessions)',
      'Tournament winners cluster in the high offense, low defense region',
      'No strong trade-off between offense and defense for winning teams',
      'Elite teams are elite on both ends of the court'
    ]
  },
  {
    id: 'seed-matrix',
    title: 'Seed vs Seed Win Rate Matrix',
    subtitle: 'Historical matchup success rates',
    imagePath: '/visualizations/viz_seed_matrix.png',
    keyFinding: '1-seeds win 95%+ of their Round of 64 games against 16-seeds',
    insights: [
      'Classic 12 vs 5 upset: 12-seeds win ~35% of matchups',
      '8 vs 9 games are true toss-ups (near 50/50)',
      '1-seeds are dominant but not invincible (85-95% win rates)',
      'Use this matrix to identify which matchups favor underdogs'
    ]
  },
  {
    id: 'conference-performance',
    title: 'Top Conferences by Tournament Wins',
    subtitle: 'Which conferences dominate March Madness?',
    imagePath: '/visualizations/viz_conference_performance.png',
    keyFinding: 'Power conferences (ACC, B10, SEC, B12) dominate tournament success',
    insights: [
      'ACC leads all conferences in total tournament wins (2015-2024)',
      'Big Ten, SEC, and Big 12 consistently produce tournament winners',
      'Mid-major conferences show up but win at lower rates',
      'Conference strength is a strong predictor of tournament success'
    ]
  },
  {
    id: 'close-games',
    title: 'Tournament Game Margins',
    subtitle: 'How close are March Madness games?',
    imagePath: '/visualizations/viz_close_games.png',
    keyFinding: '~20% of tournament games are decided by 3 points or less',
    insights: [
      'Most games (35%+) are blowouts (15+ point margins)',
      'About 1 in 5 games comes down to final possessions',
      'Medium margins (7-15 points) are most common',
      'Tournament basketball features both close games and decisive wins'
    ]
  }
];

export function StatsPage() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const current = visualizations[currentIndex];

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % visualizations.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + visualizations.length) % visualizations.length);
  };

  const goToIndex = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Main Content Area - Full Page Graph */}
      <div style={{
        flex: 1,
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          maxWidth: '1600px',
          margin: '0 auto',
          width: '100%',
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '12px 12px 0 0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            borderBottom: '3px solid #3b82f6'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{
                  margin: 0,
                  color: '#1a5490',
                  fontSize: '1.75rem',
                  marginBottom: '0.25rem'
                }}>
                  {current.title}
                </h2>
                <p style={{
                  margin: 0,
                  color: '#6b7280',
                  fontSize: '1rem'
                }}>
                  {current.subtitle}
                </p>
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                fontWeight: '600'
              }}>
                {currentIndex + 1} / {visualizations.length}
              </div>
            </div>
          </div>

          {/* Visualization Display */}
          <div style={{
            flex: 1,
            backgroundColor: 'white',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            minHeight: '600px'
          }}>
            {/* Image */}
            <div style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              padding: '1rem'
            }}>
              <img
                src={current.imagePath}
                alt={current.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  height: 'auto',
                  objectFit: 'contain'
                }}
              />
            </div>

            {/* Key Finding */}
            <div style={{
              backgroundColor: '#dbeafe',
              padding: '1.5rem',
              borderRadius: '8px',
              borderLeft: '4px solid #3b82f6'
            }}>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: 'bold',
                color: '#1e40af',
                marginBottom: '0.5rem'
              }}>
                🔍 KEY FINDING
              </div>
              <div style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#1e3a8a'
              }}>
                {current.keyFinding}
              </div>
            </div>

            {/* Insights */}
            <div style={{
              backgroundColor: '#f0f9ff',
              padding: '1.5rem',
              borderRadius: '8px'
            }}>
              <h3 style={{
                margin: '0 0 1rem 0',
                color: '#1e40af',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}>
                📊 INSIGHTS
              </h3>
              <ul style={{
                margin: 0,
                paddingLeft: '1.5rem',
                color: '#1e3a8a',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '0.5rem'
              }}>
                {current.insights.map((insight, idx) => (
                  <li key={idx} style={{ fontSize: '0.9rem' }}>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Navigation Bottom */}
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0 0 12px 12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            borderTop: '1px solid #e5e7eb'
          }}>
            {/* Navigation Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <button
                onClick={goToPrevious}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                ← Previous
              </button>

              <button
                onClick={goToNext}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                Next →
              </button>
            </div>

            {/* Dot Navigation */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.75rem'
            }}>
              {visualizations.map((viz, index) => (
                <button
                  key={viz.id}
                  onClick={() => goToIndex(index)}
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: index === currentIndex ? '#3b82f6' : '#d1d5db',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  title={viz.title}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '1rem 2rem',
        backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb',
        textAlign: 'center'
      }}>
        <p style={{
          margin: 0,
          color: '#6b7280',
          fontSize: '0.875rem'
        }}>
          <strong>Data Source:</strong> KenPom.com • 408 NCAA Tournament Games (2015-2024)
        </p>
      </div>
    </div>
  );
}
