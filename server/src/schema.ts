import { sql } from "drizzle-orm";
import { check, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import crypto from 'node:crypto';

export const products = sqliteTable('products', {
  id: text().primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text().notNull(),
  price: integer().notNull(),
  description: text().notNull(),
  shortDescription: text('short_description').notNull(),
  detailSummary: text('detail_summary').notNull(),
  nutritionFacts: text('nutrition_facts', { mode: 'json' }).$type<{ label: string; value: string }[]>().notNull().default([]),
  higlights: text({ mode: 'json' }).$type<string[]>().notNull().default([]),
  image: text().notNull(),
  category: text().notNull(),
});

export const cartItems = sqliteTable(
  'cart_items',
  {
    id: integer().primaryKey({ autoIncrement: true }),
    userId: text('user_id').notNull(),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    quantity: integer().notNull(),
  },
  (table) => [check('qtty_positive_only', sql`${table.quantity} > 0`)],
);

export const reviews = sqliteTable(
  'reviews',
  {
    userId: text('user_id').notNull(),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    rating: integer().notNull(),
    text: text().notNull(),
    fileId: text('file_id').notNull(),
    createdAt: integer('crated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  },
  (table) => [check('rating_1_5', sql`${table.rating} BETWEEN 1 AND 5`), primaryKey({ columns: [table.productId, table.userId] })],
);

export const storyboardProjects = sqliteTable('storyboard_projects', {
  id: text().primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull(),
  clientName: text('client_name').notNull(),
  projectName: text('project_name').notNull(),
  requirements: text().notNull(),
  duration: integer().notNull(),
  mood: text().notNull(),
  colorPalette: text('color_palette', { mode: 'json' }).$type<string[]>().notNull().default([]),
  typography: text({ mode: 'json' }).$type<{ font: string; style: string }>().notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const storyboardScenes = sqliteTable('storyboard_scenes', {
  id: text().primaryKey(),
  projectId: text('project_id')
    .notNull()
    .references(() => storyboardProjects.id, { onDelete: 'cascade' }),
  sceneNumber: integer('scene_number').notNull(),
  startTime: integer('start_time').notNull(),
  endTime: integer('end_time').notNull(),
  description: text().notNull(),
  cameraMovement: text('camera_movement').notNull(),
  copyText: text('copy_text').notNull(),
  bgColor: text('bg_color').notNull(),
  transition: text().notNull(),
  bgmDirection: text('bgm_direction').notNull(),
  imageUrl: text('image_url'),
});