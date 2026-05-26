/**
 * Calls the WordPress Agent (Dolly) headlessly to pick onboarding task IDs
 * for the wizard's `(goal, features)` answers.
 *
 * Architecture: same shape Image Studio uses in production —
 *   createAgentConfig() -> createClient(config) -> client.sendMessage()
 *   -> parse JSON out of the model's text response.
 *
 * The LLM is constrained by a system prompt that lists the canonical task
 * registry inline and demands JSON-only output. Hallucinated IDs (anything
 * not in the registry) are silently dropped.
 *
 * For demo / design-state testing without hitting Dolly, the URL parameter
 * `?mock=slow|empty|error` bypasses the real call:
 *   - `slow`  -> resolves after 20s (forces the 13s caller-side timeout)
 *   - `empty` -> returns `{ task_ids: [] }` after a short delay
 *   - `error` -> throws after a short delay
 *   - default (no param) -> real Dolly call
 */
import { createAgentConfig } from '@automattic/agents-manager/src/utils/create-agent-config';
import { createClient, createTextMessage } from '@automattic/agenttic-client';
import { selectTasks } from './select-tasks';
import { TASK_REGISTRY } from './task-registry';
import type { FirstPostDraft } from './draft-first-post';
import type { SiteState } from './task-registry';
import type { FeatureKey, GoalKey } from './types';

export type TailorLaunchpadInput = {
	goal: GoalKey;
	features: FeatureKey[];
};

export type TailorLaunchpadOutput = {
	task_ids: string[];
};

/**
 * Free-text variant — used by the prompt entry. The LLM both infers
 * structured context (goal/niche/brand/vibe) and picks task IDs in a
 * single call. The `inferred` blob is optional in the response shape but
 * almost always populated by Dolly.
 */
export type InferredContext = {
	goal?: string;
	brand_name?: string;
	niche?: string;
	vibe?: string;
	audience?: string;
	tagline?: string;
};

export type TailorLaunchpadFromIntentInput = {
	intent: string;
};

export type TailorLaunchpadFromIntentOutput = {
	task_ids: string[];
	inferred: InferredContext;
};

/**
 * Combined output: task_ids + inferred context + a starter blog post draft,
 * all from a single Dolly call. Used by the prompt path so the user pays
 * only one round-trip / agent setup instead of two.
 */
export type TailorAndDraftFromIntentOutput = {
	task_ids: string[];
	inferred: InferredContext;
	first_post_draft: FirstPostDraft;
};

// Mock-path latency. Kept short on purpose — the loading state should
// never feel artificially slow. `?mock=slow` is the explicit timeout test.
const MIN_LATENCY_MS = 200;
const MAX_LATENCY_MS = 1_500;
const SLOW_LATENCY_MS = 20_000;

type MockOverride = 'slow' | 'empty' | 'error' | null;

function readMockOverride(): MockOverride {
	if ( typeof window === 'undefined' ) {
		return null;
	}
	const value = new URLSearchParams( window.location.search ).get( 'mock' );
	if ( value === 'slow' || value === 'empty' || value === 'error' ) {
		return value;
	}
	return null;
}

function delay( ms: number ): Promise< void > {
	return new Promise( ( resolve ) => setTimeout( resolve, ms ) );
}

function buildMenu(): string {
	// IDs only — titles are redundant. Most IDs are self-descriptive
	// (`publish-first-post`, `discover-yoast-seo`) and the prompt's STEP
	// rules already map concepts → IDs explicitly. Halves menu size and
	// noticeably shortens Dolly's generation phase.
	return TASK_REGISTRY.map( ( t ) => `- ${ t.id }` ).join( '\n' );
}

function buildPrompt( goal: GoalKey, features: FeatureKey[] ): string {
	const menu = buildMenu();

	return `You are picking onboarding tasks for a brand-new WordPress.com site.

Pick 5-7 task IDs from the menu below that best match the user's goal and selected features. Cover a mix of categories where it fits: activation (publish-first-post, design-homepage, etc.), feature-setup (matching their selected features), and discovery (recommended plugins). Always include "launch-site" as the final item.

Return ONLY valid JSON. No prose, no markdown fences, no explanation. The first character of your response MUST be "{".

Schema: {"task_ids": ["id1", "id2", ...]}

Menu:
${ menu }

User goal: ${ goal }
User features: ${ features.length ? features.join( ', ' ) : 'none' }

Return the JSON now.`;
}

