import { Button } from "@/components/ui/button";

interface GameControlsProps {
  isHost: boolean;
  gameActive: boolean;
  onStartGame: () => void;
  onResetGame: () => void;
  onLeaveRoom: () => void;
}

export function GameControls({ 
  isHost, 
  gameActive, 
  onStartGame, 
  onResetGame, 
  onLeaveRoom 
}: GameControlsProps) {
  return (
    <div className="flex space-x-2">
      {isHost && (
        <div className="space-x-2">
          {!gameActive ? (
            <Button 
              onClick={onStartGame}
              className="bg-habbo-green text-white font-bold hover:bg-green-600"
            >
              🎯 Iniciar Partida Automática
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="bg-habbo-yellow text-black px-3 py-2 rounded font-bold text-sm animate-pulse">
                🔊 Números automáticos cada 6s
              </div>
            </div>
          )}
          <Button 
            onClick={onResetGame}
            className="bg-habbo-red text-white font-bold hover:bg-red-600"
          >
            🔄 Reiniciar
          </Button>
        </div>
      )}
      <Button 
        onClick={onLeaveRoom}
        variant="outline"
        className="bg-white/20 text-white font-medium hover:bg-white/30 border-white/30"
      >
        🚪 Salir
      </Button>
    </div>
  );
}