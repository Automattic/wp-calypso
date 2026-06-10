import { createReadSpaceMutation, readSpacesQuery } from '@automattic/api-queries';
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
 * Create-space mutation wired to Calypso's QueryClient. On success the new
 * space is appended to the cached list (see `createReadSpaceMutation`), so the
 * sidebar reflects it immediately.
 */
export function useCreateSpace() {
	const queryClient = useQueryClient();
	return useMutation( createReadSpaceMutation( queryClient ) );
}
