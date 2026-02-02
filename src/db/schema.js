import {
  pgTable,
  pgEnum,
  serial,
  integer,
  text,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

/**
 * ENUMS
 */
export const matchStatusEnum = pgEnum("match_status", [
  "scheduled",
  "live",
  "finished",
]);

/**
 * MATCHES TABLE
 */
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  sport: text("sport").notNull(),
  homeTeam: text("home_team").notNull(),
  awayTeam: text("away_team").notNull(),
  status: matchStatusEnum("status")
    .notNull()
    .default("scheduled"),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }),
  homeScore: integer("home_score").notNull().default(0),
  awayScore: integer("away_score").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * COMMENTARY TABLE
 * Designed for real-time feeds (ordered by minute + sequence)
 */
export const commentary = pgTable("commentary", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id")
    .notNull()
    .references(() => matches.id, { onDelete: "cascade" }),
  minute: integer("minute").notNull(),
  sequence: integer("sequence").notNull(),
  period: text("period"), // e.g. "1st Half", "Q3", "Over 12"
  eventType: text("event_type").notNull(), // goal, foul, wicket, timeout, etc.
  actor: text("actor"), // player or referee name
  team: text("team"),   // home / away / team name
  message: text("message").notNull(),
  metadata: jsonb("metadata").default({}), // extensible event data
  tags: text("tags").array(), // ["goal", "penalty", "var"]
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
