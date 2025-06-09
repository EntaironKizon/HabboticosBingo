import { useEffect, useRef, useState } from "react";

export interface ChatMessage {
  username: string;
  message: string;
  timestamp: string;
  isHost: boolean;
  server?: string;
}

export interface GameState {
  username: string;
  roomCode: string;
  isHost: boolean;
  gameActive: boolean;
  gameBlocked: boolean;
  bingoCard: (number | string)[];
  markedNumbers: number[];
  calledNumbers: number[];
  currentNumber: number | null;
  players: any[];
  playerCount: number;
}

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    username: "",
    roomCode: "",
    isHost: false,
    gameActive: false,
    gameBlocked: false,
    bingoCard: [],
    markedNumbers: [],
    calledNumbers: [],
    currentNumber: null,
    players: [],
    playerCount: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [bingoNotification, setBingoNotification] = useState<{winner: string, winnerId: number} | null>(null);
  const [bingoAnnouncement, setBingoAnnouncement] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Inicia conexión WebSocket
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host.includes("localhost")
      ? "localhost:5000"
      : window.location.host;

    const wsUrl = `${protocol}//${host}/ws`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case "room_created":
          case "room_joined":
            setGameState((prev) => ({
              ...prev,
              roomCode: message.room.code,
              isHost: message.isHost,
              bingoCard: message.player.bingoCard,
              markedNumbers: message.player.markedNumbers,
              players: message.players || [message.player],
              playerCount: message.players?.length || 1,
              gameActive: message.room.isGameActive,
              calledNumbers: message.room.calledNumbers || [],
              currentNumber: message.room.currentNumber,
            }));
            break;

          case "player_joined":
            setGameState((prev) => ({
              ...prev,
              players: message.players,
              playerCount: message.playerCount,
            }));
            break;

          case "player_left":
            setGameState((prev) => ({
              ...prev,
              players: prev.players.filter((p) => p.socketId !== message.player.socketId),
              playerCount: message.playerCount,
            }));
            break;

          case "player_kicked":
            setGameState((prev) => ({
              ...prev,
              players: message.players,
              playerCount: message.playerCount,
            }));
            break;

          case "kicked_from_room":
            setError(message.message);
            // Resetear el estado del juego
            setGameState({
              username: "",
              roomCode: "",
              isHost: false,
              gameActive: false,
              gameBlocked: false,
              bingoCard: [],
              markedNumbers: [],
              calledNumbers: [],
              currentNumber: null,
              players: [],
              playerCount: 0,
            });
            break;

          case "host_changed":
            setGameState((prev) => ({
              ...prev,
              isHost: message.isHost,
              players: prev.players.filter((p) => p.socketId !== message.player.socketId),
              playerCount: message.playerCount,
            }));
            break;

          case "game_started":
            setGameState((prev) => ({
              ...prev,
              gameActive: true,
            }));
            break;

          case "number_called":
            setGameState((prev) => ({
              ...prev,
              currentNumber: message.number,
              calledNumbers: message.calledNumbers,
            }));
            break;

          case "number_marked":
            setGameState((prev) => ({
              ...prev,
              markedNumbers: message.markedNumbers,
            }));
            break;

          case "bingo_notification":
            setBingoNotification({
              winner: message.winner,
              winnerId: message.winnerId
            });
            // Bloquear también al host durante la verificación
            setGameState(prev => ({ ...prev, gameBlocked: true }));
            break;

          case "bingo_announced":
            setBingoAnnouncement(message.message);
            if (message.gameBlocked) {
              setGameState(prev => ({ ...prev, gameBlocked: true }));
              // No auto-dismiss cuando el juego está bloqueado
            } else {
              // Auto-dismiss después de 5 segundos solo si no está bloqueado
              setTimeout(() => setBingoAnnouncement(null), 5000);
            }
            break;

          case "bingo_rejected":
            setBingoAnnouncement(null);
            setBingoNotification(null);
            setGameState(prev => ({ ...prev, gameBlocked: false, gameActive: true }));
            break;

          case "player_won":
            // Reproducir sonido de victoria
            try {
              const winAudio = new Audio('/bingo-win.mp3');
              winAudio.volume = 0.5;
              winAudio.play().catch(console.error);
            } catch (error) {
              console.error('Error playing win sound:', error);
            }
            
            setWinner(message.winner);
            setBingoAnnouncement(null); // Limpiar la pantalla de espera
            setBingoNotification(null); // Limpiar notificación del host
            setGameState((prev) => ({
              ...prev,
              gameActive: false,
              gameBlocked: false,
            }));
            break;

          case "game_reset_with_winner":
            setWinner(message.winner);
            setBingoAnnouncement(null); // Limpiar la pantalla de espera
            setBingoNotification(null); // Limpiar notificación del host
            setGameState((prev) => ({
              ...prev,
              gameActive: false,
              gameBlocked: false,
              bingoCard: message.bingoCard,
              markedNumbers: [],
              calledNumbers: [],
              currentNumber: null,
            }));
            break;

          case "game_reset":
            setGameState((prev) => ({
              ...prev,
              gameActive: false,
              bingoCard: message.bingoCard,
              markedNumbers: [],
              calledNumbers: [],
              currentNumber: null,
            }));
            setWinner(null);
            break;

          case "room_closed":
            setGameState({
              username: "",
              roomCode: "",
              isHost: false,
              gameActive: false,
              gameBlocked: false,
              bingoCard: [],
              markedNumbers: [],
              calledNumbers: [],
              currentNumber: null,
              players: [],
              playerCount: 0,
            });
            break;

          case "chat_message":
            setChatMessages((prev) => [...prev, {
              username: message.username,
              message: message.message,
              timestamp: message.timestamp,
              isHost: message.isHost,
              server: message.server,
            }]);
            break;

          case "error":
            setError(message.message);
            break;
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      setError("Error de conexión");
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const send = (message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  const createRoom = (username: string, roomCode?: string, server: string = "origins") => {
    setGameState((prev) => ({ ...prev, username }));
    send({ type: "create_room", username, roomCode, server });
  };

  const joinRoom = (username: string, roomCode: string, server: string = "origins") => {
    setGameState((prev) => ({ ...prev, username }));
    send({ type: "join_room", username, roomCode, server });
  };

  const startGame = () => {
    send({ type: "start_game" });
  };

  const callNumber = () => {
    send({ type: "call_number" });
  };

  const markNumber = (number: number | string) => {
    send({ type: "mark_number", number });
  };

  const resetGame = () => {
    send({ type: "reset_game" });
  };

  const confirmBingo = (winnerId: number) => {
    send({ type: "confirm_bingo", winnerId });
    setBingoNotification(null);
  };

  const rejectBingo = () => {
    send({ type: "reject_bingo" });
    setBingoNotification(null);
  };

  const dismissBingoNotification = () => {
    setBingoNotification(null);
  };

  const dismissBingoAnnouncement = () => {
    setBingoAnnouncement(null);
  };

  const sendMessage = (message: string) => {
    send({ type: "send_message", message });
  };

  const kickPlayer = (playerId: number) => {
    send({ type: "kick_player", playerId });
  };

  const clearError = () => {
    setError(null);
  };

  const clearWinner = () => {
    setWinner(null);
  };

  return {
    isConnected,
    gameState,
    error,
    winner,
    bingoNotification,
    bingoAnnouncement,
    chatMessages,
    createRoom,
    joinRoom,
    startGame,
    callNumber,
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
  };
}