/**
 * LLMs sometimes wrap JSON in ```json``` fences or preface it with prose.
 * Try direct parse first, then extract from a fenced block, then grab the
 * first {...} run.
 */
function extractJson( text: string ): unknown {
	try {
		return JSON.parse( text );
	} catch {
		// fall through
	}

	const patterns = [ /```(?:json)?\s*([\s\S]*?)```/, /(\{[\s\S]*\})/ ];
	for ( const pattern of patterns ) {
		const match = text.match( pattern );
		if ( match?.[ 1 ] ) {
			try {
				return JSON.parse( match[ 1 ].trim() );
			} catch {
				continue;
			}
		}
	}
	return null;
}

function isValidResponse( parsed: unknown ): parsed is { task_ids: string[] } {
	if ( ! parsed || typeof parsed !== 'object' ) {
		return false;
	}
	const ids = ( parsed as { task_ids?: unknown } ).task_ids;
	return Array.isArray( ids ) && ids.every( ( id ) => typeof id === 'string' );
}

function isValidFromIntentResponse(
	parsed: unknown
): parsed is { task_ids: string[]; inferred?: Record< string, unknown > } {
	if ( ! isValidResponse( parsed ) ) {
		return false;
	}
	const inferred = ( parsed as { inferred?: unknown } ).inferred;
	if ( inferred === undefined || inferred === null ) {
		return true;
	}
	return typeof inferred === 'object' && ! Array.isArray( inferred );
}

function coerceInferred( raw: Record< string, unknown > | undefined ): InferredContext {
	if ( ! raw ) {
		return {};
	}
	const out: InferredContext = {};
	for ( const key of [ 'goal', 'brand_name', 'niche', 'vibe', 'audience', 'tagline' ] as const ) {
		const value = raw[ key ];
		if ( typeof value === 'string' && value.trim().length > 0 ) {
			out[ key ] = value.trim();
		}
	}
	return out;
}

function buildPromptFromIntent( intent: string ): string {
	const menu = buildMenu();

	return `You are helping a new WordPress.com user onboard. They've described their site idea in their own words. Pick a tailored task list AND extract inferred context.

Rules for the task list:
- Pick exactly 6 task IDs from the menu below — no more, no less. The IDs MUST come from the menu. Do not invent IDs.
- Build the list in this order:

  STEP 1 — Pick exactly ONE "first creation" task based on the FORMAT the user described, NOT the topic. The topic (photography, cooking, etc.) doesn't determine this; the format (blog, portfolio, newsletter, store) does.
    - "blog" / "posts" / "articles" / "writing" → "publish-first-post"
    - "portfolio" / "showcase of work" / "case studies" → "add-portfolio-piece"
    - "newsletter" / "email subscribers" / "weekly emails" → "send-first-newsletter"
    - "store" / "selling products" / "shop" → "add-first-product"
    - If none of these formats are explicitly mentioned, default to "publish-first-post".

  STEP 2 — Pick 2-3 topic-specific tasks that match their niche or any mentioned features:
    - photography topic → "setup-gallery", "discover-videopress"
    - selling / store features → "setup-store", "discover-woocommerce"
    - newsletter features → "setup-newsletter-feature"
    - bookings / appointments → "setup-bookings"
    - donations / nonprofit → "setup-donations"
    - memberships / paid access → "setup-memberships"
    - contact forms → "setup-forms", "discover-jetpack-forms"

  STEP 3 — Round out with universal foundation tasks until you have 5: "design-homepage", "pick-fonts-colors", "connect-social-accounts", "discover-yoast-seo". Pick whichever fits the user's description best.

  STEP 4 — The 6th and final ID MUST be "launch-site".

For inferred context, extract what's mentioned:
- "goal": kind of site (e.g. "photography blog", "online store") — required
- "brand_name": only if they named their site/brand
- "niche": subject area (e.g. "photography", "indie games") — required if topic is implied
- "vibe": aesthetic if mentioned (e.g. "minimal", "Japan-inspired")
- "audience": only if implied

Return ONLY JSON. First character MUST be "{". No prose, no markdown.

Schema: {"task_ids": [...], "inferred": {...}}

Menu:
${ menu }

User's description:
"${ intent.replace( /"/g, '\\"' ) }"

Return the JSON now.`;
}

