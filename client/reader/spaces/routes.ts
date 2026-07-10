export const SPACES_BASE_PATH = '/reader/spaces';

/** The tabs a space view can show. `feed` is the canonical base; `discover` is a suffix. */
export type SpaceTab = 'feed' | 'discover';

/** Tabs in display order, used to build the space sub-navigation. */
export const SPACE_TABS: SpaceTab[] = [ 'feed', 'discover' ];

export function getSpacePath( slug: string ): string {
	// A space slug is `sanitize_title(title)` — already URL-safe (lowercase, hyphens,
	// or percent-encoded UTF-8 for non-Latin titles). Don't re-encode it: running
	// `encodeURIComponent` over an already percent-encoded slug double-encodes the
	// `%` (`%d0…` → `%25d0…`), breaking the link and the sidebar's active-state match.
	return `${ SPACES_BASE_PATH }/${ slug }`;
}

/**
 * Path for a space's tab. `feed` is the canonical base path (no suffix) so the
 * bare space link keeps working; other tabs append their slug, e.g.
 * `/reader/spaces/<slug>/discover`.
 */
export function getSpaceTabPath( slug: string, tab: SpaceTab ): string {
	const base = getSpacePath( slug );
	return tab === 'feed' ? base : `${ base }/${ tab }`;
}

/**
 * Narrow a `:tab` route param to a known tab. A missing param is the canonical
 * feed path. Only `discover` is a valid suffix — anything else (including an
 * explicit `feed`, which isn't canonical) returns `null` so the caller can
 * redirect to the base path.
 */
export function parseSpaceTab( tab: string | undefined ): SpaceTab | null {
	if ( ! tab ) {
		return 'feed';
	}
	return tab === 'discover' ? 'discover' : null;
}

/**
 * Parse the tab from a full space path (`/reader/spaces/<slug>[/<tab>]`), for
 * callers that only have the current route string. Keeps the route-shape knowledge
 * here rather than string-indexing segments at the call site. The base path or an
 * unknown suffix resolves to the canonical `feed` tab.
 */
export function parseSpaceTabFromPath( path: string ): SpaceTab {
	const tabSegment = ( path || '' ).split( '?' )[ 0 ].split( '/' )[ 4 ];
	return parseSpaceTab( tabSegment ) ?? 'feed';
}
