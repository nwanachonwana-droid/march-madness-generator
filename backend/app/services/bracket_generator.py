"""
Bracket Generation Engine
Uses KenPom ratings to generate optimized NCAA tournament brackets
"""
import random
import math
from typing import List, Dict, Tuple
from sqlalchemy.orm import Session
from app.models.bracket import Tournament, KenPomData, GeneratedBracket

def get_win_probability(adj_em_a: float, adj_em_b: float) -> float:
    """
    Calculate win probability using KenPom's log5 formula
    P(A wins) = 1 / (1 + 10^((AdjEM_B - AdjEM_A) / 15))
    """
    diff = adj_em_b - adj_em_a
    return 1 / (1 + math.pow(10, diff / 15))

def get_team_kenpom(team_name: str, kenpom_dict: Dict) -> Dict:
    """Get KenPom data for a team, return defaults if not found"""
    return kenpom_dict.get(team_name, {
        'adj_em': 0,
        'adj_o': 100,
        'adj_d': 100,
        'tempo': 68
    })

def predict_game(team_a: Dict, team_b: Dict, kenpom_dict: Dict, strategy: str = 'value') -> str:
    """
    Predict winner of a game based on strategy
    
    Strategies:
    - chalk: Always pick favorite
    - value: Pick upsets when probability > 40% and underdog
    - chaos: Random with bias toward upsets
    """
    kenpom_a = get_team_kenpom(team_a['name'], kenpom_dict)
    kenpom_b = get_team_kenpom(team_b['name'], kenpom_dict)
    
    prob_a = get_win_probability(kenpom_a['adj_em'], kenpom_b['adj_em'])
    
    if strategy == 'chalk':
        # Always pick favorite
        return team_a['name'] if prob_a > 0.5 else team_b['name']
    
    elif strategy == 'value':
        # Pick upsets when underdog has >40% chance
        if prob_a > 0.6:
            return team_a['name']
        elif prob_a < 0.4:
            return team_b['name']
        else:
            # Close game - pick higher seed (team_a usually)
            if team_a.get('seed', 16) < team_b.get('seed', 16):
                return team_a['name']
            return team_b['name'] if random.random() > prob_a else team_a['name']
    
    elif strategy == 'chaos':
        # More randomness, bias toward upsets
        adjusted_prob = prob_a * 0.85  # Give underdog boost
        return team_a['name'] if random.random() < adjusted_prob else team_b['name']
    
    else:
        return team_a['name'] if random.random() < prob_a else team_b['name']

def simulate_bracket(tournament: Tournament, kenpom_dict: Dict, strategy: str = 'value') -> Dict:
    """
    Simulate entire bracket and return results
    Returns: dict with picks, champion, final_four, upset_count
    """
    regions = tournament.bracket_structure['regions']
    
    # Track all picks
    picks = {
        'round_64': {},  # First round
        'round_32': {},  # Second round
        'sweet_16': {},
        'elite_8': {},
        'final_4': [],
        'championship': None,
        'champion': None
    }
    
    upset_count = 0
    
    # Simulate each region
    for region_name, teams in regions.items():
        if not teams:
            continue
            
        # Sort by seed for matchups
        sorted_teams = sorted(teams, key=lambda x: x['seed'])
        
        # Round of 64 (First Four already resolved in bracket structure)
        round_64_winners = []
        for i in range(0, len(sorted_teams), 2):
            if i + 1 < len(sorted_teams):
                team_a = sorted_teams[i]
                team_b = sorted_teams[i + 1]
                winner = predict_game(team_a, team_b, kenpom_dict, strategy)
                round_64_winners.append({'name': winner, 'seed': team_a['seed'] if winner == team_a['name'] else team_b['seed']})
                
                picks['round_64'][f"{region_name}_{i}"] = winner
                
                # Count upsets (lower seed wins)
                if team_a['seed'] < team_b['seed'] and winner == team_b['name']:
                    upset_count += 1
                elif team_b['seed'] < team_a['seed'] and winner == team_a['name']:
                    upset_count += 1
        
        # Round of 32
        round_32_winners = []
        for i in range(0, len(round_64_winners), 2):
            if i + 1 < len(round_64_winners):
                winner = predict_game(round_64_winners[i], round_64_winners[i + 1], kenpom_dict, strategy)
                round_32_winners.append({'name': winner, 'seed': round_64_winners[i]['seed'] if winner == round_64_winners[i]['name'] else round_64_winners[i + 1]['seed']})
                picks['round_32'][f"{region_name}_{i}"] = winner
        
        # Sweet 16
        sweet_16_winners = []
        for i in range(0, len(round_32_winners), 2):
            if i + 1 < len(round_32_winners):
                winner = predict_game(round_32_winners[i], round_32_winners[i + 1], kenpom_dict, strategy)
                sweet_16_winners.append({'name': winner, 'seed': round_32_winners[i]['seed'] if winner == round_32_winners[i]['name'] else round_32_winners[i + 1]['seed']})
                picks['sweet_16'][f"{region_name}_{i}"] = winner
        
        # Elite 8 (Region championship)
        if len(sweet_16_winners) >= 2:
            region_champ = predict_game(sweet_16_winners[0], sweet_16_winners[1], kenpom_dict, strategy)
            picks['elite_8'][region_name] = region_champ
            picks['final_4'].append(region_champ)
    
    # Final Four
    if len(picks['final_4']) >= 4:
        # Semifinal 1
        sf1_winner = predict_game(
            {'name': picks['final_4'][0]},
            {'name': picks['final_4'][1]},
            kenpom_dict,
            strategy
        )
        
        # Semifinal 2
        sf2_winner = predict_game(
            {'name': picks['final_4'][2]},
            {'name': picks['final_4'][3]},
            kenpom_dict,
            strategy
        )
        
        picks['championship'] = [sf1_winner, sf2_winner]
        
        # Championship
        champion = predict_game(
            {'name': sf1_winner},
            {'name': sf2_winner},
            kenpom_dict,
            strategy
        )
        picks['champion'] = champion
    
    # Calculate expected score (rough estimate based on upsets)
    expected_score = 320 - (upset_count * 5)  # Baseline minus penalty for upsets
    
    return {
        'picks': picks,
        'champion': picks.get('champion'),
        'final_four': picks['final_4'],
        'upset_count': upset_count,
        'expected_score': expected_score
    }

