export const SHELVES_BASE_PATH = '/reader/shelves';

/** The tabs a shelf view can show. `feed` is the canonical base; `discover` is a suffix. */
export type ShelfTab = 'feed' | 'discover';

/** Tabs in display order, used to build the shelf sub-navigation. */
export const SHELF_TABS: ShelfTab[] = [ 'feed', 'discover' ];

export function getShelfPath( slug: string ): string {
	// A shelf slug is `sanitize_title(title)` — already URL-safe (lowercase, hyphens,
	// or percent-encoded UTF-8 for non-Latin titles). Don't re-encode it: running
	// `encodeURIComponent` over an already percent-encoded slug double-encodes the
	// `%` (`%d0…` → `%25d0…`), breaking the link and the sidebar's active-state match.
	return `${ SHELVES_BASE_PATH }/${ slug }`;
}

/**
 * Path for a shelf's tab. `feed` is the canonical base path (no suffix) so the
 * bare shelf link keeps working; other tabs append their slug, e.g.
 * `/reader/shelves/<slug>/discover`.
 */
export function getShelfTabPath( slug: string, tab: ShelfTab ): string {
	const base = getShelfPath( slug );
	return tab === 'feed' ? base : `${ base }/${ tab }`;
}

/**
 * Narrow a `:tab` route param to a known tab. A missing param is the canonical
 * feed path. Only `discover` is a valid suffix — anything else (including an
 * explicit `feed`, which isn't canonical) returns `null` so the caller can
 * redirect to the base path.
 */
export function parseShelfTab( tab: string | undefined ): ShelfTab | null {
	if ( ! tab ) {
		return 'feed';
	}
	return tab === 'discover' ? 'discover' : null;
}

/**
 * Parse the tab from a full shelf path (`/reader/shelves/<slug>[/<tab>]`), for
 * callers that only have the current route string. Keeps the route-shape knowledge
 * here rather than string-indexing segments at the call site. The base path or an
 * unknown suffix resolves to the canonical `feed` tab.
 */
export function parseShelfTabFromPath( path: string ): ShelfTab {
	const tabSegment = ( path || '' ).split( '?' )[ 0 ].split( '/' )[ 4 ];
	return parseShelfTab( tabSegment ) ?? 'feed';
}