async function tailorViaMock(
	{ goal, features }: TailorLaunchpadInput,
	site: SiteState,
	override: Exclude< MockOverride, null >
): Promise< TailorLaunchpadOutput > {
	if ( override === 'error' ) {
		await delay( 1_500 );
		throw new Error( 'tailorLaunchpad: simulated error (mock=error)' );
	}
	if ( override === 'slow' ) {
		await delay( SLOW_LATENCY_MS );
	} else {
		await delay( MIN_LATENCY_MS + Math.random() * ( MAX_LATENCY_MS - MIN_LATENCY_MS ) );
	}
	if ( override === 'empty' ) {
		return { task_ids: [] };
	}
	const tasks = selectTasks( goal, features, site );
	return { task_ids: tasks.map( ( t ) => t.id ) };
}

async function tailorViaDolly(
	{ goal, features }: TailorLaunchpadInput,
	siteId: number | undefined,
	abortSignal: AbortSignal | undefined
): Promise< TailorLaunchpadOutput > {
	const sessionId =
		typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
			? crypto.randomUUID()
			: `tailor-${ Date.now() }-${ Math.random().toString( 36 ).slice( 2 ) }`;

	const prompt = buildPrompt( goal, features );
	const startedAt = performance.now();

	const config = await createAgentConfig( {
		sessionId,
		siteId,
		environment: 'calypso',
		agentId: 'dolly',
	} );
	const client = createClient( config );

	const response = await client.sendMessage( {
		message: createTextMessage( prompt ),
		abortSignal,
	} );

	const elapsedMs = Math.round( performance.now() - startedAt );

	const parsed = extractJson( response.text );
	if ( ! isValidResponse( parsed ) ) {
		// eslint-disable-next-line no-console
		console.warn(
			`[Launchpad] tailor_launchpad: unparseable response in ${ elapsedMs }ms\n` +
				`prompt size: ${ prompt.length } chars\n` +
				'raw response:',
			response.text
		);
		throw new Error( 'tailorLaunchpad: unparseable response from Dolly' );
	}

	const known = new Set( TASK_REGISTRY.map( ( t ) => t.id ) );
	const accepted = parsed.task_ids.filter( ( id ) => known.has( id ) );
	const dropped = parsed.task_ids.filter( ( id ) => ! known.has( id ) );

	// eslint-disable-next-line no-console
	console.log(
		`[Launchpad] tailor_launchpad: ${ elapsedMs }ms · prompt ${ prompt.length } chars · ` +
			`returned ${ parsed.task_ids.length } IDs (${ accepted.length } accepted, ` +
			`${ dropped.length } dropped as unknown)`,
		{ goal, features, accepted, dropped, raw: response.text }
	);

	return { task_ids: accepted };
}

/**
 * Site state is passed in for the mock path (which calls `selectTasks`
 * deterministically). The real Dolly path doesn't use it — site-state
 * filters (`hideWhen`, completion) are applied at render time in the
 * widget, regardless of which path produced the IDs.
 */
export async function tailorLaunchpad(
	input: TailorLaunchpadInput,
	site: SiteState,
	options?: { siteId?: number; abortSignal?: AbortSignal }
): Promise< TailorLaunchpadOutput > {
	const override = readMockOverride();
	if ( override ) {
		return tailorViaMock( input, site, override );
	}
	return tailorViaDolly( input, options?.siteId, options?.abortSignal );
}