def generate_brackets(tournament_id: int, db: Session, count: int = 200) -> List[Dict]:
    """
    Generate multiple brackets with different strategies
    
    Breakdown:
    - 50% Value strategy (100 brackets)
    - 25% Chalk strategy (50 brackets)
    - 25% Chaos strategy (50 brackets)
    """
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise ValueError(f"Tournament {tournament_id} not found")
    
    # Load KenPom data
    kenpom_data = db.query(KenPomData).filter(
        KenPomData.tournament_id == tournament_id
    ).all()
    
    kenpom_dict = {
        entry.team_name: {
            'adj_em': entry.adj_em,
            'adj_o': entry.adj_o,
            'adj_d': entry.adj_d,
            'tempo': entry.tempo
        }
        for entry in kenpom_data
    }
    
    brackets = []
    
    # Generate Value brackets (100)
    for i in range(100):
        result = simulate_bracket(tournament, kenpom_dict, 'value')
        bracket = GeneratedBracket(
            tournament_id=tournament_id,
            picks=result['picks'],
            strategy='value',
            champion=result['champion'],
            final_four=result['final_four'],
            expected_score=result['expected_score'],
            upset_count=result['upset_count'],
            pool_tag='big_pool' if i % 2 == 0 else 'paid_pool'
        )
        db.add(bracket)
        brackets.append({
            'id': i + 1,
            'strategy': 'value',
            'champion': result['champion'],
            'final_four': result['final_four'],
            'expected_score': result['expected_score'],
            'upset_count': result['upset_count']
        })
    
    # Generate Chalk brackets (50)
    for i in range(50):
        result = simulate_bracket(tournament, kenpom_dict, 'chalk')
        bracket = GeneratedBracket(
            tournament_id=tournament_id,
            picks=result['picks'],
            strategy='chalk',
            champion=result['champion'],
            final_four=result['final_four'],
            expected_score=result['expected_score'],
            upset_count=result['upset_count'],
            pool_tag='free_pool'
        )
        db.add(bracket)
        brackets.append({
            'id': 100 + i + 1,
            'strategy': 'chalk',
            'champion': result['champion'],
            'final_four': result['final_four'],
            'expected_score': result['expected_score'],
            'upset_count': result['upset_count']
        })
    
    # Generate Chaos brackets (50)
    for i in range(50):
        result = simulate_bracket(tournament, kenpom_dict, 'chaos')
        bracket = GeneratedBracket(
            tournament_id=tournament_id,
            picks=result['picks'],
            strategy='chaos',
            champion=result['champion'],
            final_four=result['final_four'],
            expected_score=result['expected_score'],
            upset_count=result['upset_count'],
            pool_tag='big_pool'
        )
        db.add(bracket)
        brackets.append({
            'id': 150 + i + 1,
            'strategy': 'chaos',
            'champion': result['champion'],
            'final_four': result['final_four'],
            'expected_score': result['expected_score'],
            'upset_count': result['upset_count']
        })
    
    db.commit()
    
    return brackets
