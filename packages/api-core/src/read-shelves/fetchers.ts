import { wpcom } from '../wpcom-fetcher';
import { adaptReadShelf, adaptReadShelfDetails, type ReadShelfApiItem } from './adapters';
import type { ReadShelf, ReadShelfDetails } from './types';

/**
 * Canonicalize a shelf slug to a single representation for cache keys and
 * comparisons. A shelf's `slug` from the API is `sanitize_title(title)`, which
 * percent-encodes non-Latin titles (e.g. `%d0%bf…`), whereas the router hands the
 * view the *decoded* slug (`привет`). Decoding both to the same form keeps the
 * by-slug cache key, the sidebar prefetch, and the list lookup in agreement — for
 * ASCII slugs (no `%`) it's a no-op. Malformed input is returned unchanged.
 */
export function canonicalizeReadShelfSlug( slug: string ): string {
	try {
		return decodeURIComponent( slug );
	} catch {
		return slug;
	}
}

/**
 * Fetch the current user's shelves from the wpcom/v2 `GET /reader/shelves`
 * endpoint. The list is the slim summary shape (no sources or tags), adapted to
 * the client `ReadShelf` via `adaptReadShelf`.
 */
export async function fetchReadShelves(): Promise< ReadShelf[] > {
	const response = await wpcom.req.get( {
		path: '/reader/shelves',
		apiNamespace: 'wpcom/v2',
	} );

	const items: ReadShelfApiItem[] = Array.isArray( response ) ? response : [];
	return items.map( adaptReadShelf );
}

/**
 * Fetch a single shelf's detail (its followed feeds and tags) from the wpcom/v2
 * `GET /reader/shelves/{id}` endpoint, adapting the wire `follows` array onto the
 * client `sources` shape.
 */
export async function fetchReadShelf( shelfId: string ): Promise< ReadShelfDetails > {
	const item: ReadShelfApiItem = await wpcom.req.get( {
		path: `/reader/shelves/${ encodeURIComponent( shelfId ) }`,
		apiNamespace: 'wpcom/v2',
	} );

	return adaptReadShelfDetails( item );
}

/**
 * Fetch a single shelf's detail by its slug from the wpcom/v2
 * `GET /reader/shelves/slug/{slug}` endpoint. Returns the caller's shelf with that
 * slug in the same detail shape as `fetchReadShelf`; 404s when the caller has no
 * shelf with that slug (unknown, renamed away, or not theirs). Used to resolve a
 * slug-addressed URL to a shelf (whose numeric `id` then drives streams and
 * mutations).
 */
export async function fetchReadShelfBySlug( slug: string ): Promise< ReadShelfDetails > {
	// Canonicalize first so a caller passing the already percent-encoded API slug
	// (`%d0%bf…`) and one passing the decoded route slug (`привет`) both send the
	// same single-encoded path, rather than double-encoding the former.
	const item: ReadShelfApiItem = await wpcom.req.get( {
		path: `/reader/shelves/slug/${ encodeURIComponent( canonicalizeReadShelfSlug( slug ) ) }`,
		apiNamespace: 'wpcom/v2',
	} );

	return adaptReadShelfDetails( item );
}