async function tailorFromIntentViaMock(
	override: Exclude< MockOverride, null >
): Promise< TailorLaunchpadFromIntentOutput > {
	if ( override === 'error' ) {
		await delay( 1_500 );
		throw new Error( 'tailorLaunchpadFromIntent: simulated error (mock=error)' );
	}
	if ( override === 'slow' ) {
		await delay( SLOW_LATENCY_MS );
	} else {
		await delay( MIN_LATENCY_MS + Math.random() * ( MAX_LATENCY_MS - MIN_LATENCY_MS ) );
	}
	if ( override === 'empty' ) {
		return { task_ids: [], inferred: {} };
	}
	// Pick a sensible default for the design-state mock — write goal, no
	// features. Keeps the demo interesting without needing real input.
	const tasks = selectTasks( 'write', [], {
		siteSlug: 'mock',
		postCount: 0,
		pageCount: 0,
		subscriberCount: 0,
		hasCustomDomain: false,
		isLaunched: false,
		hasProduct: false,
		installedPluginSlugs: [],
	} );
	return {
		task_ids: tasks.map( ( t ) => t.id ),
		inferred: {
			goal: 'personal blog',
			niche: 'general',
			vibe: 'minimal',
			tagline: 'Notes from a personal blog',
		},
	};
}

async function tailorFromIntentViaDolly(
	{ intent }: TailorLaunchpadFromIntentInput,
	siteId: number | undefined,
	abortSignal: AbortSignal | undefined
): Promise< TailorLaunchpadFromIntentOutput > {
	const sessionId =
		typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
			? crypto.randomUUID()
			: `tailor-intent-${ Date.now() }-${ Math.random().toString( 36 ).slice( 2 ) }`;

	const prompt = buildPromptFromIntent( intent );
	const startedAt = performance.now();

	const config = await createAgentConfig( {
		sessionId,
		siteId,
		environment: 'calypso',
		agentId: 'dolly',
	} );
	const client = createClient( config );

	const response = await client.sendMessage( {
		message: createTextMessage( prompt ),
		abortSignal,
	} );

	const elapsedMs = Math.round( performance.now() - startedAt );
	const parsed = extractJson( response.text );

	if ( ! isValidFromIntentResponse( parsed ) ) {
		// eslint-disable-next-line no-console
		console.warn(
			`[Launchpad] tailor_from_intent: unparseable response in ${ elapsedMs }ms\n` +
				`prompt size: ${ prompt.length } chars\n` +
				'raw response:',
			response.text
		);
		throw new Error( 'tailorLaunchpadFromIntent: unparseable response from Dolly' );
	}

	const known = new Set( TASK_REGISTRY.map( ( t ) => t.id ) );
	const accepted = parsed.task_ids.filter( ( id ) => known.has( id ) );
	const dropped = parsed.task_ids.filter( ( id ) => ! known.has( id ) );
	const inferred = coerceInferred( parsed.inferred );

	// eslint-disable-next-line no-console
	console.log(
		`[Launchpad] tailor_from_intent: ${ elapsedMs }ms · prompt ${ prompt.length } chars · ` +
			`returned ${ parsed.task_ids.length } IDs (${ accepted.length } accepted, ` +
			`${ dropped.length } dropped) · inferred:`,
		inferred,
		{ intent, accepted, dropped, raw: response.text }
	);

	return { task_ids: accepted, inferred };
}

export async function tailorLaunchpadFromIntent(
	input: TailorLaunchpadFromIntentInput,
	options?: { siteId?: number; abortSignal?: AbortSignal }
): Promise< TailorLaunchpadFromIntentOutput > {
	const override = readMockOverride();
	if ( override ) {
		return tailorFromIntentViaMock( override );
	}
	return tailorFromIntentViaDolly( input, options?.siteId, options?.abortSignal );
}

// -----------------------------------------------------------------------------
// Combined call (Phase B): ask Dolly for tailored task IDs, inferred context,
// and a starter post draft in a single round-trip. Saves the per-call setup
// overhead (auth, agent session init, LLM warmup) we'd otherwise pay twice.
// -----------------------------------------------------------------------------

