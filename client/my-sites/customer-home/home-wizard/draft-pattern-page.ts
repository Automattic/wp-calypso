/**
 * Builds a ready-to-edit page from a WordPress.com block pattern, with its
 * placeholder copy rewritten by Dolly to fit the user's site.
 *
 * Used by the "pattern" task kind in the tailored Launchpad (e.g. "Create
 * your first gallery"). When the wizard finishes and Dolly picks a
 * pattern-backed task, we pre-warm this in the background and cache the
 * result in the wizard-state preference; on click the cached markup is
 * turned into a real wpcom *page* and the user lands in its editor — a
 * designed, on-brand starting point instead of a blank canvas or an
 * invented query param that does nothing.
 *
 * The shape mirrors `draft-first-post.ts`: Dolly returns structured JSON we
 * map back deterministically (never raw block markup — that corrupts the
 * `<!-- wp:* -->` delimiters), and the same `?mock=*` overrides drive
 * design-state testing without hitting the network.
 *
 * Copy-only by design: image blocks are left untouched. For a gallery the
 * images are meant to be the user's own photos, and stock pattern imagery is
 * a fine placeholder for everything else — see todo #13 / #10.
 */
import { createAgentConfig } from '@automattic/agents-manager/src/utils/create-agent-config';
import { createClient, createTextMessage } from '@automattic/agenttic-client';
import wpcom from 'calypso/lib/wp';
import type { Pattern } from 'calypso/my-sites/patterns/types';

export type PatternPageContext = {
	/** PTK category slug to source the pattern from (e.g. `events`). When omitted,
	 * we skip the pattern fetch entirely and build an intro-only page (heading +
	 * lead paragraph only). Used for the gallery task — the user picks their own
	 * gallery layout from the editor's Patterns sidebar. */
	category?: string;
	/** Title for the created page (e.g. `Gallery`). */
	pageTitle: string;
	siteName?: string;
	/** Composed goal + free-text description, same string sent to tailoring. */
	intent?: string;
	/** Defaults to `en`; pre-warm can pass the user's locale later. */
	locale?: string;
	/**
	 * Prepend a Dolly-generated heading + lead paragraph. For copy-light patterns
	 * (e.g. an image-only gallery) the slot-rewrite step has nothing to work with,
	 * so this gives the page some authored, on-brand text.
	 */
	intro?: boolean;
	/**
	 * Replace the pattern's stock gallery images with Openverse photos matching
	 * the site's niche (keywords chosen by Dolly). Openverse = openly licensed,
	 * so the images are actually reusable.
	 */
	images?: boolean;
};

export type PatternPage = {
	/** Serialized block markup, ready for `savePost({ type: 'page' })`. */
	html: string;
	pageTitle: string;
};

const MIN_LATENCY_MS = 200;
const MAX_LATENCY_MS = 1_500;
const SLOW_LATENCY_MS = 20_000;

// Cap the slots we send to Dolly so the prompt stays bounded and the response
// stays parseable; any extra placeholders keep their original copy. Patterns
// with repeated rows (e.g. an events list) have many short slots, so the cap
// is generous — too low and the last row(s) render with placeholder copy while
// the rest are personalized (the "Venue Name / Toronto" tell).
const MAX_SLOTS = 24;

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

function escapeHtml( text: string ): string {
	return text.replace( /&/g, '&amp;' ).replace( /</g, '&lt;' ).replace( />/g, '&gt;' );
}

/**
 * Fetch the patterns in a PTK category and return the first usable one — has
 * markup and (preferring) can be used without an account, so we don't hand the
 * user a gated pattern. Returns `null` if the category yields nothing usable.
 */
async function fetchPattern( category: string, locale: string ): Promise< Pattern | null > {
	const patterns = ( await wpcom.req.get( `/ptk/patterns/${ locale }`, {
		categories: category,
		post_type: 'wp_block',
	} ) ) as Pattern[];

	const withMarkup = ( patterns ?? [] ).filter( ( p ) => typeof p.html === 'string' && p.html );
	if ( withMarkup.length === 0 ) {
		return null;
	}
	// Prefer freely-copyable patterns; fall back to the first with markup.
	return withMarkup.find( ( p ) => p.can_be_copied_without_account ) ?? withMarkup[ 0 ];
}

