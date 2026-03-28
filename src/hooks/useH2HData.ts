'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { H2HData, Team } from '@/types/football';
import { MOCK_H2H_DATA } from '@/lib/api/matchService';

export function useH2HData() {
  const [data, setData] = useState<H2HData | null>(MOCK_H2H_DATA); // Inicia com o Mock para ter os 'matches'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [homeTeam, setHomeTeam] = useState<Team>(MOCK_H2H_DATA.homeTeam);
  const [awayTeam, setAwayTeam] = useState<Team>(MOCK_H2H_DATA.awayTeam);

  
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Construindo a URL com Query Params
      const url = new URL('http://127.0.0.1:8080/analysis/');
      url.searchParams.append('home_team_id', homeTeam.id.toString());
      url.searchParams.append('away_team_id', awayTeam.id.toString());
      url.searchParams.append('analysis_type', 'resultado');

      const response = await fetch(url.toString(), {
        method: 'GET', // Mudou para GET
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Falha na resposta do servidor');

      const result = await response.json();
      setData((prev) => ({ ...prev, ...result }));

    } catch (err) {
      setError('Erro ao carregar análise.');
    } finally {
      setIsLoading(false);
    }
  }, [homeTeam, awayTeam]);

  useEffect(() => {
    fetchData();
    return () => abortControllerRef.current?.abort(); // Limpeza ao desmontar
  }, [fetchData]);

  return { data, isLoading, error, homeTeam, awayTeam, setHomeTeam, setAwayTeam, refetch: fetchData };
}