function buildCombinedPromptFromIntent( intent: string ): string {
	const menu = buildMenu();

	return `You are helping a new WordPress.com user onboard. They've described their site idea in their own words. Produce THREE things in a single JSON response: a tailored task list, an inferred-context blob, and a starter blog post draft.

============ task_ids ============
- Pick exactly 6 task IDs from the menu — no more, no less. IDs MUST come from the menu (no inventing).
- Build the list in this order:
  STEP 1 — Pick exactly ONE "first creation" task based on the FORMAT the user described, NOT the topic:
    - "blog" / "posts" / "articles" / "writing" → "publish-first-post"
    - "portfolio" / "showcase of work" / "case studies" → "add-portfolio-piece"
    - "newsletter" / "email subscribers" / "weekly emails" → "send-first-newsletter"
    - "store" / "selling products" / "shop" → "add-first-product"
    - If no format is mentioned, default to "publish-first-post".
  STEP 2 — Pick 2-3 topic-specific tasks matching their niche / features:
    - photography (stills, photos, photo gallery) → "setup-gallery"
    - video / vlog / podcast / film → "discover-videopress"
    - selling / store → "setup-store", "discover-woocommerce"
    - newsletter features → "setup-newsletter-feature"
    - bookings / appointments → "setup-bookings"
    - donations / nonprofit → "setup-donations"
    - memberships / paid access → "setup-memberships"
    - contact forms → "setup-forms", "discover-jetpack-forms"
    - writing-heavy / SEO concerns → "discover-yoast-seo"

  HARD RULES (do not break):
    - NEVER include "discover-videopress" UNLESS the user explicitly mentions video, vlog, podcast, film, reels, or moving images. Photography and photos are NOT video — for photography, use "setup-gallery" instead.
    - NEVER include "setup-store", "discover-woocommerce", or "add-first-product" UNLESS the user explicitly mentions selling, products, store, shop, or commerce.
    - NEVER include "setup-bookings" UNLESS the user mentions bookings, appointments, scheduling, or classes.
    - NEVER include "setup-memberships" or "setup-donations" UNLESS the user explicitly mentions paid access, memberships, or donations/fundraising.
  STEP 3 — Round out with universal foundation tasks until you have 5. Always include "pick-theme" (the visual identity is the highest-leverage activation step — it determines how everything else looks). Then fill remaining slots from: "design-homepage", "pick-fonts-colors", "connect-social-accounts", "discover-yoast-seo".
  STEP 4 — The 6th and final ID MUST be "launch-site".

============ inferred ============
Extract these fields from the user's description. Used downstream by on-demand calls (theme recommendations, page drafts) so they can riff on the same vibe without re-asking the user.
- "goal": kind of site in 2-4 words (e.g. "photography blog", "online ceramics shop"). Required.
- "brand_name": only if they named their site/brand (otherwise omit).
- "niche": subject area (e.g. "photography", "indie games", "vegan baking"). Required if topic is implied.
- "vibe": aesthetic hint if mentioned or strongly implied (e.g. "minimal Japan-inspired", "warm and editorial", "bold and modern"). Omit if neutral.
- "audience": who the site is for, if implied (e.g. "fellow photographers", "small-batch buyers").
- "tagline": a polished site tagline drafted from the user's description. Max 80 characters. Third-person or noun phrase — NOT first-person ("I", "my", "we"). NOT a sentence about the user's intent ("I want to…"). Examples: "Photography from the road", "Handmade silver jewelry, made in Lisbon", "A reading life, one book at a time". Required.

============ first_post_draft ============
Write a friendly starter blog post the user can edit and publish:
- "title": clear, evocative, max 8 words. Can riff on their brand if mentioned.
- "subtitle": ONE-LINE, verb-led description of what publishing this post does for them. This is shown as a row hint in the dashboard. Examples: "Introduce Kaonashi to your readers", "Share why you started this journey", "Welcome readers to your first chapter." Mention brand or niche if it fits. Max 10 words. NOT a tagline for the post.
- "paragraphs": two short paragraphs of opening body text. First: introduce the topic in a warm, personal voice. Second: invite the reader in. Leave room for the user to expand. Friendly, plain English, no jargon. Avoid "Welcome to my blog" / "Hello world."

============ name resolution ============
If the user's description contains a line "Site name: X", treat X as THE
ONLY brand/name to use anywhere — in the title, subtitle, paragraphs, and
the inferred.brand_name field. X overrides EVERYTHING else, including:
- ambient context (URL slug, blog title, wpcom site record), AND
- names the user mentions in their own description text (e.g. if the
  description says "...called Mira Studio" but the "Site name:" line says
  "Grogu", you MUST use "Grogu" and ignore "Mira Studio" entirely).
Treat the "Site name:" line as the user explicitly correcting any other
name. Do NOT use the in-text name even as a secondary reference.

If no "Site name:" line is present, fall back to a name only if the user
mentions one in their own words; otherwise omit the brand and write
generically.

============ format ============
Return ONE valid JSON object. No prose, no markdown fences. First character MUST be "{".

Schema: {
  "task_ids": [...],
  "inferred": {"goal": "...", "brand_name": "...", "niche": "...", "vibe": "...", "audience": "...", "tagline": "..."},
  "first_post_draft": {"title": "...", "subtitle": "...", "paragraphs": ["...", "..."]}
}

Menu:
${ menu }

User's description:
"${ intent.replace( /"/g, '\\"' ) }"

Return the JSON now.`;
}

