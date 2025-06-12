import { useState, useEffect } from 'react';
import { useHabboAPI, HabboServer } from '@/hooks/useHabboAPI';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface HabboAvatarProps {
  username: string;
  size?: 'small' | 'large';
  showInfo?: boolean;
  showServerSelector?: boolean;
  className?: string;
  headOnly?: boolean;
  fullAvatar?: boolean;
  onServerChange?: (server: HabboServer) => void;
  server?: HabboServer;
}

export function HabboAvatar({ 
  username, 
  size = 'small', 
  showInfo = false, 
  showServerSelector = false,
  className,
  headOnly = false,
  fullAvatar = false,
  onServerChange,
  server: propServer
}: HabboAvatarProps) {
  const { getHabboUser, getAvatarUrl, getFullAvatarUrl, getHeadOnlyAvatarUrl, loading, error } = useHabboAPI();
  const [habboUser, setHabboUser] = useState<any>(null);
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [selectedServer, setSelectedServer] = useState<HabboServer>(propServer || 'origins');

  // Update selected server when prop changes
  useEffect(() => {
    if (propServer) {
      setSelectedServer(propServer);
    }
  }, [propServer]);

  useEffect(() => {
    if (username && (showInfo || headOnly)) {
      setHabboUser(null);
      getHabboUser(username, selectedServer).then(user => {
        if (user) {
          setHabboUser(user);
        }
      });
    }
  }, [username, getHabboUser, showInfo, selectedServer, headOnly]);

  let avatarUrl;
  let avatarSize;

  const figureString = habboUser?.figureString;

  if (headOnly) {
    avatarUrl = getHeadOnlyAvatarUrl(username, selectedServer, figureString);
    avatarSize = 'h-16 w-16 md:h-18 md:w-18';
  } else if (fullAvatar) {
    avatarUrl = getFullAvatarUrl(username, selectedServer, figureString);
    avatarSize = 'h-[110px] w-16';
  } else {
    avatarUrl = getAvatarUrl(username, size, selectedServer, figureString);
    avatarSize = size === 'large' ? 'h-16 w-16 md:h-18 md:w-18' : 'h-12 w-10 md:h-14 md:w-12';
  }

  if (loading && showInfo) {
    return (
      <div className={`space-y-3 ${className}`}>
        {showServerSelector && (
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        )}
        <div className="flex items-center space-x-3">
          <Skeleton className={`${avatarSize} rounded-full`} />
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {showServerSelector && (
  <div className="flex space-x-2">
    <Button
      size="sm"
      variant={selectedServer === 'origins' ? 'default' : 'outline'}
      onClick={() => {
        setSelectedServer('origins');
        onServerChange?.('origins');
      }}
      className={selectedServer === 'origins' 
        ? 'bg-habbo-purple text-white' 
        : 'bg-white/20 text-white hover:bg-white/30'
      }
    >
      Origins
    </Button>
    <Button
      size="sm"
      variant={selectedServer === 'es' ? 'default' : 'outline'}
      onClick={() => {
        setSelectedServer('es');
        onServerChange?.('es');
      }}
      className={selectedServer === 'es' 
        ? 'bg-habbo-green text-white' 
        : 'bg-white/20 text-white hover:bg-white/30'
      }
    >
      España
    </Button>
  </div>
)}
      <div className="flex items-center space-x-3">
        <div className={`${avatarSize} flex items-center justify-center overflow-hidden ${size === 'small' ? 'rounded' : 'rounded-lg'}`}>
          <img 
            src={avatarUrl} 
            alt={`Avatar de ${username}`}
            onLoad={() => setAvatarLoaded(true)}
            className="w-full h-full object-contain"
          />
        </div>

        {showInfo && (
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-white truncate">{username}</p>
              {habboUser?.habboClubMember && (
                <Badge variant="secondary" className="bg-habbo-yellow text-black text-xs">HC</Badge>
              )}
              {habboUser?.buildersClubMember && (
                <Badge variant="secondary" className="bg-habbo-green text-white text-xs">BC</Badge>
              )}
            </div>
            {habboUser?.motto && (
              <p className="text-xs text-white/70 truncate">"{habboUser.motto}"</p>
            )}
            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}
            {habboUser && (
              <p className="text-xs text-white/50">
                {selectedServer === 'origins' ? 'Habbo Origins' : 'Habbo España'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
