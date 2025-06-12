import { useState } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useSpeech } from "@/hooks/useSpeech";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BingoCard } from "@/components/BingoCard";
import { GameControls } from "@/components/GameControls";
import { HabboAvatar } from "@/components/HabboAvatar";
import { Chat } from "@/components/Chat";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef } from "react";

type Screen = "landing" | "options" | "game";

export default function Game() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("landing");
  const [username, setUsername] = useState("");
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedServer, setSelectedServer] = useState<"origins" | "es">("origins");

  const {
    gameState,
    error,
    winner,
    bingoNotification,
    bingoAnnouncement,
    chatMessages,
    createRoom,
    joinRoom,
    startGame,
    markNumber,
    resetGame,
    confirmBingo,
    rejectBingo,
    dismissBingoNotification,
    dismissBingoAnnouncement,
    sendMessage,
    kickPlayer,
    clearError,
    clearWinner,
  } = useWebSocket();

  const { speakNumber, speakBingo } = useSpeech();
  const { toast } = useToast();
  const previousCurrentNumber = useRef<number | null>(null);

  // Muestra errores
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      clearError();
    }
  }, [error, toast, clearError]);

  // Cambia a pantalla de juego al unirse
  useEffect(() => {
    if (gameState.roomCode && currentScreen !== "game") {
      setCurrentScreen("game");
    }
  }, [gameState.roomCode, currentScreen]);

  // Llama número con voz
  useEffect(() => {
    if (
      gameState.currentNumber !== null &&
      gameState.currentNumber !== previousCurrentNumber.current &&
      gameState.gameActive
    ) {
      speakNumber(gameState.currentNumber);
      previousCurrentNumber.current = gameState.currentNumber;
    }
  }, [gameState.currentNumber, gameState.gameActive, speakNumber]);

  // Llama "Bingo!" con voz
  useEffect(() => {
    if (winner) {
      speakBingo();
    }
  }, [winner, speakBingo]);

  const handleEnterGame = () => {
    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu nombre de usuario",
        variant: "destructive",
      });
      return;
    }
    setCurrentScreen("options");
  };

  const handleCreateRoom = () => {
    createRoom(username, roomCodeInput || undefined, selectedServer);
    setShowCreateModal(false);
    setRoomCodeInput("");
  };

  const handleJoinRoom = () => {
    if (!joinCodeInput.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa el código de la sala",
        variant: "destructive",
      });
      return;
    }
    joinRoom(username, joinCodeInput, selectedServer);
    setShowJoinModal(false);
    setJoinCodeInput("");
  };

  const handleLeaveRoom = () => {
    setCurrentScreen("options");
    window.location.reload(); // Reiniciar estado
  };

  if (currentScreen === "landing") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-md w-full text-center border-4 border-habbo-purple shadow-2xl">
          <div className="mb-8">
            <div className="mb-4">
              <img 
                src="https://habboticos.com/wp-content/uploads/2025/03/LogoHT5_3.gif" 
                alt="HabboTicos Logo" 
                className="mx-auto max-w-full h-auto"
              />
            </div>
            <div className="font-pixel text-2xl md:text-3xl habbo-pink flex justify-center items-center space-x-1 mt-4">
              <span className="animate-wave-1">B</span>
              <span className="animate-wave-2">I</span>
              <span className="animate-wave-3">N</span>
              <span className="animate-wave-4">G</span>
              <span className="animate-wave-5">O</span>
            </div>
            <div className="flex justify-center mt-3 mb-6">
              <div className="w-6 h-2 bg-habbo-purple mr-1 rounded animate-bar-1"></div>
              <div className="w-6 h-2 bg-habbo-pink mr-1 rounded animate-bar-2"></div>
              <div className="w-6 h-2 bg-habbo-yellow mr-1 rounded animate-bar-3"></div>
              <div className="w-6 h-2 bg-habbo-green mr-1 rounded animate-bar-4"></div>
              <div className="w-6 h-2 bg-habbo-red rounded animate-bar-5"></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-3">
              <Input
                type="text"
                placeholder="Ingresa tu nombre de usuario de Habbo"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={20}
                className="w-full px-4 py-3 bg-white/20 border-2 border-habbo-purple text-white placeholder-white/70 focus:border-habbo-pink"
                onKeyPress={(e) => e.key === "Enter" && handleEnterGame()}
              />
              {username.trim() && (
                <div className="flex justify-center">
                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-habbo-purple/50">
                    <HabboAvatar
                      username={username.trim()}
                      fullAvatar={true}
                      showInfo={true}
                      showServerSelector={true}
                      onServerChange={(server) => setSelectedServer(server)}
                    />
                  </div>
                </div>
              )}
            </div>
            <Button
              onClick={handleEnterGame}
              className="w-full bg-gradient-to-r from-habbo-purple to-purple-700 text-white font-bold py-3 px-6 hover:from-purple-700 hover:to-habbo-purple transform hover:scale-105 transition-all duration-200"
            >
              ¡ENTRAR AL JUEGO!
            </Button>
          </div>
          <div className="mt-6 text-white/80 text-sm space-y-1">
            <p>🎮 Juego multijugador en tiempo real</p>
            <p>🏆 Marca manualmente tus números</p>
            <p>👑 El host controla las partidas</p>
          </div>
        </div>
        
        {/* Información legal y créditos en la parte inferior */}
        <div className="fixed bottom-0 left-0 right-0 bg-black/30 backdrop-blur-sm py-2 text-center">
          <div className="text-white/40 text-xs leading-tight px-2">
            <p>Este juego no está afiliado, respaldado ni aprobado por Sulake Corporation Oy o sus Afiliados. De acuerdo con la Política de Webs fans de Habbo, este contenido puede utilizar la propiedad intelectual de Habbo bajo permiso no comercial.</p>
          </div>
          <div className="font-pixel text-xs text-habbo-pink mt-1">
            
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === "options") {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-lg w-full text-center border-4 border-habbo-purple shadow-2xl">
            <div className="mb-6">
              <h2 className="font-pixel text-xl text-white mb-2">
                ¡Hola{" "}
                <span className="habbo-pink">{username}</span>!
              </h2>
              <p className="text-white/80">¿Qué quieres hacer?</p>
            </div>
            <div className="space-y-4">
              <Button
                onClick={() => setShowCreateModal(true)}
                className="w-full bg-gradient-to-r from-habbo-green to-green-600 text-white font-bold py-4 px-6 hover:from-green-600 hover:to-habbo-green transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>👑</span>
                <span>CREAR SALA</span>
              </Button>
              <Button
                onClick={() => setShowJoinModal(true)}
                className="w-full bg-gradient-to-r from-habbo-purple to-purple-700 text-white font-bold py-4 px-6 hover:from-purple-700 hover:to-habbo-purple flex items-center justify-center space-x-2 transform hover:scale-105 transition-all duration-200"
              >
                <span>🚪</span>
                <span>UNIRSE A SALA</span>
              </Button>
              <Button
                onClick={() => setCurrentScreen("landing")}
                variant="outline"
                className="w-full bg-white/20 text-white font-medium py-2 px-4 hover:bg-white/30 border-white/30"
              >
                ← Volver
              </Button>
            </div>
          </div>

          {/* Modal - Crear Sala */}
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogContent className="bg-white/10 backdrop-blur-md border-4 border-habbo-green">
              <DialogHeader>
                <DialogTitle className="font-pixel text-lg text-white text-center">CREAR SALA</DialogTitle>
              </DialogHeader>
              <div id="create-room-description" className="sr-only">
                Formulario para crear una nueva sala de Bingo
              </div>
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Código de la sala (opcional)"
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value)}
                  maxLength={10}
                  className="w-full px-4 py-3 bg-white/20 border-2 border-habbo-green text-white placeholder-white/70 focus:border-habbo-pink"
                />
                <div className="flex space-x-2">
                  <Button
                    onClick={handleCreateRoom}
                    className="flex-1 bg-habbo-green text-white font-bold hover:bg-green-600"
                  >
                    Crear
                  </Button>
                  <Button
                    onClick={() => setShowCreateModal(false)}
                    variant="outline"
                    className="flex-1 bg-white/20 text-white font-medium hover:bg-white/30 border-white/30"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Modal - Unirse a Sala */}
          <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
            <DialogContent className="bg-white/10 backdrop-blur-md border-4 border-habbo-purple">
              <DialogHeader>
                <DialogTitle className="font-pixel text-lg text-white text-center">UNIRSE A SALA</DialogTitle>
              </DialogHeader>
              <div id="join-room-description" className="sr-only">
                Formulario para unirse a una sala existente
              </div>
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Ingresa el código de la sala"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value)}
                  maxLength={10}
                  className="w-full px-4 py-3 bg-white/20 border-2 border-habbo-green text-white placeholder-white/90 focus:border-habbo-pink"
                  onKeyPress={(e) => e.key === "Enter" && handleJoinRoom()}
                />
                <div className="flex space-x-2">
                  <Button
                    onClick={handleJoinRoom}
                    className="flex-1 bg-habbo-purple text-white font-bold hover:bg-purple-700"
                  >
                    Unirse
                  </Button>
                  <Button
                    onClick={() => setShowJoinModal(false)}
                    variant="outline"
                    className="flex-1 bg-white/20 text-white font-medium hover:bg-white/30 border-white/30"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </>
    );
  }

  // Pantalla principal del juego
  return (
    <>
      <div className="min-h-screen p-4">
        {/* Encabezado */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border-2 border-habbo-purple">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
              <div className="text-white">
                <div className="flex items-center space-x-2">
                  <h2 className="font-pixel text-lg">Sala: <span className="habbo-pink">{gameState.roomCode}</span></h2>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(gameState.roomCode);
                      const toastInstance = toast({
                        title: "¡Copiado!",
                        description: "Código copiado al portapapeles",
                      });
                      // Auto-dismiss después de 2 segundos
                      setTimeout(() => {
                        toastInstance.dismiss();
                      }, 2000);
                    }}
                    className="inline-flex items-center justify-center w-6 h-6 bg-habbo-yellow/20 hover:bg-habbo-yellow/60 hover:scale-110 text-habbo-yellow hover:text-black rounded text-xs transition-all duration-300 border border-habbo-yellow/30 hover:border-habbo-yellow hover:shadow-lg hover:shadow-habbo-yellow/25 cursor-pointer"
                    title="Copiar código de sala"
                  >
                    📋
                  </button>
                </div>
                <p className="text-sm opacity-80">Jugadores conectados: {gameState.playerCount}</p>
              </div>
              <GameControls
                isHost={gameState.isHost}
                gameActive={gameState.gameActive}
                onStartGame={startGame}
                onResetGame={resetGame}
                onLeaveRoom={handleLeaveRoom}
              />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-4 gap-6">
          {/* Cartón de Bingo */}
          <div className="lg:col-span-2">
            <BingoCard
              bingoCard={gameState.bingoCard}
              markedNumbers={gameState.markedNumbers}
              calledNumbers={gameState.calledNumbers}
              onMarkNumber={markNumber}
              disabled={gameState.gameBlocked}
            />
          </div>

          {/* Números cantados + Jugadores */}
          <div className="space-y-4">
            {/* Número actual */}
            <Card className="bg-white/10 backdrop-blur-md border-2 border-habbo-pink">
              <CardContent className="p-6 text-center">
                <h4 className="text-white font-bold mb-2">NÚMERO ACTUAL</h4>
                <div className="text-5xl font-pixel habbo-pink mb-2">
                  {gameState.currentNumber || "--"}
                </div>
                <p className="text-white/80 text-sm">
                  {gameState.gameActive ? "Juego en progreso..." : "Esperando inicio..."}
                </p>
              </CardContent>
            </Card>

            {/* Números Cantados */}
            <Card className="bg-white/10 backdrop-blur-md border-2 border-habbo-yellow">
              <CardContent className="p-4">
                <h4 className="text-white font-bold mb-3 text-center">NÚMEROS CANTADOS</h4>
                <div className="grid grid-cols-5 gap-1" style={{ maxHeight: `${Math.min(gameState.calledNumbers.length * 8 + 40, 240)}px`, overflowY: gameState.calledNumbers.length > 25 ? 'auto' : 'visible' }}>
                  {gameState.calledNumbers.map((number) => (
                    <div key={number} className="bg-habbo-yellow text-black text-sm font-bold rounded p-1 text-center">
                      {number}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Lista de jugadores */}
            <Card className="bg-white/10 backdrop-blur-md border-2 border-habbo-purple">
              <CardContent className="p-4">
                <h4 className="text-white font-bold mb-3 text-center">JUGADORES</h4>
                <div className="space-y-3" style={{ maxHeight: `${Math.min(gameState.players.length * 70 + 20, 240)}px`, overflowY: gameState.players.length > 3 ? 'auto' : 'visible' }}>
                  {gameState.players.map((player, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <HabboAvatar
                        username={player.username}
                        size="small"
                        showInfo={true}
                        className="flex-1"
                        server={player.server || "origins"}
                      />
                      <div className="flex items-center space-x-1">
                        {player.isHost && <span className="text-habbo-yellow ml-2">👑</span>}
                        {gameState.isHost && !player.isHost && (
                          <div className="relative group">
                            <button
                              className="w-6 h-6 bg-red-600/20 hover:bg-red-600/60 text-red-400 hover:text-white rounded text-xs transition-all duration-200 border border-red-600/30 hover:border-red-600"
                              title="Opciones de moderación"
                            >
                              ⚙️
                            </button>
                            <div className="absolute right-0 top-full mt-1 bg-white/10 backdrop-blur-md border border-red-600 rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto z-50 min-w-max">
                              <button
                                onClick={() => {
                                  if (confirm(`¿Estás seguro de que quieres expulsar a ${player.username}?`)) {
                                    kickPlayer(player.id);
                                  }
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded font-medium transition-colors duration-200"
                              >
                                🚫 Expulsar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat fijo */}
          <div className="space-y-4">
            <Chat
              messages={chatMessages || []}
              onSendMessage={sendMessage}
              currentUsername={gameState.username}
            />
          </div>
        </div>
      </div>

      {/* Panel de Verificación de Bingo (solo para host) - Posición fija arriba a la derecha */}
      {bingoNotification && (
        <div className="fixed top-4 right-4 z-50 bg-white/10 backdrop-blur-md border-4 border-habbo-pink rounded-2xl p-6 shadow-2xl max-w-md animate-in slide-in-from-right duration-300">
          <div className="text-center">
            <h3 className="font-pixel text-xl habbo-pink mb-4">¡BINGO DETECTADO!</h3>
            <div className="text-4xl mb-4">🎊</div>
            <p className="text-white text-lg mb-4">
              {bingoNotification.winner} dice que tiene BINGO!
            </p>
            <p className="text-white/80 text-sm mb-6">
              Como host, debes verificar este bingo.
            </p>
            <div className="flex flex-col space-y-3">
              <Button
                onClick={() => confirmBingo(bingoNotification.winnerId)}
                className="w-full bg-habbo-green text-white font-bold hover:bg-green-600 py-3"
              >
                ✓ Confirmar Bingo
              </Button>
              <Button
                onClick={() => rejectBingo()}
                variant="outline"
                className="w-full bg-red-600 text-white font-medium hover:bg-red-700 border-red-600 py-3"
              >
                ✗ Rechazar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Anuncio de Bingo (para jugadores no-host) */}
      <Dialog open={!!bingoAnnouncement} onOpenChange={gameState.gameBlocked ? undefined : () => dismissBingoAnnouncement()}>
        <DialogContent className="bg-white/10 backdrop-blur-md border-4 border-habbo-yellow">
          <DialogHeader>
            <DialogTitle className="font-pixel text-xl habbo-yellow mb-4 text-center">¡BINGO CANTADO!</DialogTitle>
            <div className="text-center">
              <div className="text-5xl mb-4">🎊</div>
              <p className="text-white text-lg mb-6 text-center">
                {bingoAnnouncement}
              </p>
              {gameState.gameBlocked ? (
                <div className="text-white/80 text-sm mb-4">
                  Esperando que el host verifique el bingo...
                </div>
              ) : (
                <Button
                  onClick={() => dismissBingoAnnouncement()}
                  className="mx-auto bg-habbo-yellow text-black font-bold hover:bg-yellow-400"
                >
                  Entendido
                </Button>
              )}
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Modal de Ganador */}
      <Dialog open={!!winner} onOpenChange={() => clearWinner()}>
        <DialogContent className="bg-white/10 backdrop-blur-md border-4 border-habbo-yellow">
          <DialogHeader>
            <DialogTitle className="font-pixel text-2xl habbo-yellow mb-4 text-center">¡BINGO!</DialogTitle>
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-white text-lg mb-6 text-center">
                {winner === gameState.username ? "¡Felicitaciones, ganaste!" : `¡${winner} ganó!`}
              </p>
              <Button
                onClick={() => clearWinner()}
                className="mx-auto bg-habbo-yellow text-black font-bold hover:bg-yellow-400"
              >
                ¡Genial!
              </Button>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>

    </>
  );
}
