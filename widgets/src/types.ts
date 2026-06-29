export type NutritionFact = { label: string; value: string };

export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  shortDescription: string;
  detailSummary: string;
  nutritionFacts: NutritionFact[];
  higlights: string[];
  image: string;
  category: string;
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

export type Order = {
  orderId: string;
  total: number;
  cartItems: CartItem[];
};

export type Review = {
  userId: string;
  productId: string;
  rating: number;
  text: string;
  fileId: string;
  createdAt: string | null;
};

export type StoryboardProject = {
  id: string;
  userId: string;
  clientName: string;
  projectName: string;
  requirements: string;
  duration: number;
  mood: string;
  colorPalette: string[];
  typography: { font: string; style: string };
  createdAt: string | null;
};

export type StoryboardScene = {
  id: string;
  projectId: string;
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