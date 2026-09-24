import {
	createReadShelfMutation,
	deleteReadShelfMutation,
	readShelfBySlugQuery,
	readShelfQuery,
	readShelvesQuery,
	updateReadShelfMutation,
} from '@automattic/api-queries';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ReadShelf, ReadShelfDetails } from '@automattic/api-core';

type ReadShelfQueryOptions = {
	enabled?: boolean;
	refetchOnMount?: boolean | 'always';
};

/**
 * The user's shelves for the sidebar and shelf views, from the live list
 * endpoint. Summary shape only (no sources or tags) — use `useShelfBySlug` for those.
 */
export function useShelves(): ReadShelf[] {
	const { data = [] } = useQuery( readShelvesQuery() );
	return data;
}

/**
 * A single shelf's details resolved by its URL slug (`GET /reader/shelves/slug/…`).
 * This is how a slug-addressed shelf view resolves itself: the returned detail
 * carries the numeric `id` that then drives the streams and mutations. A 404
 * (unknown / renamed-away / not-yours slug) surfaces as the query's error, which
 * the view turns into the not-found state. `options` tunes the query config; the
 * caller's `enabled` is ANDed with a known slug, so it never runs without one.
 */
export function useShelfBySlug( slug: string | null | undefined, options?: ReadShelfQueryOptions ) {
	return useQuery( {
		...readShelfBySlugQuery( slug ?? '' ),
		...options,
		enabled: Boolean( slug ) && ( options?.enabled ?? true ),
	} );
}

/**
 * Details (sources + tags) for several shelves at once, keyed by shelf id. Used by
 * the subscribe-with-shelf picker to know which shelves already contain the feed —
 * a batch lookup by id (it drives id-based feed mutations), not a URL resolution,
 * so it reads the id-keyed detail directly. Batches the per-shelf queries in a
 * single hook at the modal level; still one query per shelf id.
 */
export function useShelvesDetails( shelfIds: string[] ): {
	byId: Record< string, ReadShelfDetails | undefined >;
	isError: boolean;
	isLoading: boolean;
} {
	return useQueries( {
		queries: shelfIds.map( ( id ) => readShelfQuery( id ) ),
		combine: ( results ) => ( {
			byId: Object.fromEntries(
				results.map( ( result, index ) => [ shelfIds[ index ], result.data ] )
			),
			isError: results.some( ( result ) => result.isError ),
			isLoading: results.some( ( result ) => result.isLoading ),
		} ),
	} );
}

/**
 * Create-shelf mutation wired to Calypso's QueryClient. On success the new
 * shelf is appended to the cached list (see `createReadShelfMutation`), so the
 * sidebar reflects it immediately.
 */
export function useCreateShelf() {
	const queryClient = useQueryClient();
	return useMutation( createReadShelfMutation( queryClient ) );
}

/**
 * Update-shelf mutation wired to Calypso's QueryClient. On success the returned
 * detail is written to the detail cache and the matching list summary is
 * refreshed. Consumed by the Customize modal's edit/save path. Note `tags` and
 * `feeds` are full replaces of their sets.
 */
export function useUpdateShelf() {
	const queryClient = useQueryClient();
	return useMutation( updateReadShelfMutation( queryClient ) );
}

/**
 * Delete-shelf mutation wired to Calypso's QueryClient. On success the shelf is
 * removed from the cached list and its detail cache is discarded. Consumed by
 * the Customize modal's Delete tab (behind a confirm, since it's a hard delete).
 */
export function useDeleteShelf() {
	const queryClient = useQueryClient();
	return useMutation( deleteReadShelfMutation( queryClient ) );
}
