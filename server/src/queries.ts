import { drizzle } from "drizzle-orm/d1";
import { eq, and, or, like } from "drizzle-orm";
import { cartItems, products, reviews, storyboardProjects, storyboardScenes } from "./schema";
import { file } from 'zod/mini';

function getDb(d1: D1Database) {
  return drizzle(d1);
}

// -- ecommerce --------------------------------------------
export async function searchProducts(d1: D1Database, query?: string, category?: string) {
  const db = getDb(d1);
  const conditions = [];

  if (query) {
    const q = `%${query}%`;
    conditions.push(or(like(products.name, q), like(products.description, q)));
  }
  if (category) {
    conditions.push(eq(products.category, category));
  }

  return db.select()
    .from(products)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

}

export async function getProductById(d1: D1Database, productId: string) {
  const db = getDb(d1);
  return db.select().from(products).where(eq(products.id, productId)).get();
}

export async function getReviewsByProductId(d1: D1Database, productId: string) {
  const db = getDb(d1);
  return db.select().from(reviews).where(eq(reviews.productId, productId));
}

export async function modifyCart(d1: D1Database, userId: string, productId: string, quantity: number) {
  const db = getDb(d1);

  const existing = await db.select()
    .from(cartItems)
    .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)))
    .get();

  if (existing) {
    const newQtty = existing.quantity + quantity;
    if (newQtty <= 0) {
      await db.delete(cartItems).where(eq(cartItems.id, existing.id));
    } else {
      await db.update(cartItems).set({ quantity: newQtty }).where(eq(cartItems.id, existing.id));
    }
  } else {
    await db.insert(cartItems).values({
      userId,
      productId,
      quantity
    });
  }
}

export async function getCartProducts(d1: D1Database, userId: string) {
  const db = await getDb(d1);

  return db.select({
    id: products.id,
    name: products.name,
    price: products.price,
    image: products.image,
    quantity: cartItems.quantity,
  })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, userId));
}

export async function clearCart(d1: D1Database, userId: string) {
  const db = getDb(d1);

  await db.delete(cartItems).where(eq(cartItems.userId, userId));
}

export async function upsertReview(d1: D1Database, userId: string, productId: string, rating: number, text: string, fileId?: string) {
  const db = getDb(d1);

  const existing = await db.select().from(reviews).where(and(eq(reviews.productId, productId), eq(reviews.userId, userId))).get();

  if (existing) {
    await db.update(reviews)
      .set({ rating, text, fileId })
      .where(and(eq(reviews.productId, productId), eq(reviews.userId, userId)));
  } else {
    await db.insert(reviews).values({ rating, text, fileId: fileId ?? '', userId, productId });
  }

}

// -- stortyboard --------------------------------------------
export async function createStoryboardProject(
  d1: D1Database,
  data: {
    userId: string;
    clientName: string;
    projectName: string;
    requirements: string;
    duration: number;
    mood: string;
    colorPalette: string[];
    typography: { font: string; style: string };
  }
) {
  const db = getDb(d1);
  const id = crypto.randomUUID();
  await db.insert(storyboardProjects).values({
    id,
    ...data,
    colorPalette: JSON.stringify(data.colorPalette) as any,
    typography: JSON.stringify(data.typography) as any,
  });
  return id;
}

export async function createStoryboardScene(
  d1: D1Database,
  projectId: string,
  scene: {
    sceneNumber: number;
    startTime: number;
    endTime: number;
    description: string;
    cameraMovement: string;
    copyText: string;
    bgColor: string;
    transition: string;
    bgmDirection: string;
  }
) {
  const db = getDb(d1);
  const id = `${projectId}_${scene.sceneNumber}`;
  await db.insert(storyboardScenes).values({ id, projectId, ...scene });
}

export async function getStoryboardProjects(d1: D1Database, userId: string) {
  const db = getDb(d1);
  return db
    .select()
    .from(storyboardProjects)
    .where(eq(storyboardProjects.userId, userId));
}

export async function getStoryboardById(d1: D1Database, projectId: string) {
  const db = getDb(d1);
  const project = await db
    .select()
    .from(storyboardProjects)
    .where(eq(storyboardProjects.id, projectId))
    .get();

  if (!project) return null;

  const scenes = await db
    .select()
    .from(storyboardScenes)
    .where(eq(storyboardScenes.projectId, projectId));

  return { project, scenes };
}

export async function updateStoryboardScene(
  d1: D1Database,
  sceneId: string,
  data: Partial<{
    description: string;
    cameraMovement: string;
    copyText: string;
    bgColor: string;
    transition: string;
    bgmDirection: string;
  }>
) {
  const db = getDb(d1);
  await db
    .update(storyboardScenes)
    .set(data)
    .where(eq(storyboardScenes.id, sceneId));
}

export async function deleteStoryboardProject(d1: D1Database, projectId: string) {
  const db = getDb(d1);
  await db
    .delete(storyboardProjects)
    .where(eq(storyboardProjects.id, projectId));
}