type TextSlot = {
	/** Index of the inner text within the source html. */
	start: number;
	end: number;
	/** Original (unescaped-as-found) inner text. */
	text: string;
};

// Matches the inner text of a heading or paragraph block's tag. We only treat
// a slot as rewritable when its inner text is plain (no nested `<a>`/`<strong>`
// etc.), so we never clobber inline markup like links.
const TEXT_TAG_RE = /(<(h[1-6]|p)\b[^>]*>)([\s\S]*?)(<\/\2>)/gi;

function extractSlots( html: string ): TextSlot[] {
	const slots: TextSlot[] = [];
	for ( const match of html.matchAll( TEXT_TAG_RE ) ) {
		const inner = match[ 3 ];
		if ( match.index === undefined || inner.includes( '<' ) || ! inner.trim() ) {
			continue;
		}
		const start = match.index + match[ 1 ].length;
		slots.push( { start, end: start + inner.length, text: inner } );
		if ( slots.length >= MAX_SLOTS ) {
			break;
		}
	}
	return slots;
}

/**
 * Rebuild the html, replacing each slot's inner text with its rewrite. Walks
 * slots in source order and splices by index, so duplicate placeholder strings
 * are each replaced exactly once (a global string replace would not be safe).
 */
function applyRewrites( html: string, slots: TextSlot[], rewrites: string[] ): string {
	let out = '';
	let cursor = 0;
	slots.forEach( ( slot, i ) => {
		out += html.slice( cursor, slot.start ) + escapeHtml( rewrites[ i ] );
		cursor = slot.end;
	} );
	out += html.slice( cursor );
	return out;
}

function buildPrompt( slots: TextSlot[], context: PatternPageContext ): string {
	const facts = [
		context.siteName ? `Site name: ${ context.siteName }` : '',
		context.intent ? `Site goal & description: ${ context.intent }` : '',
		`Page purpose: a "${ context.category }" page.`,
	]
		.filter( Boolean )
		.join( '\n' );

	return `You are rewriting the placeholder copy of a WordPress page so it fits one specific site. Replace each placeholder with concise, natural, on-brand copy for THIS site. Match the length and role of each placeholder (a heading stays a short heading; body text stays a sentence or two). Wherever a business or brand name belongs, use the site's name EXACTLY as given below — never invent a different name. Leave dates, times, prices, and addresses unchanged. Plain language, no buzzwords, no markdown.

${ facts }

Return ONLY a JSON array of strings — the rewritten replacements, in the SAME order and the SAME count as the input. Do not add, drop, or reorder items. The first character of your response MUST be "[".

Placeholders (JSON array):
${ JSON.stringify( slots.map( ( s ) => s.text ) ) }

Return the JSON array now.`;
}

