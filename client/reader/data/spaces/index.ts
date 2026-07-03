import {
	createReadSpaceMutation,
	deleteReadSpaceMutation,
	readSpaceQuery,
	readSpacesQuery,
	updateReadSpaceMutation,
} from '@automattic/api-queries';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ReadSpace, ReadSpaceDetails } from '@automattic/api-core';

/**
 * The user's spaces for the sidebar and space views, from the live list
 * endpoint. Summary shape only (no sources or tags) — use `useSpace` for those.
 */
export function useSpaces(): ReadSpace[] {
	const { data = [] } = useQuery( readSpacesQuery() );
	return data;
}

/**
 * A single space's details (its followed feeds and tags), loaded on demand from
 * the live detail endpoint (e.g. by the Customize modal). Disabled until an id is
 * known; pass `enabled: false` to also hold it off while the consumer (e.g. a
 * closed modal) doesn't need it yet.
 */
export function useSpace(
	spaceId: string | null | undefined,
	{ enabled = true }: { enabled?: boolean } = {}
) {
	return useQuery( {
		...readSpaceQuery( spaceId ?? '' ),
		enabled: enabled && Boolean( spaceId ),
	} );
}

/**
 * Details (sources + tags) for several spaces at once, keyed by space id. Used by
 * the subscribe-with-space picker to know which spaces already contain the feed.
 * Batches the per-space detail queries in a single hook at the modal level (rather
 * than each row mounting its own `useSpace`), sharing the same detail cache as
 * `useSpace`. Note this still runs one query per space id.
 */
export function useSpacesDetails( spaceIds: string[] ): {
	byId: Record< string, ReadSpaceDetails | undefined >;
	isError: boolean;
	isLoading: boolean;
} {
	return useQueries( {
		queries: spaceIds.map( ( id ) => readSpaceQuery( id ) ),
		combine: ( results ) => ( {
			byId: Object.fromEntries(
				results.map( ( result, index ) => [ spaceIds[ index ], result.data ] )
			),
			isError: results.some( ( result ) => result.isError ),
			isLoading: results.some( ( result ) => result.isLoading ),
		} ),
	} );
}

/**
 * Create-space mutation wired to Calypso's QueryClient. On success the new
 * space is appended to the cached list (see `createReadSpaceMutation`), so the
 * sidebar reflects it immediately.
 */
export function useCreateSpace() {
	const queryClient = useQueryClient();
	return useMutation( createReadSpaceMutation( queryClient ) );
}

/**
 * Update-space mutation wired to Calypso's QueryClient. On success the returned
 * detail is written to the detail cache and the matching list summary is
 * refreshed. Consumed by the Customize modal's edit/save path. Note `tags` and
 * `feeds` are full replaces of their sets.
 */
export function useUpdateSpace() {
	const queryClient = useQueryClient();
	return useMutation( updateReadSpaceMutation( queryClient ) );
}

/**
 * Delete-space mutation wired to Calypso's QueryClient. On success the space is
 * removed from the cached list and its detail cache is discarded. Consumed by
 * the Customize modal's Delete tab (behind a confirm, since it's a hard delete).
 */
export function useDeleteSpace() {
	const queryClient = useQueryClient();
	return useMutation( deleteReadSpaceMutation( queryClient ) );
}
