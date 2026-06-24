export const SPACES_BASE_PATH = '/reader/spaces';

/** The tabs a space view can show. `feed` is the canonical base; `discover` is a suffix. */
export type SpaceTab = 'feed' | 'discover';

/** Tabs in display order, used to build the space sub-navigation. */
export const SPACE_TABS: SpaceTab[] = [ 'feed', 'discover' ];

export function getSpacePath( id: string ): string {
	// Encode the segment to match the other Reader route builders; ids are
	// opaque, so never assume they are already URL-safe.
	return `${ SPACES_BASE_PATH }/${ encodeURIComponent( id ) }`;
}

/**
 * Path for a space's tab. `feed` is the canonical base path (no suffix) so
 * existing links keep working; other tabs append their slug, e.g.
 * `/reader/spaces/<id>/discover`.
 */
export function getSpaceTabPath( id: string, tab: SpaceTab ): string {
	const base = getSpacePath( id );
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
