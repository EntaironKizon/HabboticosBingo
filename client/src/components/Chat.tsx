import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, MessageCircle } from "lucide-react";
import { ChatMessage } from "@/hooks/useWebSocket";
import { HabboAvatar } from "@/components/HabboAvatar";
import { useHabboAPI, HabboServer } from "@/hooks/useHabboAPI";

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  currentUsername: string;
}

export function Chat({ messages, onSendMessage, currentUsername }: ChatProps) {
  const [newMessage, setNewMessage] = useState("");

  // Función para generar color de borde basado en el username
  const getBorderColorFromUsername = (username: string) => {
    const colors = [
      'border-habbo-purple shadow-purple-500/30',
      'border-habbo-pink shadow-pink-500/30', 
      'border-habbo-green shadow-green-500/30',
      'border-habbo-yellow shadow-yellow-500/30',
      'border-blue-500 shadow-blue-500/30',
      'border-orange-500 shadow-orange-500/30',
      'border-red-500 shadow-red-500/30',
      'border-indigo-500 shadow-indigo-500/30'
    ];
    
    // Usar el hash del username para generar un índice consistente
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      const char = username.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-full flex flex-col bg-white/10 backdrop-blur-md border-2 border-habbo-purple">
      <CardHeader className="pb-2 bg-habbo-purple text-white">
        <CardTitle className="text-lg flex items-center justify-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          CHAT
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 p-3 flex flex-col justify-start min-h-0">
          <div className="flex-1 flex flex-col justify-end space-y-2">
            {messages.length === 0 ? (
              <div className="text-center text-white/70 text-sm py-4">
                No hay mensajes aún...
              </div>
            ) : (
              messages.slice(-10).map((msg, index) => {
                const borderColor = getBorderColorFromUsername(msg.username);
                return (
                  <div key={index} className="flex items-center space-x-2 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex-shrink-0">
                      <HabboAvatar
                        username={msg.username}
                        headOnly={true}
                        server={msg.server || 'origins'}
                        className="flex-shrink-0"
                      />
                    </div>
                    <div className={`flex-1 bg-white/90 text-black px-3 py-2 rounded-full text-sm max-w-xs leading-tight border-2 ${borderColor} transition-all`}>
                      <span className="font-medium">{msg.username}:</span> {msg.message}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="p-3 border-t border-habbo-purple/30 bg-white/5">
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-white/20 border-habbo-purple text-white placeholder-white/70 focus:border-habbo-pink"
              maxLength={200}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              size="sm"
              className="px-3 bg-habbo-pink hover:bg-pink-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-xs text-white/60 mt-1">
            Presiona Enter para enviar
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
