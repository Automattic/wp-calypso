import { isSupportSession } from '@automattic/calypso-support-session';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient, defaultShouldDehydrateQuery } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { startSiteCollisionListener } from './site-collision-listener';

declare module '@tanstack/react-query' {
	interface Register {
		queryMeta: {
			persist?: boolean | ( ( data: any ) => boolean );
			fullPageLoader?: boolean;
		};
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
			if ( query.meta?.persist === false ) {
				return false;
			}
			return defaultShouldDehydrateQuery( query );
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