function isValidCombinedResponse( parsed: unknown ): parsed is {
	task_ids: string[];
	inferred?: Record< string, unknown >;
	first_post_draft: { title: string; subtitle?: string; paragraphs: string[] };
} {
	if ( ! isValidFromIntentResponse( parsed ) ) {
		return false;
	}
	const draft = ( parsed as { first_post_draft?: unknown } ).first_post_draft;
	if ( ! draft || typeof draft !== 'object' ) {
		return false;
	}
	const d = draft as { title?: unknown; subtitle?: unknown; paragraphs?: unknown };
	if ( typeof d.title !== 'string' || ! d.title.trim() ) {
		return false;
	}
	if ( ! Array.isArray( d.paragraphs ) || d.paragraphs.length === 0 ) {
		return false;
	}
	if ( ! d.paragraphs.every( ( p ) => typeof p === 'string' && p.trim().length > 0 ) ) {
		return false;
	}
	if ( d.subtitle !== undefined && typeof d.subtitle !== 'string' ) {
		return false;
	}
	return true;
}

async function tailorAndDraftViaMock(
	override: Exclude< MockOverride, null >
): Promise< TailorAndDraftFromIntentOutput > {
	if ( override === 'error' ) {
		await delay( 1_500 );
		throw new Error( 'tailorAndDraftFromIntent: simulated error (mock=error)' );
	}
	if ( override === 'slow' ) {
		await delay( SLOW_LATENCY_MS );
	} else {
		await delay( MIN_LATENCY_MS + Math.random() * ( MAX_LATENCY_MS - MIN_LATENCY_MS ) );
	}
	if ( override === 'empty' ) {
		return {
			task_ids: [],
			inferred: {},
			first_post_draft: { title: 'Hello world', paragraphs: [ 'First post.' ] },
		};
	}
	const tasks = selectTasks( 'write', [], {
		siteSlug: 'mock',
		postCount: 0,
		pageCount: 0,
		subscriberCount: 0,
		hasCustomDomain: false,
		isLaunched: false,
		hasProduct: false,
		installedPluginSlugs: [],
	} );
	return {
		task_ids: tasks.map( ( t ) => t.id ),
		inferred: {
			goal: 'personal blog',
			niche: 'general',
			vibe: 'minimal',
			tagline: 'Notes from a personal blog',
		},
		first_post_draft: {
			title: 'Why I started this',
			subtitle: 'Introduce yourself and your project',
			paragraphs: [
				"This is the first post on a brand-new corner of the internet that's mine.",
				"If you're reading this, thanks for being here at the very start.",
			],
		},
	};
}

