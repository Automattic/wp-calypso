/**
 * Asks Dolly to draft the user's first blog post based on their wizard
 * answers (goal + features).
 *
 * Used by the "Write your first post" task in the tailored Launchpad: when
 * the wizard finishes we kick this off in parallel with `tailorLaunchpad`,
 * cache the result in a preference, and on click we turn the draft into a
 * real wpcom post and route the user to its editor — landing on a starter
 * draft instead of a blank page.
 *
 * Same `?mock=*` overrides as `tailor-launchpad.ts` for design-state
 * testing without hitting Dolly.
 */
import { createAgentConfig } from '@automattic/agents-manager/src/utils/create-agent-config';
import { createClient, createTextMessage } from '@automattic/agenttic-client';
import type { FeatureKey, GoalKey } from './types';

/**
 * The wizard path passes structured `goal + features`. The prompt path
 * passes the user's free-text `intent`. Either is sufficient to draft a
 * starter post — both paths are supported.
 */
export type DraftFirstPostInput = {
	goal?: GoalKey;
	features?: FeatureKey[];
	intent?: string;
};

export type FirstPostDraft = {
	title: string;
	/**
	 * One-line, verb-led description of what publishing this post does for
	 * the user — surfaced as the Launchpad row's subtitle. Optional so old
	 * cached drafts still validate; new drafts always include one.
	 *
	 * Examples: "Introduce Kaonashi to your readers", "Share why you're
	 * writing about meditation", "Welcome readers to your first chapter."
	 */
	subtitle?: string;
	paragraphs: string[];
};

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

function buildPrompt( input: DraftFirstPostInput ): string {
	const intro = `You are drafting the user's very first blog post on a brand-new WordPress.com site. They might be writing publicly for the first time and may feel anxious about it. Write a friendly starting point — not a finished article — that they can read, edit, and make their own.

Write three things:
1. A clear, evocative TITLE (max 8 words). If the user mentioned a brand or site name, the title can riff on it.
2. A SUBTITLE — a one-line, verb-led description of what publishing this post does for the user. This will appear in the dashboard as a hint for what clicking the task does. Examples: "Introduce Kaonashi to your readers", "Share why you're writing about meditation", "Welcome readers to your first chapter." Mention their brand or niche if it fits. Max 10 words. NOT a tagline or sub-heading for the post itself — it's about the *act* of publishing.
3. Two short PARAGRAPHS of opening body text. First paragraph: introduce the topic in a warm, personal voice. Second paragraph: invite the reader in, or set up what's coming next. Leave room for the user to expand with their own specifics.

Tone: Friendly, accessible, plain English. No buzzwords. No jargon. Avoid generic openers like "Welcome to my blog" or "Hello world." Write as if you're helping a real person who is nervous about publishing for the first time.`;

	const constraint = `Return ONLY valid JSON. No prose before or after. No markdown fences. The first character of your response MUST be "{".

Schema: {"title": "string", "subtitle": "string", "paragraphs": ["string", "string"]}`;

	// Prompt path — use the user's own framing.
	if ( input.intent && input.intent.trim().length > 0 ) {
		return `${ intro }

${ constraint }

The user described their site idea in their own words. Draft a first post that fits THIS specific topic, brand, and tone. Use details they mentioned where it makes sense.

User's description:
"${ input.intent.replace( /"/g, '\\"' ) }"

Return the JSON now.`;
	}

	// Wizard path — fall back to structured goal/features.
	const goal = input.goal ?? 'build';
	const features = input.features ?? [];
	return `${ intro }

${ constraint }

User goal: ${ goal }
User features: ${ features.length ? features.join( ', ' ) : 'none' }

Return the JSON now.`;
}

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

function isValidDraft( parsed: unknown ): parsed is FirstPostDraft {
	if ( ! parsed || typeof parsed !== 'object' ) {
		return false;
	}
	const obj = parsed as { title?: unknown; subtitle?: unknown; paragraphs?: unknown };
	if ( typeof obj.title !== 'string' || ! obj.title.trim() ) {
		return false;
	}
	if ( ! Array.isArray( obj.paragraphs ) || obj.paragraphs.length === 0 ) {
		return false;
	}
	if ( ! obj.paragraphs.every( ( p ) => typeof p === 'string' && p.trim().length > 0 ) ) {
		return false;
	}
	// `subtitle` is optional — older cached drafts don't have it, and Dolly
	// occasionally drops it. Reject only if it's present but the wrong type.
	if ( obj.subtitle !== undefined && typeof obj.subtitle !== 'string' ) {
		return false;
	}
	return true;
}

const MOCK_DRAFT: FirstPostDraft = {
	title: 'Why I started this',
	subtitle: 'Introduce yourself and your project',
	paragraphs: [
		"This is the first post on a brand-new corner of the internet that's mine. I've been thinking about doing this for a while — putting some of what's been on my mind into words I can share, instead of keeping it in my head.",
		"If you're reading this, thanks for being here at the very start. I'll be writing about the things I'm working on and the questions I'm chewing on. Some of it will be polished, some of it won't. That feels right.",
	],
};

async function draftViaMock( override: Exclude< MockOverride, null > ): Promise< FirstPostDraft > {
	if ( override === 'error' ) {
		await delay( 1_500 );
		throw new Error( 'draftFirstPost: simulated error (mock=error)' );
	}
	if ( override === 'slow' ) {
		await delay( SLOW_LATENCY_MS );
	} else {
		await delay( MIN_LATENCY_MS + Math.random() * ( MAX_LATENCY_MS - MIN_LATENCY_MS ) );
	}
	if ( override === 'empty' ) {
		throw new Error( 'draftFirstPost: simulated empty (mock=empty)' );
	}
	return MOCK_DRAFT;
}

async function draftViaDolly(
	input: DraftFirstPostInput,
	siteId: number | undefined,
	abortSignal: AbortSignal | undefined
): Promise< FirstPostDraft > {
	const sessionId =
		typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
			? crypto.randomUUID()
			: `draft-${ Date.now() }-${ Math.random().toString( 36 ).slice( 2 ) }`;

	const prompt = buildPrompt( input );
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

	if ( ! isValidDraft( parsed ) ) {
		// eslint-disable-next-line no-console
		console.warn(
			`[Launchpad] draft_first_post: unparseable response in ${ elapsedMs }ms\n` +
				`prompt size: ${ prompt.length } chars\n` +
				'raw response:',
			response.text
		);
		throw new Error( 'draftFirstPost: unparseable response from Dolly' );
	}

	// eslint-disable-next-line no-console
	console.log(
		`[Launchpad] draft_first_post: ${ elapsedMs }ms · prompt ${ prompt.length } chars · ` +
			`title="${ parsed.title }" · subtitle="${ parsed.subtitle ?? '(none)' }" · ` +
			`${ parsed.paragraphs.length } paragraphs`,
		{ input, draft: parsed, raw: response.text }
	);

	return parsed;
}

export async function draftFirstPost(
	input: DraftFirstPostInput,
	options?: { siteId?: number; abortSignal?: AbortSignal }
): Promise< FirstPostDraft > {
	const override = readMockOverride();
	if ( override ) {
		return draftViaMock( override );
	}
	return draftViaDolly( input, options?.siteId, options?.abortSignal );
}
