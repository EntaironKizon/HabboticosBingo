
import { useState, useCallback } from 'react';

interface HabboUser {
  uniqueId: string;
  name: string;
  motto: string;
  buildersClubMember: boolean;
  habboClubMember: boolean;
  lastAccessTime: string;
  creationTime: string;
  profileVisible: boolean;
  figureString?: string;
  selectedBadges: Array<{
    badgeIndex: number;
    code: string;
    name: string;
    description: string;
  }>;
}

export type HabboServer = 'origins' | 'es';

export function useHabboAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getHabboUser = useCallback(async (username: string, server: HabboServer = 'origins'): Promise<HabboUser | null> => {
    if (!username.trim()) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const baseUrl = server === 'origins' 
        ? 'https://origins.habbo.es/api/public/users'
        : 'https://www.habbo.es/api/public/users';
      
      const response = await fetch(`${baseUrl}?name=${encodeURIComponent(username)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          const serverName = server === 'origins' ? 'Habbo Origins' : 'Habbo España';
          setError(`Usuario no encontrado en ${serverName}`);
          return null;
        }
        throw new Error(`HTTP ${response.status}`);
      }
      
      const userData: HabboUser = await response.json();
      return userData;
    } catch (err) {
      console.error('Error fetching Habbo user:', err);
      const serverName = server === 'origins' ? 'Habbo Origins' : 'Habbo España';
      
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAvatarUrl = useCallback((username: string, size: 'small' | 'large' = 'small', server: HabboServer = 'origins', figureString?: string) => {
    const sizeParam = size === 'large' ? 'b' : 's';
    
    if (server === 'origins' && figureString) {
      return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${encodeURIComponent(figureString)}&direction=4&head_direction=4&size=${sizeParam}`;
    }
    
    if (server === 'es') {
      return `https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(username)}&action=std&direction=2&head_direction=3&gesture=std&size=${sizeParam}`;
    }
    
    // Para Origins sin figureString
    return `https://origins.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(username)}&action=std&direction=2&head_direction=3&gesture=std&size=${sizeParam}`;
  }, []);

  const getFullAvatarUrl = useCallback((username: string, server: HabboServer = 'origins', figureString?: string) => {
    if (server === 'origins' && figureString) {
      return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${encodeURIComponent(figureString)}&direction=4&head_direction=4&size=m`;
    }
    
    if (server === 'es') {
      return `https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(username)}&action=none,crr=5&direction=2&head_direction=2&gesture=std&size=m`;
    }
    
    // Para Origins sin figureString
    return `https://origins.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(username)}&action=none,crr=5&direction=2&head_direction=2&gesture=std&size=m`;
  }, []);

  const getHeadOnlyAvatarUrl = useCallback((username: string, server: HabboServer = 'origins', figureString?: string) => {
    if (server === 'origins' && figureString) {
      return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${encodeURIComponent(figureString)}&direction=4&head_direction=4&size=s&headonly=1`;
    }
    
    if (server === 'origins') {
      // Para Origins sin figureString, usar un avatar genérico
      return `https://www.habbo.com/habbo-imaging/avatarimage?figure=hr-100-61.hd-180-1.ch-210-66.lg-270-82&direction=4&head_direction=4&size=s&headonly=1`;
    }
    
    // Para Habbo España
    return `https://www.habbo.es/habbo-imaging/avatarimage?user=${encodeURIComponent(username)}&action=none,crr=5&direction=2&head_direction=2&gesture=std&size=m&headonly=1`;
  }, []);

  return {
    getHabboUser,
    getAvatarUrl,
    getFullAvatarUrl,
    getHeadOnlyAvatarUrl,
    loading,
    error
  };
}
