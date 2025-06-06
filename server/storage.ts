import { rooms, players, type Room, type Player, type InsertRoom, type InsertPlayer } from "@shared/schema";

export interface IStorage {
  // Room operations
  createRoom(room: InsertRoom): Promise<Room>;
  getRoomByCode(code: string): Promise<Room | undefined>;
  getRoomById(id: number): Promise<Room | undefined>;
  updateRoom(id: number, updates: Partial<Room>): Promise<Room | undefined>;
  deleteRoom(id: number): Promise<void>;

  // Player operations
  createPlayer(player: InsertPlayer): Promise<Player>;
  getPlayersByRoomId(roomId: number): Promise<Player[]>;
  getPlayerBySocketId(socketId: string): Promise<Player | undefined>;
  getPlayerById(id: number): Promise<Player | undefined>;
  updatePlayer(id: number, updates: Partial<Player>): Promise<Player | undefined>;
  removePlayerBySocketId(socketId: string): Promise<void>;
  removePlayersByRoomId(roomId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private rooms: Map<number, Room>;
  private players: Map<number, Player>;
  private currentRoomId: number;
  private currentPlayerId: number;

  constructor() {
    this.rooms = new Map();
    this.players = new Map();
    this.currentRoomId = 1;
    this.currentPlayerId = 1;
  }

  // Room operations
  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const id = this.currentRoomId++;
    const room: Room = { 
      id,
      code: insertRoom.code,
      hostId: insertRoom.hostId,
      isGameActive: insertRoom.isGameActive ?? false,
      currentNumber: insertRoom.currentNumber ?? null,
      calledNumbers: (insertRoom.calledNumbers as number[]) || [],
      pendingBingoVerification: null,
      createdAt: new Date(),
    };
    this.rooms.set(id, room);
    return room;
  }

  async getRoomByCode(code: string): Promise<Room | undefined> {
    return Array.from(this.rooms.values()).find(room => room.code === code);
  }

  async getRoomById(id: number): Promise<Room | undefined> {
    return this.rooms.get(id);
  }

  async updateRoom(id: number, updates: Partial<Room>): Promise<Room | undefined> {
    const room = this.rooms.get(id);
    if (!room) return undefined;

    const updatedRoom = { ...room, ...updates };
    this.rooms.set(id, updatedRoom);
    return updatedRoom;
  }

  async deleteRoom(id: number): Promise<void> {
    this.rooms.delete(id);
  }

  // Player operations
  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = this.currentPlayerId++;
    const player: Player = { 
      id,
      username: insertPlayer.username,
      roomId: insertPlayer.roomId ?? null,
      socketId: insertPlayer.socketId,
      bingoCard: [...insertPlayer.bingoCard] as (number | string)[],
      markedNumbers: insertPlayer.markedNumbers ? [...insertPlayer.markedNumbers] as number[] : [],
      isHost: insertPlayer.isHost ?? false,
      joinedAt: new Date(),
      server: insertPlayer.server || 'origins',
    };
    this.players.set(id, player);
    return player;
  }

  async getPlayersByRoomId(roomId: number): Promise<Player[]> {
    return Array.from(this.players.values()).filter(player => player.roomId === roomId);
  }

  async getPlayerBySocketId(socketId: string): Promise<Player | undefined> {
    return Array.from(this.players.values()).find(player => player.socketId === socketId);
  }

  async getPlayerById(id: number): Promise<Player | undefined> {
    return this.players.get(id);
  }

  async updatePlayer(id: number, updates: Partial<Player>): Promise<Player | undefined> {
    const player = this.players.get(id);
    if (!player) return undefined;

    const updatedPlayer = { ...player, ...updates };
    this.players.set(id, updatedPlayer);
    return updatedPlayer;
  }

  async removePlayerBySocketId(socketId: string): Promise<void> {
    const player = Array.from(this.players.values()).find(p => p.socketId === socketId);
    if (player) {
      this.players.delete(player.id);
    }
  }

  async removePlayersByRoomId(roomId: number): Promise<void> {
    const playersToRemove = Array.from(this.players.values()).filter(p => p.roomId === roomId);
    playersToRemove.forEach(player => this.players.delete(player.id));
  }
}

export const storage = new MemStorage();