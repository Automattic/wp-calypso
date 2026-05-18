/**
 * Picks themes from the curated allowlist that best match the user's
 * inferred context (vibe / niche / goal).
 *
 * Pure client-side — no Dolly call. Dolly already extracted `inferred`
 * during the wizard call (where the user is already waiting); the theme
 * picker just *consumes* that understanding. Result: zero latency, no
 * second 30s agent pre-work hit.
 *
 * If we ever want Dolly-written "why" lines per pick, we can layer that
 * back in as an optional async enrichment — but the matching itself
 * doesn't need an LLM. Token overlap against the allowlist's vibe and
 * category tags is enough to feel personalized.
 */
import { THEME_ALLOWLIST } from './theme-allowlist';
import type { InferredContext } from './tailor-launchpad';
import type { ThemeEntry } from './theme-allowlist';

export type ThemeRecommendation = {
	theme: ThemeEntry;
	/** Why this theme fits, using the user's own niche/vibe words where possible. */
	why: string;
	/** Score used for ordering. Exposed for debugging / logging. */
	score: number;
};

const DEFAULT_PICK_COUNT = 6;

// Common stop-words to filter so they don't substring-match real tags.
// "and" was hitting "h-AND-made" inside the messenger theme's "handmade"
// vibe, ranking messenger above more relevant themes for unrelated prompts.
const STOP_WORDS = new Set( [
	'and',
	'the',
	'for',
	'with',
	'your',
	'you',
	'are',
	'who',
	'this',
	'that',
	'their',
	'they',
	'about',
	'from',
	'into',
	'have',
	'will',
	'just',
	'also',
	'than',
	'them',
	'some',
	'sites',
	'site',
] );

/**
 * Split a free-form context string into lowercase tokens we can match
 * against the allowlist's vibe and category tags. Hyphens and commas
 * are split too so "Japan-inspired, minimal" → [japan, inspired, minimal].
 */
function tokenize( text: string ): string[] {
	return text
		.toLowerCase()
		.split( /[\s,\-/_]+/ )
		.map( ( t ) => t.trim() )
		.filter( ( t ) => t.length >= 3 && ! STOP_WORDS.has( t ) );
}

function gatherContextTokens( inferred: InferredContext ): {
	vibeTokens: string[];
	nicheTokens: string[];
	goalTokens: string[];
} {
	// Vibe tokens come from the explicit `vibe` field plus secondary signals
	// from `audience` (e.g. "young creatives" → "creatives" matches some
	// theme vibes).
	const vibeText = [ inferred.vibe, inferred.audience ].filter( Boolean ).join( ' ' );
	// Niche and goal used to be merged into one categoryTokens bucket with
	// equal weight, which over-rewarded themes that matched a peripheral
	// niche tag (e.g. videomaker matching "travel" beat blog-shaped themes
	// for a "blog about travel" prompt). Splitting lets the scorer weight
	// goal matches higher — the goal is the user's explicit shape ("I want
	// a blog"), so themes that don't match the goal should sort below ones
	// that do.
	return {
		vibeTokens: tokenize( vibeText ),
		nicheTokens: tokenize( inferred.niche ?? '' ),
		goalTokens: tokenize( inferred.goal ?? '' ),
	};
}

/**
 * Match a single context token against a single theme tag.
 *
 * Rules in order of confidence:
 * 1. Exact match — strongest signal.
 * 2. Tag is a prefix of token, or token is a prefix of tag — handles
 *    pluralisation and word-form variation ("photo" / "photos" /
 *    "photography"; "blog" / "blogger").
 * 3. Otherwise no match — explicitly REJECTS midword substring matches
 *    like "shop" ⇔ "work**shop**" or "and" ⇔ "h**and**made", which used to
 *    cause spurious top-of-list rankings on unrelated prompts.
 *
 * Requires both strings to be ≥3 chars (`tokenize` already filters tokens;
 * the allowlist only ships ≥3-char tags).
 */
function tokenMatches( token: string, tag: string ): boolean {
	if ( token === tag ) {
		return true;
	}
	return tag.startsWith( token ) || token.startsWith( tag );
}

type ScoreBreakdown = {
	score: number;
	matchedVibe?: string;
	matchedCategory?: string;
};

