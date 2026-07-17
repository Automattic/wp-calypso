import type { ApiQueriesMutationMeta } from '@automattic/api-queries';

declare module '@automattic/api-queries' {
	interface ApiQueriesMutationMeta {
		snackbar?: {
			success?: string;
			error?: string | { source: 'server' };
		};
	}
}

export type Snackbar = NonNullable< ApiQueriesMutationMeta[ 'snackbar' ] >;

/**
 * Attaches a snackbar to a mutation's `meta`, preserving the `meta` the mutation
 * already carries.
 *
 * Spreading a factory and then setting `meta` replaces the whole object, dropping
 * the factory's `meta.statId` and leaving its failures reported as `missing`:
 *
 *     useMutation( { ...fooMutation( id ), meta: { snackbar } } ) // statId lost
 *     useMutation( withSnackbar( fooMutation( id ), snackbar ) )  // statId kept
 */
export function withSnackbar< T extends { meta?: ApiQueriesMutationMeta } >(
	options: T,
	snackbar: Snackbar
): T {
	return { ...options, meta: { ...options.meta, snackbar } };
}