function extractJsonArray( text: string ): unknown {
	try {
		return JSON.parse( text );
	} catch {
		// fall through
	}
	const patterns = [ /```(?:json)?\s*([\s\S]*?)```/, /(\[[\s\S]*\])/ ];
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

function isValidRewrites( parsed: unknown, expectedLength: number ): parsed is string[] {
	return (
		Array.isArray( parsed ) &&
		parsed.length === expectedLength &&
		parsed.every( ( s ) => typeof s === 'string' && s.trim().length > 0 )
	);
}

// A tiny self-contained gallery pattern for offline `?mock=*` testing — keeps
// the mock path from hitting the network at all.
const MOCK_PATTERN_HTML = `<!-- wp:heading {"textAlign":"center"} -->
<h2 class="wp-block-heading has-text-align-center">Our work</h2>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center"} -->
<p class="has-text-align-center">A selection of recent pieces.</p>
<!-- /wp:paragraph -->

<!-- wp:gallery {"columns":3,"linkTo":"none"} -->
<figure class="wp-block-gallery has-nested-images columns-3 is-cropped"></figure>
<!-- /wp:gallery -->`;

async function draftViaMock(
	override: Exclude< MockOverride, null >,
	context: PatternPageContext
): Promise< PatternPage > {
	if ( override === 'error' ) {
		await delay( 1_500 );
		throw new Error( 'draftPatternPage: simulated error (mock=error)' );
	}
	if ( override === 'slow' ) {
		await delay( SLOW_LATENCY_MS );
	} else {
		await delay( MIN_LATENCY_MS + Math.random() * ( MAX_LATENCY_MS - MIN_LATENCY_MS ) );
	}
	if ( override === 'empty' ) {
		throw new Error( 'draftPatternPage: simulated empty (mock=empty)' );
	}
	// Intro-only mock (no PTK pattern): just the prepended heading + lead, no
	// gallery block — matches what the real intro-only path produces.
	if ( ! context.category ) {
		const html = introBlocks( context.pageTitle, 'A short introduction to this page.' );
		return { html, pageTitle: context.pageTitle };
	}
	return { html: MOCK_PATTERN_HTML, pageTitle: context.pageTitle };
}

/**
 * Fetch a pattern for the category and return its raw markup as a page — no
 * Dolly. Used as the on-click fallback when the pre-warmed (rewritten) copy
 * isn't cached yet: the user still lands on a real, designed page, just with
 * the pattern's own placeholder copy. Returns `null` if no pattern is found.
 */
export async function fetchPatternPageRaw(
	context: PatternPageContext
): Promise< PatternPage | null > {
	// Intro-only path: no pattern to fetch, but we still want the click to
	// land on a real page. Return an empty body so the editor opens on the
	// titled page; the user will pick a layout from the Patterns sidebar.
	if ( ! context.category ) {
		return { html: '', pageTitle: context.pageTitle };
	}
	const locale = context.locale ?? 'en';
	const pattern = await fetchPattern( context.category, locale );
	if ( ! pattern?.html ) {
		return null;
	}
	return { html: pattern.html, pageTitle: context.pageTitle };
}

/** One Dolly round-trip. Returns the raw response text for the caller to parse. */
async function askDolly(
	prompt: string,
	siteId: number | undefined,
	abortSignal: AbortSignal | undefined
): Promise< string > {
	const sessionId =
		typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
			? crypto.randomUUID()
			: `pattern-${ Date.now() }-${ Math.random().toString( 36 ).slice( 2 ) }`;
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
	return response.text;
}

/** Rewrite the pattern's own text slots in place. Returns the original html
 * untouched when there's nothing to rewrite or the response is unparseable. */
async function rewriteSlots(
	html: string,
	patternName: string,
	context: PatternPageContext,
	siteId: number | undefined,
	abortSignal: AbortSignal | undefined
): Promise< string > {
	const slots = extractSlots( html );
	if ( slots.length === 0 ) {
		return html;
	}
	const prompt = buildPrompt( slots, context );
	const startedAt = performance.now();
	const text = await askDolly( prompt, siteId, abortSignal );
	const elapsedMs = Math.round( performance.now() - startedAt );
	const parsed = extractJsonArray( text );
	if ( ! isValidRewrites( parsed, slots.length ) ) {
		// eslint-disable-next-line no-console
		console.warn(
			`[Launchpad] draft_pattern_page (${ context.category }): unparseable response in ` +
				`${ elapsedMs }ms; keeping the pattern's own copy.\n` +
				`expected ${ slots.length } strings · prompt ${ prompt.length } chars\n` +
				'raw response:',
			text
		);
		return html;
	}
	// eslint-disable-next-line no-console
	console.log(
		`[Launchpad] draft_pattern_page (${ context.category }): ${ elapsedMs }ms · ` +
			`${ slots.length } slots rewritten · pattern "${ patternName }"`,
		{ context, slots: slots.map( ( s ) => s.text ), rewrites: parsed }
	);
	return applyRewrites( html, slots, parsed );
}

type Enrichment = { heading?: string; intro?: string; imageKeywords?: string };

function buildEnrichPrompt( context: PatternPageContext ): string {
	const facts = [
		context.siteName ? `Site name: ${ context.siteName }` : '',
		context.intent ? `Site goal & description: ${ context.intent }` : '',
	]
		.filter( Boolean )
		.join( '\n' );

	const wants: string[] = [];
	if ( context.intro ) {
		wants.push(
			`"heading": an evocative section heading for this page (max 6 words; NOT just the word "${ context.pageTitle }")`,
			'"intro": one or two warm sentences introducing this page, in the site\'s voice'
		);
	}
	if ( context.images ) {
		wants.push(
			'"imageKeywords": 2-4 words for a stock-photo search whose results would suit this page (e.g. "travel landscape photography")'
		);
	}

	// `category` is the PTK slug when present (events / about / …) — falls back
	// to `pageTitle` so the prompt still reads cleanly for intro-only pages
	// (e.g. "a Gallery page" rather than "a undefined page").
	const pageLabel = context.category ?? context.pageTitle.toLowerCase();
	return `You are personalizing a "${ pageLabel }" page for one specific WordPress site.

${ facts }

Return ONLY a JSON object with these keys:
${ wants.map( ( w ) => `- ${ w }` ).join( '\n' ) }
Plain language, no markdown, no extra keys. The first character of your response MUST be "{".

Return the JSON now.`;
}

function extractJsonObject( text: string ): Record< string, unknown > | null {
	const tryParse = ( s: string ): Record< string, unknown > | null => {
		try {
			const v = JSON.parse( s );
			return v && typeof v === 'object' && ! Array.isArray( v ) ? v : null;
		} catch {
			return null;
		}
	};
	const direct = tryParse( text );
	if ( direct ) {
		return direct;
	}
	for ( const pattern of [ /```(?:json)?\s*([\s\S]*?)```/, /(\{[\s\S]*\})/ ] ) {
		const match = text.match( pattern );
		if ( match?.[ 1 ] ) {
			const v = tryParse( match[ 1 ].trim() );
			if ( v ) {
				return v;
			}
		}
	}
	return null;
}

/** A centered heading + lead paragraph, prepended to a copy-light page. */
function introBlocks( heading: string, intro: string ): string {
	return `<!-- wp:heading {"textAlign":"center"} -->
<h2 class="wp-block-heading has-text-align-center">${ escapeHtml( heading ) }</h2>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center"} -->
<p class="has-text-align-center">${ escapeHtml( intro ) }</p>
<!-- /wp:paragraph -->

`;
}

type OpenverseItem = {
	URL?: string;
	url?: string;
	src?: string;
	guid?: string;
	largeURL?: string;
	thumbnails?: { large?: string; medium?: string; thumbnail?: string };
};

/** Search Openverse (via the wpcom external-media proxy — CORS-safe) for openly
 * licensed photos. Returns full-size image URLs. */
async function fetchOpenverseImages( query: string, count: number ): Promise< string[] > {
	const res = ( await wpcom.req.get(
		{ path: '/meta/external-media/openverse', apiVersion: '1.1' },
		{ source: 'openverse', search: query, number: Math.max( 3, count ) }
	) ) as { media?: OpenverseItem[]; found?: number };
	const media = res?.media ?? [];
	const urls = media
		.map(
			( m ) =>
				m.URL ??
				m.largeURL ??
				m.url ??
				m.src ??
				m.guid ??
				m.thumbnails?.large ??
				m.thumbnails?.medium
		)
		.filter( ( u ): u is string => typeof u === 'string' && u.length > 0 );
	// eslint-disable-next-line no-console
	console.log(
		`[Launchpad] openverse "${ query }": ${ media.length } results · ${ urls.length } urls`,
		{ firstItem: media[ 0 ], urls }
	);
	return urls;
}

const GALLERY_RE = /<!-- wp:gallery(?:\s+(\{[\s\S]*?\}))?\s*-->[\s\S]*?<!-- \/wp:gallery -->/;

function imageBlock( url: string ): string {
	return `<!-- wp:image {"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large"><img src="${ url }" alt=""/></figure>
<!-- /wp:image -->`;
}

/** Rebuild the page's gallery block with fresh image blocks (no stale
 * attachment ids), preserving the original column count. No-ops if the page has
 * no gallery block. */
function replaceGalleryImages( html: string, urls: string[] ): string {
	const match = html.match( GALLERY_RE );
	if ( ! match ) {
		return html;
	}
	let columns = 3;
	if ( match[ 1 ] ) {
		try {
			const attrs = JSON.parse( match[ 1 ] ) as { columns?: number };
			if ( typeof attrs.columns === 'number' ) {
				columns = attrs.columns;
			}
		} catch {
			// keep default
		}
	}
	const images = urls.map( imageBlock ).join( '\n\n' );
	const rebuilt = `<!-- wp:gallery {"columns":${ columns },"linkTo":"none"} -->
<figure class="wp-block-gallery has-nested-images columns-${ columns } is-cropped">${ images }</figure>
<!-- /wp:gallery -->`;
	return html.replace( GALLERY_RE, rebuilt );
}

/** Add a Dolly intro and/or swap in niche-matched Openverse photos. Each step
 * is best-effort: a failure keeps the pattern's own copy/images. */
async function enrichPage(
	html: string,
	context: PatternPageContext,
	siteId: number | undefined,
	abortSignal: AbortSignal | undefined
): Promise< string > {
	const logLabel = context.category ?? `intro:${ context.pageTitle }`;
	let enrichment: Enrichment = {};
	try {
		const startedAt = performance.now();
		const obj = extractJsonObject(
			await askDolly( buildEnrichPrompt( context ), siteId, abortSignal )
		);
		if ( obj ) {
			enrichment = {
				heading: typeof obj.heading === 'string' ? obj.heading : undefined,
				intro: typeof obj.intro === 'string' ? obj.intro : undefined,
				imageKeywords: typeof obj.imageKeywords === 'string' ? obj.imageKeywords : undefined,
			};
		}
		// eslint-disable-next-line no-console
		console.log(
			`[Launchpad] draft_pattern_page enrich (${ logLabel }): ` +
				`${ Math.round( performance.now() - startedAt ) }ms`,
			enrichment
		);
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.warn(
			`[Launchpad] draft_pattern_page enrich (${ logLabel }) failed; keeping pattern copy/images.`,
			error
		);
		return html;
	}

	let out = html;
	if ( context.intro && enrichment.heading && enrichment.intro ) {
		out = introBlocks( enrichment.heading, enrichment.intro ) + out;
	}
	if ( context.images && enrichment.imageKeywords ) {
		try {
			const count = ( out.match( /<img\b/gi ) ?? [] ).length || 3;
			const urls = await fetchOpenverseImages( enrichment.imageKeywords, count );
			if ( urls.length > 0 ) {
				out = replaceGalleryImages( out, urls );
			}
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.warn(
				`[Launchpad] draft_pattern_page (${ logLabel }): Openverse fetch failed; keeping pattern images.`,
				error
			);
		}
	}
	return out;
}

async function draftViaDolly(
	context: PatternPageContext,
	siteId: number | undefined,
	abortSignal: AbortSignal | undefined
): Promise< PatternPage > {
	// Intro-only path (no PTK pattern fetch). Used for the gallery task: the
	// user picks their own gallery layout from the editor's Patterns sidebar,
	// so we just seed the page with a Dolly heading + lead paragraph and let
	// the body stay empty.
	if ( ! context.category ) {
		const html = await enrichPage( '', context, siteId, abortSignal );
		return { html, pageTitle: context.pageTitle };
	}

	const locale = context.locale ?? 'en';
	const pattern = await fetchPattern( context.category, locale );
	if ( ! pattern?.html ) {
		throw new Error( `draftPatternPage: no usable pattern in category "${ context.category }"` );
	}

	// 1. Rewrite the pattern's own text slots (events, about, …).
	let html = await rewriteSlots( pattern.html, pattern.name, context, siteId, abortSignal );

	// 2. For copy-light / image-led patterns (e.g. a gallery), add a Dolly intro
	//    and/or swap in niche-matched Openverse photos.
	if ( context.intro || context.images ) {
		html = await enrichPage( html, context, siteId, abortSignal );
	}

	return { html, pageTitle: context.pageTitle };
}

export async function draftPatternPage(
	context: PatternPageContext,
	options?: { siteId?: number; abortSignal?: AbortSignal }
): Promise< PatternPage > {
	const override = readMockOverride();
	if ( override ) {
		return draftViaMock( override, context );
	}
	return draftViaDolly( context, options?.siteId, options?.abortSignal );
}