// Pull `task_ids` out of a partially-streamed JSON response as soon as the
// array's closing `]` arrives. Dolly is instructed to emit `task_ids` first,
// so this typically resolves long before the full draft is generated — giving
// us an early-paint signal for the Launchpad.
function tryExtractTaskIds( text: string ): string[] | null {
	const match = text.match( /"task_ids"\s*:\s*\[([^\]]*)\]/ );
	if ( ! match ) {
		return null;
	}
	try {
		const parsed = JSON.parse( `[${ match[ 1 ] }]` );
		if ( Array.isArray( parsed ) && parsed.every( ( id ) => typeof id === 'string' ) ) {
			return parsed;
		}
	} catch {
		// Array body is still mid-token (e.g. unterminated string). Wait.
	}
	return null;
}

async function tailorAndDraftViaDolly(
	{ intent }: TailorLaunchpadFromIntentInput,
	siteId: number | undefined,
	abortSignal: AbortSignal | undefined,
	onPartialTaskIds: ( ( ids: string[] ) => void ) | undefined
): Promise< TailorAndDraftFromIntentOutput > {
	const sessionId =
		typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
			? crypto.randomUUID()
			: `tailor-and-draft-${ Date.now() }-${ Math.random().toString( 36 ).slice( 2 ) }`;

	const prompt = buildCombinedPromptFromIntent( intent );
	const startedAt = performance.now();

	const config = await createAgentConfig( {
		sessionId,
		siteId,
		environment: 'calypso',
		agentId: 'dolly',
	} );
	const client = createClient( config );
	const known = new Set( TASK_REGISTRY.map( ( t ) => t.id ) );

	let accumulatedText = '';
	let firedPartial = false;
	let firstPaintMs: number | undefined;
	let firstTickMs: number | undefined;
	let updateCount = 0;

	try {
		for await ( const update of client.sendMessageStream( {
			message: createTextMessage( prompt ),
			abortSignal,
			enableStreaming: true,
		} ) ) {
			updateCount += 1;
			if ( firstTickMs === undefined ) {
				firstTickMs = Math.round( performance.now() - startedAt );
			}
			// `update.text` carries the cumulative assembled assistant text in
			// this SDK; replace rather than append so we don't double-count.
			if ( typeof update.text === 'string' && update.text.length > accumulatedText.length ) {
				accumulatedText = update.text;
			}

			if ( ! firedPartial && onPartialTaskIds ) {
				const ids = tryExtractTaskIds( accumulatedText );
				if ( ids ) {
					const accepted = ids.filter( ( id ) => known.has( id ) );
					firstPaintMs = Math.round( performance.now() - startedAt );
					onPartialTaskIds( accepted );
					firedPartial = true;
				}
			}

			if ( update.final ) {
				break;
			}
		}
	} catch ( error ) {
		const elapsedMs = Math.round( performance.now() - startedAt );
		// eslint-disable-next-line no-console
		console.warn(
			`[Launchpad] tailor_and_draft: aborted/failed after ${ elapsedMs }ms · prompt ${ prompt.length } chars`,
			error
		);
		throw error;
	}

	const elapsedMs = Math.round( performance.now() - startedAt );
	const parsed = extractJson( accumulatedText );

	if ( ! isValidCombinedResponse( parsed ) ) {
		// eslint-disable-next-line no-console
		console.warn(
			`[Launchpad] tailor_and_draft: unparseable response in ${ elapsedMs }ms\n` +
				`prompt size: ${ prompt.length } chars\n` +
				'raw response:',
			accumulatedText
		);
		throw new Error( 'tailorAndDraftFromIntent: unparseable response from Dolly' );
	}

	const accepted = parsed.task_ids.filter( ( id ) => known.has( id ) );
	const dropped = parsed.task_ids.filter( ( id ) => ! known.has( id ) );
	const inferred = coerceInferred( parsed.inferred );

	// eslint-disable-next-line no-console
	console.log(
		`[Launchpad] tailor_and_draft: ${ elapsedMs }ms total · ` +
			`first tick @ ${ firstTickMs ?? 'n/a' }ms · ${ updateCount } ticks · ` +
			`first paint @ ${ firstPaintMs ?? 'n/a' }ms · prompt ${ prompt.length } chars · ` +
			`returned ${ parsed.task_ids.length } IDs (${ accepted.length } accepted, ` +
			`${ dropped.length } dropped) · draft title="${ parsed.first_post_draft.title }" · ` +
			`subtitle="${ parsed.first_post_draft.subtitle ?? '(none)' }"`,
		{ intent, accepted, dropped, draft: parsed.first_post_draft, inferred, raw: accumulatedText }
	);

	return {
		task_ids: accepted,
		inferred,
		first_post_draft: parsed.first_post_draft,
	};
}

