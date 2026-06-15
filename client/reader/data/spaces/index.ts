import {
	addReadSpaceSourceMutation,
	createReadSpaceMutation,
	deleteReadSpaceSourceMutation,
	readSpaceQuery,
	readSpacesQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ReadSpace } from '@automattic/api-core';

/**
 * The user's spaces for the sidebar and space views. Until the real list
 * endpoint lands (RSM-4145) this is the hard-coded placeholder set plus any
 * spaces created in the current session — the latter are held in the React
 * Query cache by the create mutation.
 */
export function useSpaces(): ReadSpace[] {
	const { data = [] } = useQuery( readSpacesQuery() );
	return data;
}

/**
 * A single space's details, loaded on demand (e.g. by the sources modal).
 * Disabled until an id is known; pass `enabled: false` to also hold it off
 * while the consumer (e.g. a closed modal) doesn't need it yet. The add/delete
 * source mutations patch this query optimistically, so consumers see source
 * changes immediately.
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
 * Create-space mutation wired to Calypso's QueryClient. On success the new
 * space is appended to the cached list (see `createReadSpaceMutation`), so the
 * sidebar reflects it immediately.
 */
export function useCreateSpace() {
	const queryClient = useQueryClient();
	return useMutation( createReadSpaceMutation( queryClient ) );
}

export function useAddSpaceSource() {
	const queryClient = useQueryClient();
	return useMutation( addReadSpaceSourceMutation( queryClient ) );
}

export function useDeleteSpaceSource() {
	const queryClient = useQueryClient();
	return useMutation( deleteReadSpaceSourceMutation( queryClient ) );
}
