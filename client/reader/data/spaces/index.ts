import {
	addReadSpaceSourceMutation,
	createReadSpaceMutation,
	deleteReadSpaceMutation,
	deleteReadSpaceSourceMutation,
	readSpaceQuery,
	readSpacesQuery,
	updateReadSpaceMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ReadSpace } from '@automattic/api-core';

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
 * the live detail endpoint (e.g. by the sources modal). Disabled until an id is
 * known; pass `enabled: false` to also hold it off while the consumer (e.g. a
 * closed modal) doesn't need it yet. The add/delete source mutations write the
 * returned detail back here, so consumers see source changes immediately.
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

/**
 * Update-space mutation wired to Calypso's QueryClient. On success the returned
 * detail is written to the detail cache and the matching list summary is
 * refreshed. Not used by any UI yet — an edit control can adopt it when built.
 * Note `tags` is a full replace of the tag set (there are no per-tag endpoints).
 */
export function useUpdateSpace() {
	const queryClient = useQueryClient();
	return useMutation( updateReadSpaceMutation( queryClient ) );
}

/**
 * Delete-space mutation wired to Calypso's QueryClient. On success the space is
 * removed from the cached list and its detail cache is discarded. Not used by
 * any UI yet — a delete control (with a confirm, since it's a hard delete) can
 * adopt this hook when one is built.
 */
export function useDeleteSpace() {
	const queryClient = useQueryClient();
	return useMutation( deleteReadSpaceMutation( queryClient ) );
}

export function useAddSpaceSource() {
	const queryClient = useQueryClient();
	return useMutation( addReadSpaceSourceMutation( queryClient ) );
}

export function useDeleteSpaceSource() {
	const queryClient = useQueryClient();
	return useMutation( deleteReadSpaceSourceMutation( queryClient ) );
}