// Pre-fetch cache. The wizard's Step 2 debounces textarea changes and calls
// `prewarmTailorAndDraft` to fire the Dolly call early — by the time the user
// hits Continue, the agent has often already finished its 30s of pre-work.
// On Continue, `tailorAndDraftFromIntent` consumes the cached promise instead
// of starting a new call. Same-intent re-prewarm is a no-op; changed-intent
// aborts the previous call and starts a new one.
let pendingPrewarm: {
	intent: string;
	promise: Promise< TailorAndDraftFromIntentOutput >;
	controller: AbortController;
	startedAt: number;
} | null = null;

export function prewarmTailorAndDraft( intent: string, options?: { siteId?: number } ): void {
	const trimmed = intent.trim();
	if ( ! trimmed ) {
		return;
	}
	if ( pendingPrewarm && pendingPrewarm.intent === trimmed ) {
		// eslint-disable-next-line no-console
		console.log( '[Launchpad] prewarm: already in flight (same intent), keeping it' );
		return;
	}
	if ( pendingPrewarm ) {
		// eslint-disable-next-line no-console
		console.log( '[Launchpad] prewarm: intent changed, aborting previous and starting new' );
		pendingPrewarm.controller.abort();
		pendingPrewarm = null;
	}
	if ( readMockOverride() ) {
		return;
	}
	const controller = new AbortController();
	setTimeout( () => controller.abort(), 40_000 );
	// eslint-disable-next-line no-console
	console.log( `[Launchpad] prewarm: starting (intent length=${ trimmed.length })` );
	const promise = tailorAndDraftViaDolly(
		{ intent: trimmed },
		options?.siteId,
		controller.signal,
		undefined
	);
	pendingPrewarm = { intent: trimmed, promise, controller, startedAt: performance.now() };
}

export async function tailorAndDraftFromIntent(
	input: TailorLaunchpadFromIntentInput,
	options?: {
		siteId?: number;
		abortSignal?: AbortSignal;
		onPartialTaskIds?: ( ids: string[] ) => void;
	}
): Promise< TailorAndDraftFromIntentOutput > {
	const override = readMockOverride();
	if ( override ) {
		return tailorAndDraftViaMock( override );
	}
	const trimmed = input.intent.trim();
	if ( pendingPrewarm && pendingPrewarm.intent === trimmed ) {
		// Pre-fetch hit. The prewarm's stream was started without an
		// onPartialTaskIds callback, so we fire any caller-supplied callback
		// synchronously off the resolved value — this lets the dashboard
		// paint task_ids the instant the cached promise settles.
		const cached = pendingPrewarm;
		pendingPrewarm = null;
		const continueClickedAt = performance.now();
		const prewarmHeadStart = Math.round( continueClickedAt - cached.startedAt );
		// eslint-disable-next-line no-console
		console.log(
			`[Launchpad] tailor_and_draft: cache hit · prewarm head-start ${ prewarmHeadStart }ms`
		);
		return cached.promise.then( ( result ) => {
			const perceivedWaitMs = Math.round( performance.now() - continueClickedAt );
			// eslint-disable-next-line no-console
			console.log(
				`[Launchpad] tailor_and_draft: cache resolved · perceived wait ${ perceivedWaitMs }ms`
			);
			options?.onPartialTaskIds?.( result.task_ids );
			return result;
		} );
	}
	if ( pendingPrewarm ) {
		pendingPrewarm.controller.abort();
		pendingPrewarm = null;
	}
	return tailorAndDraftViaDolly(
		input,
		options?.siteId,
		options?.abortSignal,
		options?.onPartialTaskIds
	);
}
