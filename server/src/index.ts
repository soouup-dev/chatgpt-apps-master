import OAuthProvider from '@cloudflare/workers-oauth-provider';
import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from '@modelcontextprotocol/ext-apps/server';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createMcpHandler } from 'agents/mcp';
import z from 'zod';
import { handleAuthorizeGet, handleAuthorizePost } from './lib/authorize';
import { and, eq, like, or } from 'drizzle-orm';
import { products, reviews, storyboardProjects, storyboardScenes } from './schema';
import { drizzle } from 'drizzle-orm/d1';
import { clearCart, createStoryboardProject, createStoryboardScene, updateStoryboardScene, deleteStoryboardProject, getCartProducts, getProductById, getReviewsByProductId, getStoryboardById, getStoryboardProjects, modifyCart, searchProducts, upsertReview } from './queries';
import { seedProducts } from './seed';

type AuthProps = {
	email: string;
}

const privateHandler = {
	async fetch(request, env, ctx) {
		const props = ctx.props as AuthProps;
		const WIDGET_URI = 'ui://storyboard-widget';
		const server = new McpServer({
			name: 'Storyboard App',
			version: '1.0',
		});

		registerAppResource(server, 'Storyboard Widget', WIDGET_URI, { description: 'Storyboard Widget' }, async () => {
			const html = await env.ASSETS.fetch(new URL('http://hello/index.html'));
			return {
				contents: [
					{
						uri: WIDGET_URI,
						text: await html.text(),
						mimeType: RESOURCE_MIME_TYPE,
						_meta: {
							'openai/widgetPrefersBorder': true,
							ui: {
								csp: {
									connectDomains: ['https://*.workers.dev'],
									resourceDomains: [
										'https://*.workers.dev',
										'https://fonts.googleapis.com',
										'https://fonts.gstatic.com',
										'https://*.oaistatic.com',
									],
								},
							},
						},
					},
				],
			};
		});

		// Tool: Check Email
		server.registerTool(
			'whoami',
			{
				title: 'whoami',
				description: 'tell the user who they are logged in as.',
				inputSchema: {},
				annotations: { readOnlyHint: true },
			},
			async () => {
				return {
					content: [{ type: 'text', text: `You are logged in as ${JSON.stringify(props)}` }],
				};
			},
		);

		// Tool: Search Products (model only, no UI — data tool for looking up product IDs)
		server.registerTool(
			'search-products',
			{
				title: 'Search Products',
				description:
					'Search products by name or category. Returns product data without showing a widget. Use this to look up product IDs before calling add-to-cart or get-product.',
				inputSchema: {
					query: z.string().toLowerCase().describe('Search by product name or description'),
					category: z.string().optional().describe('Filter by category: pizza, protein, produce'),
				},
				annotations: { readOnlyHint: true },
			},
			async ({ query, category }) => {
				const data = await searchProducts(env.DB, query, category);

				return {
					content: [{ type: 'text', text: JSON.stringify(data.map((p) => ({ id: p.id, name: p.name }))) }],
				};
			},
		);

		// Tool: Get Products (model + app, with UI — shows product grid widget)
		registerAppTool(
			server,
			'get-products',
			{
				title: 'Get Products',
				description:
					"Display products in the widget. Use query to filter by name (e.g. 'pizza') or category to filter by category (e.g. 'pizza', 'protein', 'produce'). Omit both to show all products.",
				inputSchema: {
					query: z.string().optional().describe('Search by product name or description'),
					category: z.string().optional().describe('Filter by category: pizza, protein, produce'),
				},
				annotations: { readOnlyHint: true },
				_meta: {
					ui: { resourceUri: WIDGET_URI },
				},
			},
			async ({ query, category }) => {
				const data = await searchProducts(env.DB, query, category);
				return {
					content: [{ type: 'text', text: `Found ${data.length} products. ${JSON.stringify(data)}` }],
					structuredContent: { products: data },
				};
			},
		);

		// Tool: Get Product Details (model, with UI — shows single product)
		registerAppTool(
			server,
			'get-product',
			{
				title: 'Get Product Details',
				description:
					'Display a single product\'s full details in the widget. Always call this when the user asks about a specific product. Use search-products first to find the product ID.',
				inputSchema: {
					productId: z.string().describe('Product ID to display'),
				},
				annotations: { readOnlyHint: true },
				_meta: {
					ui: { resourceUri: WIDGET_URI },
				},
			},
			async ({ productId }) => {
				const product = await getProductById(env.DB, productId);
				if (!product) {
					return {
						content: [{ type: 'text', text: 'Product not found.' }],
						isError: true,
					};
				}

				const productReviews = await getReviewsByProductId(env.DB, productId);

				return {
					content: [{ type: 'text', text: `Product Details: ${JSON.stringify(product)} showing ${productReviews.length}` }],
					structuredContent: { product, reviews: productReviews },
				};
			},
		);

		// Tool: Add to Cart (model + app, no UI)
		server.registerTool(
			'modify-cart',
			{
				title: 'Modify Cart',
				description: 'Add or remove a product to the shopping cart. Use search-products first to find the product ID.',
				inputSchema: {
					productId: z.string().describe('Product ID to add'),
					quantity: z.number().int().default(1).describe('Quantity to add (negative to decrement)'),
				},
				_meta: {
					ui: { visibility: ['model', 'app'] },
				},
			},
			async ({ productId, quantity }) => {
				await modifyCart(env.DB, props.email, productId, quantity);
				const cartProducts = await getCartProducts(env.DB, props.email);
				return {
					content: [{ type: 'text', text: `Added ${quantity} item(s) to cart. Cart is now ${cartProducts}` }],
					structuredContent: { cartItems: cartProducts },
				};
			},
		);

		// Tool: View Cart (model + app, with UI — shows cart widget)
		registerAppTool(
			server,
			'view-cart',
			{
				title: 'View Cart',
				description: 'View current shopping cart contents',
				inputSchema: {},
				annotations: { readOnlyHint: true },
				_meta: {
					ui: {
						resourceUri: WIDGET_URI,
						visibility: ['model', 'app'],
					},
				},
			},
			async () => {
				const cartProducts = await getCartProducts(env.DB, props.email);
				const subtotal = cartProducts.reduce((sum, item) => sum + item.price * item.quantity, 0);
				return {
					content: [{ type: 'text', text: `Cart has items ${cartProducts} a total of: ${subtotal}` }],
					structuredContent: { cartItems: cartProducts, subtotal },
				};
			},
		);

		// Tool: Checkout (app only, no UI)
		server.registerTool(
			'checkout',
			{
				title: 'Checkout',
				description: 'Complete checkout and create an order from current cart',
				inputSchema: {},
				_meta: {
					ui: { visibility: ['app'] },
				},
			},
			async () => {
				const cartProducts = await getCartProducts(env.DB, props.email);

				if (cartProducts.length === 0) {
					return {
						content: [{ type: 'text', text: `Cart is empty` }],
						isError: true,
					};
				}
				const total = cartProducts.reduce((sum, item) => sum + item.price * item.quantity, 0);
				await clearCart(env.DB, props.email);
				return {
					content: [{ type: 'text', text: `Order Placed. Total ${total}` }],
					structuredContent: {
						orderId: crypto.randomUUID(),
						total,
						cartItems: cartProducts,
					},
				};
			},
		);

		// Tool: Submit Review (app only, no UI)
		server.registerTool(
			'submit-review',
			{
				title: 'Submit Review',
				description: 'Submit or update a product review with rating, text, and optional image',
				inputSchema: {
					productId: z.string().describe('Product ID to review'),
					rating: z.number().int().min(1).max(5).describe('Rating from 1 to 5'),
					text: z.string().describe('Review text'),
					imageUrl: z.string().nullable().optional().describe('Temporary download URL of uploaded review image'),
				},
				_meta: {
					ui: { visibility: ['app'] },
				},
			},
			async ({ productId, rating, text, imageUrl }) => {
				let imageKey: string | undefined;
				if (imageUrl) {
					const { ok, body, headers } = await fetch(imageUrl);
					if (ok) {
						const result = await env.BUCKET.put(`ecommerce/${crypto.randomUUID()}`, body, {
							httpMetadata: {
								contentType: headers.get('content-type') || 'image/jpeg',
							},
						});
						imageKey = result.key;
					}
				}

				await upsertReview(env.DB, props.email, productId, rating, text, imageKey);
				const freshReviews = await getReviewsByProductId(env.DB, productId);
				return {
					content: [{ type: 'text', text: `Review submitted. Total reviews ${freshReviews.length}` }],
					structuredContent: {
						reviews: freshReviews,
					},
				};
			},
		);

		// Tool: Create StoryBoard (model + app, with UI)
		registerAppTool(
			server,
			'create-storyboard',
			{
				title: 'Create Storyboard',
				description: '클라이언트 요구사항을 바탕으로 영상 스토리보드 시안을 생성합니다. 씬 구성, 컬러 팔레트, 타임라인을 위젯에 표시합니다.',
				inputSchema: {
					clientName: z.string().describe('클라이언트/회사 이름'),
					projectName: z.string().describe('프로젝트 이름'),
					requirements: z.string().describe('클라이언트 요구사항 원문'),
					duration: z.number().int().describe('영상 총 길이 (초 단위, 예: 30)'),
					mood: z.string().describe('영상 분위기/톤 (예: 감성적, 역동적, 미니멀)'),
					colorPalette: z.array(z.string()).describe('컬러 팔레트 hex 코드 배열 (예: ["#C8956C", "#F5E6D3"])'),
					typography: z.object({
						font: z.string().describe('폰트 이름'),
						style: z.string().describe('폰트 스타일 (예: Light, Bold)'),
					}).describe('타이포그래피'),
					scenes: z.array(z.object({
						sceneNumber: z.number().int(),
						startTime: z.number().int(),
						endTime: z.number().int(),
						description: z.string(),
						cameraMovement: z.string(),
						copyText: z.string(),
						bgColor: z.string(),
						transition: z.string(),
						bgmDirection: z.string(),
					})).describe('씬 목록'),
				},
				annotations: { readOnlyHint: false },
				_meta: {
					ui: { resourceUri: WIDGET_URI },
				},
			},
			async ({ clientName, projectName, requirements, duration, mood, colorPalette, typography, scenes }) => {
				const projectId = await createStoryboardProject(env.STORYBOARD_DB, {
					userId: props.email,
					clientName,
					projectName,
					requirements,
					duration,
					mood,
					colorPalette, typography
				});

				for (const scene of scenes) {
					await createStoryboardScene(env.STORYBOARD_DB, projectId, scene);
				}

				const data = await getStoryboardById(env.STORYBOARD_DB, projectId);
				if (!data) {
					return {
						content: [{ type: 'text', text: '스토리보드 생성 중 오류가 발생했습니다.' }],
						isError: true,
					};
				}

				return {
					content: [{ type: 'text', text: `스토리보드 생성 완료. 프로젝트 ID: ${projectId}` }],
					structuredContent: data,
				};
			},
		);

		// Tool: Get Storyboard Project
		registerAppTool(
			server,
			'get-storyboard-projects',
			{
				title: 'Get Storyboard Projects',
				description: '내 스토리보드 프로젝트 목록을 위젯에 표시합니다.',
				inputSchema: {},
				annotations: { readOnlyHint: true },
				_meta: {
					ui: { resourceUri: WIDGET_URI }
				},
			},
			async () => {
				const projects = await getStoryboardProjects(env.STORYBOARD_DB, props.email);
				return {
					content: [{ type: 'text', text: '스토리보드 목록 표시 완료' }],
					structuredContent: { projects }
				}
			},
		);

		// Tool: Get Storyboard
		registerAppTool(
			server,
			'get-storyboard',
			{
				title: 'Get Storyboard',
				description: '선택한 스토리보드 프로젝트의 상세 시안을 위젯에 표시합니다.',
				inputSchema: {
					projectId: z.string().describe('프로젝트 ID'),
				},
				annotations: { readOnlyHint: true },
				_meta: {
					ui: { resourceUri: WIDGET_URI }
				},
			},
			async ({ projectId }) => {
				const data = await getStoryboardById(env.STORYBOARD_DB, projectId);
				if (!data) {
					return {
						content: [{ type: 'text', text: '프로젝트를 찾을 수 없습니다.' }],
						isError: true,
					};
				}
				return {
					content: [{ type: 'text', text: `프로젝트: ${data.project.projectName}` }],
					structuredContent: data
				};
			},
		);

		// Tool: Update Scene
		server.registerTool(
			'update-scene',
			{
				title: 'Update Scene',
				description: '특정 씬의 내용을 수정합니다.',
				inputSchema: {
					sceneId: z.string(),
					description: z.string().optional(),
					cameraMovement: z.string().optional(),
					copyText: z.string().optional(),
					bgColor: z.string().optional(),
					transition: z.string().optional(),
					bgmDirection: z.string().optional(),
				},
				_meta: {
					ui: { visibility: ['app'] },
				},
			},
			async ({ sceneId, description, cameraMovement, copyText, bgColor, transition, bgmDirection }) => {
				await updateStoryboardScene(env.STORYBOARD_DB, sceneId, {
					description, cameraMovement, copyText, bgColor, transition, bgmDirection
				});

				return {
					content: [{ type: 'text', text: `Scene ${sceneId} 수정 완료` }],
				};
			},
		);

		// Tool: Delete Project
		server.registerTool(
			'delete-project',
			{
				title: 'Delete Project',
				description: '스토리보드 프로젝트를 삭제합니다.',
				inputSchema: {
					projectId: z.string().describe('삭제할 프로젝트 ID'),
				},
				_meta: {
					ui: { visibility: ['app'] }
				},
			},
			async ({ projectId }) => {
				await deleteStoryboardProject(env.STORYBOARD_DB, projectId);
				return {
					content: [{ type: 'text', text: `프로젝트 ${projectId} 삭제 완료` }]
				};
			},
		);

		// @ts-ignore
		const handler = createMcpHandler(server);

		return handler(request, env, ctx);
	},
} satisfies ExportedHandler<Env>;

const publicHandler = {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);

		if (url.pathname.startsWith('/banana')) {
			const key = url.pathname.replace('/banana/', '');
			const object = await env.BUCKET.get(key);

			if (!object) {
				return new Response('image not found', { status: 404 });
			}
			return new Response(object.body, {
				headers: {
					'Content-Type': object.httpMetadata?.contentType ?? 'image/jpeg',
				},
			});
		}

		if (url.pathname === '/seed') {
			await seedProducts(env.DB);
			return new Response('Seeded products successfully', { status: 200 });
		}

		if (url.pathname === '/authorize') {
			if (request.method === 'GET') {
				return handleAuthorizeGet(request, env);
			}
			if (request.method === 'POST') {
				return handleAuthorizePost(request, env);
			}
		}
		return new Response(null, { status: 404 });
	},
} satisfies ExportedHandler<Env>;

export default new OAuthProvider({
	defaultHandler: publicHandler,
	apiHandler: privateHandler,
	apiRoute: ['/mcp'],
	authorizeEndpoint: '/authorize',
	clientRegistrationEndpoint: '/register',
	tokenEndpoint: '/token',
})