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
 * Attaches a snackbar to a mutation's `meta` object, preserving the existing `meta`
 * fields defined in `@automattic/api-queries`.
 */
export function withSnackbar< T extends { meta?: ApiQueriesMutationMeta } >(
	options: T,
	snackbar: Snackbar
): T {
	return { ...options, meta: { ...options.meta, snackbar } };
}
