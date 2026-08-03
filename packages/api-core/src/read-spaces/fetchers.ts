import { wpcom } from '../wpcom-fetcher';
import { adaptReadSpace, adaptReadSpaceDetails, type ReadSpaceApiItem } from './adapters';
import type { ReadSpace, ReadSpaceDetails } from './types';

/**
 * Canonicalize a space slug to a single representation for cache keys and
 * comparisons. A space's `slug` from the API is `sanitize_title(title)`, which
 * percent-encodes non-Latin titles (e.g. `%d0%bf…`), whereas the router hands the
 * view the *decoded* slug (`привет`). Decoding both to the same form keeps the
 * by-slug cache key, the sidebar prefetch, and the list lookup in agreement — for
 * ASCII slugs (no `%`) it's a no-op. Malformed input is returned unchanged.
 */
export function canonicalizeReadSpaceSlug( slug: string ): string {
	try {
		return decodeURIComponent( slug );
	} catch {
		return slug;
	}
}

/**
 * Fetch the current user's spaces from the wpcom/v2 `GET /reader/spaces`
 * endpoint. The list is the slim summary shape (no sources or tags), adapted to
 * the client `ReadSpace` via `adaptReadSpace`.
 */
export async function fetchReadSpaces(): Promise< ReadSpace[] > {
	const response = await wpcom.req.get( {
		path: '/reader/spaces',
		apiNamespace: 'wpcom/v2',
	} );

	const items: ReadSpaceApiItem[] = Array.isArray( response ) ? response : [];
	return items.map( adaptReadSpace );
}

/**
 * Fetch a single space's detail (its followed feeds and tags) from the wpcom/v2
 * `GET /reader/spaces/{id}` endpoint, adapting the wire `follows` array onto the
 * client `sources` shape.
 */
export async function fetchReadSpace( spaceId: string ): Promise< ReadSpaceDetails > {
	const item: ReadSpaceApiItem = await wpcom.req.get( {
		path: `/reader/spaces/${ encodeURIComponent( spaceId ) }`,
		apiNamespace: 'wpcom/v2',
	} );

	return adaptReadSpaceDetails( item );
}

/**
 * Fetch a single space's detail by its slug from the wpcom/v2
 * `GET /reader/spaces/slug/{slug}` endpoint. Returns the caller's space with that
 * slug in the same detail shape as `fetchReadSpace`; 404s when the caller has no
 * space with that slug (unknown, renamed away, or not theirs). Used to resolve a
 * slug-addressed URL to a space (whose numeric `id` then drives streams and
 * mutations).
 */
export async function fetchReadSpaceBySlug( slug: string ): Promise< ReadSpaceDetails > {
	// Canonicalize first so a caller passing the already percent-encoded API slug
	// (`%d0%bf…`) and one passing the decoded route slug (`привет`) both send the
	// same single-encoded path, rather than double-encoding the former.
	const item: ReadSpaceApiItem = await wpcom.req.get( {
		path: `/reader/spaces/slug/${ encodeURIComponent( canonicalizeReadSpaceSlug( slug ) ) }`,
		apiNamespace: 'wpcom/v2',
	} );

	return adaptReadSpaceDetails( item );
}
