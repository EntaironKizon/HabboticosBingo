import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  hostId: text("host_id").notNull(),
  isGameActive: boolean("is_game_active").default(false).notNull(),
  currentNumber: integer("current_number"),
  calledNumbers: json("called_numbers").$type<number[]>().default([]).notNull(),
  pendingBingoVerification: json("pending_bingo_verification").$type<{playerId: number, playerName: string} | null>().default(null),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  roomId: integer("room_id").references(() => rooms.id),
  socketId: text("socket_id").notNull(),
  bingoCard: json("bingo_card").$type<(number | string)[]>().notNull(),
  markedNumbers: json("marked_numbers").$type<number[]>().default([]).notNull(),
  isHost: boolean("is_host").default(false).notNull(),
  server: text("server").notNull().default("origins"),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const insertRoomSchema = createInsertSchema(rooms).omit({
  id: true,
  createdAt: true,
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  joinedAt: true,
});

export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Room = typeof rooms.$inferSelect;
export type Player = typeof players.$inferSelect;

export interface Player {
  id: number;
  username: string;
  roomId: number;
  socketId: string;
  bingoCard: (number | string)[];
  markedNumbers: number[];
  isHost: boolean;
  server?: 'origins' | 'es';
}