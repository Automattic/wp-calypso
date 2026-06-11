import {
	DEFAULT_SPACE_COLOR,
	DEFAULT_SPACE_ICON,
	fetchReadSpaces,
	type CreateReadSpaceParams,
	type ReadSpace,
} from '@automattic/api-core';
import { mutationOptions, queryOptions, type QueryClient } from '@tanstack/react-query';

const readSpacesListKey = [ 'read', 'spaces', 'list' ] as const;

export const readSpacesQuery = () =>
	queryOptions( {
		queryKey: readSpacesListKey,
		queryFn: () => fetchReadSpaces(),
		// No real list endpoint yet (RSM-4145). The list is seeded and mutated
		// in-memory, so never refetch it out from under the create flow.
		staleTime: Infinity,
		// Keep the placeholder data out of Calypso's persisted query cache:
		// with `staleTime: Infinity` a dehydrated copy would survive reloads for
		// days and mask the real list once the endpoint ships.
		meta: { persist: false },
	} );

/**
 * Create a space.
 *
 * TODO(RSM-4139): call the real `POST` (with server-side validation and
 * duplicate-name rejection) once the create endpoint exists. For now the space
 * is constructed locally with a generated id — no network request — and the
 * mutation only writes the React Query cache below.
 */
function createReadSpace( params: CreateReadSpaceParams ): Promise< ReadSpace > {
	return Promise.resolve( {
		id: generateSpaceId(),
		name: params.name,
		tags: params.tags,
		color: DEFAULT_SPACE_COLOR,
		icon: DEFAULT_SPACE_ICON,
	} );
}

function generateSpaceId(): string {
	// `crypto.randomUUID` is available in all supported browsers; fall back to a
	// random base36 string in non-secure or test contexts where it is undefined.
	if ( typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ) {
		return crypto.randomUUID();
	}
	return Math.random().toString( 36 ).slice( 2, 12 );
}

// Calypso boots its own QueryClient (see `client/state/query-client.ts`) instead
// of the singleton from this package, so the mutation factory accepts the
// caller's QueryClient and uses it to write the cache. Pass `useQueryClient()`
// from the consuming component.
export const createReadSpaceMutation = ( queryClient: QueryClient ) =>
	mutationOptions( {
		mutationFn: createReadSpace,
		onSuccess: ( space ) => {
			// No network round-trip yet (RSM-4139): the created space is appended
			// straight to the cached list so it shows up in the sidebar at once.
			queryClient.setQueryData< ReadSpace[] >( readSpacesQuery().queryKey, ( previous ) => [
				...( previous ?? [] ),
				space,
			] );
		},
	} );