function scoreTheme(
	theme: ThemeEntry,
	context: ReturnType< typeof gatherContextTokens >
): ScoreBreakdown {
	let score = 0;
	let matchedVibe: string | undefined;
	let matchedCategory: string | undefined;

	for ( const vibe of theme.vibes ) {
		const hit = context.vibeTokens.find( ( t ) => tokenMatches( t, vibe ) );
		if ( hit ) {
			score += 1;
			matchedVibe ??= vibe;
		}
	}
	// Goal matches are the strongest signal — the user said exactly what
	// shape of site they want ("blog"/"sell"/"portfolio"). A theme that
	// matches the goal should dominate themes that only match a peripheral
	// niche tag.
	for ( const cat of theme.categories ) {
		if ( context.goalTokens.find( ( t ) => tokenMatches( t, cat ) ) ) {
			score += 3;
			matchedCategory ??= cat;
		}
	}
	// Niche overlap is the second signal (a photographer needs a photo-first
	// theme more than they need a "minimal" one). Weight 2× — strong but
	// subordinate to goal so a videomaker-tagged-with-travel doesn't beat a
	// blog theme for a "travel blog" prompt.
	for ( const cat of theme.categories ) {
		if ( context.nicheTokens.find( ( t ) => tokenMatches( t, cat ) ) ) {
			score += 2;
			matchedCategory ??= cat;
		}
	}
	return { score, matchedVibe, matchedCategory };
}

/**
 * Build a "why this fits" line that parrots the user's own niche/vibe
 * back at them. Cheap to compute, and reads as personal because it uses
 * their words — no LLM needed.
 */
function buildWhy(
	theme: ThemeEntry,
	inferred: InferredContext,
	breakdown: ScoreBreakdown
): string {
	const niche = inferred.niche?.trim();
	const vibe = inferred.vibe?.trim();

	// Strongest match: we hit on both axes. Lead with the niche, follow
	// with the aesthetic.
	if ( breakdown.matchedCategory && niche && breakdown.matchedVibe && vibe ) {
		return `${ theme.tagline } — fits ${ niche } sites with a ${ vibe } feel.`;
	}
	if ( breakdown.matchedCategory && niche ) {
		return `${ theme.tagline } — built for ${ niche }.`;
	}
	if ( breakdown.matchedVibe && vibe ) {
		return `${ theme.tagline } — matches a ${ vibe } aesthetic.`;
	}
	// No specific match → fall back to the theme's own tagline. Used for
	// the padding picks when fewer than `count` themes scored above zero.
	return theme.tagline;
}

/**
 * Build a personalized subtitle for the pick-theme task row using the
 * wizard's inferred context. Mirrors the picker's own "why" phrasing
 * (which weaves niche + vibe into each card's blurb) so the row → modal
 * transition feels consistent. Returns null when inferred has neither
 * niche nor vibe — the caller should fall back to the static registry
 * subtitle in that case.
 */
export function buildPickThemeSubtitle( inferred: InferredContext | null ): string | null {
	const niche = inferred?.niche?.trim();
	const vibe = inferred?.vibe?.trim();
	if ( vibe && niche ) {
		const Vibe = vibe.charAt( 0 ).toUpperCase() + vibe.slice( 1 );
		return `${ Vibe } designs that match your ${ niche }.`;
	}
	if ( niche ) {
		return `Designs that match your ${ niche }.`;
	}
	if ( vibe ) {
		const Vibe = vibe.charAt( 0 ).toUpperCase() + vibe.slice( 1 );
		return `${ Vibe } designs picked for your site.`;
	}
	return null;
}

export function recommendThemes(
	inferred: InferredContext,
	count: number = DEFAULT_PICK_COUNT,
	options: { excludeSlugs?: string[] } = {}
): ThemeRecommendation[] {
	const context = gatherContextTokens( inferred );
	// Lowercase + Set for O(1) lookup. Active-theme slugs from Redux can be
	// case-inconsistent (`Assembler` vs `assembler`) depending on whether the
	// site is a wpcom or Jetpack install, so we normalize on both sides.
	const excluded = new Set(
		( options.excludeSlugs ?? [] ).map( ( s ) => s.toLowerCase() ).filter( Boolean )
	);

	const scored = THEME_ALLOWLIST.filter(
		( theme ) => ! excluded.has( theme.slug.toLowerCase() )
	).map( ( theme, registryIndex ) => {
		const breakdown = scoreTheme( theme, context );
		return {
			theme,
			breakdown,
			registryIndex,
		};
	} );

	// Sort by score (desc), break ties by registry order (stable, predictable).
	scored.sort( ( a, b ) => {
		if ( b.breakdown.score !== a.breakdown.score ) {
			return b.breakdown.score - a.breakdown.score;
		}
		return a.registryIndex - b.registryIndex;
	} );

	const picks = scored.slice( 0, count ).map(
		( { theme, breakdown } ) =>
			( {
				theme,
				why: buildWhy( theme, inferred, breakdown ),
				score: breakdown.score,
			} ) as ThemeRecommendation
	);

	// eslint-disable-next-line no-console
	console.log(
		`[Launchpad] recommend_themes (client-side): picked ${ picks.length } of ${ THEME_ALLOWLIST.length }`,
		{
			inferred,
			picks: picks.map( ( p ) => ( {
				slug: p.theme.slug,
				score: p.score,
				why: p.why,
			} ) ),
		}
	);

	return picks;
}
