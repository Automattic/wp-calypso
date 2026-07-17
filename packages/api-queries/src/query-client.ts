import { isSupportSession } from '@automattic/calypso-support-session';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient, defaultShouldDehydrateQuery } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { startSiteCollisionListener } from './site-collision-listener';

// Open to augmentation: apps consuming this package add their own meta by extending
// these interfaces rather than TanStack's `Register`, which only allows one
// `mutationMeta`/`queryMeta` declaration repo-wide.
//
// Extending `Record< string, unknown >` is required because TanStack derives
// `MutationMeta` via `Register extends { mutationMeta: infer T } ? T extends
// Record< string, unknown > ? T : ... `, and interfaces get no implicit index
// signature (microsoft/TypeScript#15300). Drop it and every `meta` read silently
// degrades to `{}`.

export interface ApiQueriesMutationMeta extends Record< string, unknown > {
	statId?: string;
}

export interface ApiQueriesQueryMeta extends Record< string, unknown > {
	persist?: boolean | ( ( data: any ) => boolean );
}

declare module '@tanstack/react-query' {
	interface Register {
		mutationMeta: ApiQueriesMutationMeta;
		queryMeta: ApiQueriesQueryMeta;
	}
}

// Key used to store the query cache in local storage.
// This is the default key used by React Query, but making it explicit in case
// of breaking changes to the default key in the future.
const reactQueryCacheKey = 'REACT_QUERY_OFFLINE_CACHE';

const queryClient = new QueryClient( {
	defaultOptions: {
		queries: {
			// Do not hesitate to set a different `staleTime` on specific queries where
			// you have more context around how the data is typically get/set.
			// We are intentionally using TanStack's default of 0 because much of the
			// data in a8c dashboards can be updated in multiple places (e.g. wp-admin)
			// so should be considered stale when switching between tabs.
			staleTime: 0,
			refetchOnWindowFocus: true,
			refetchOnMount: true,
			retry: ( failureCount: number, error: Error ) => {
				if ( 'status' in error && typeof error.status === 'number' ) {
					if ( error.status >= 400 && error.status < 500 ) {
						return false;
					}
				}
				return failureCount < 3;
			},
		},
	},
} );

const persister = createSyncStoragePersister( {
	storage: typeof window !== 'undefined' && ! isSupportSession() ? window.localStorage : null,
	key: reactQueryCacheKey,
} );

const maxAge = 1000 * 60 * 60 * 24; // 24 hours

const [ disablePersistQueryClient, persistQueryClientPromise ] = persistQueryClient( {
	queryClient,
	persister,
	buster: '3', // Bump when query data shape changes.
	maxAge,
	dehydrateOptions: {
		shouldRedactErrors: () => false,
		shouldDehydrateQuery: ( query ) => {
			const persist = query.meta?.persist;
			if ( persist === false ) {
				return false;
			}
			// Gate the predicate behind the default check so it is never handed the
			// data of a query that hasn't succeeded.
			if ( ! defaultShouldDehydrateQuery( query ) ) {
				return false;
			}
			return typeof persist === 'function' ? persist( query.state.data ) : true;
		},
	},
} );

startSiteCollisionListener( queryClient );

export { queryClient, disablePersistQueryClient, persistQueryClientPromise };

export function clearQueryClient() {
	if ( typeof window !== 'undefined' && ! isSupportSession() ) {
		localStorage.removeItem( reactQueryCacheKey );
	}
}
