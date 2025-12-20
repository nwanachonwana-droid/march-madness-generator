import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Team {
  seed: number;
  name: string;
  region: string;
}

export interface Tournament {
  id: number;
  year: number;
  bracket_structure: {
    year: number;
    regions: {
      East: Team[];
      West: Team[];
      South: Team[];
      Midwest: Team[];
    };
  };
  created_at: string;
}

export interface KenPomEntry {
  id: number;
  team_name: string;
  adj_em: number;
  adj_o: number;
  adj_d: number;
  tempo: number;
}

export interface GeneratedBracket {
  id: number;
  strategy: string;
  champion: string;
  final_four: string[];
  expected_score: number;
  upset_count: number;
  pool_tag: string;
  created_at: string;
}

export const tournamentApi = {
  create: (year: number, teams: Team[]) => 
    api.post<Tournament>('/tournament', { year, teams }),
  
  get: (id: number) => 
    api.get<Tournament>('/tournament/' + id),
  
  list: () => 
    api.get<Tournament[]>('/tournaments'),
};

export const kenpomApi = {
  upload: (tournamentId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/tournament/' + tournamentId + '/kenpom', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  get: (tournamentId: number) => 
    api.get<KenPomEntry[]>('/tournament/' + tournamentId + '/kenpom'),
};

export const generateApi = {
  generate: (tournamentId: number, count: number = 200) =>
    api.post('/tournament/' + tournamentId + '/generate', null, {
      params: { count }
    }),
  
  getBrackets: (tournamentId: number) =>
    api.get<GeneratedBracket[]>('/tournament/' + tournamentId + '/brackets'),
  
  deleteBrackets: (tournamentId: number) =>
    api.delete('/tournament/' + tournamentId + '/brackets'),
};
