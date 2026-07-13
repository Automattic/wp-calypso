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

// Key used to track which user's data is stored in the cache. When the
// authenticated user changes (e.g. someone logs out via Calypso v1 and a
// different account logs in), the cache is cleared on startup so that the new
// user never sees the previous user's data.
const dashboardUserIdKey = 'dashboard-user-id';

// Clear the persisted cache before restoring it if the server-bootstrapped user
// differs from the user whose data is stored in the cache. This prevents a
// brief flash of a previous user's data after switching accounts via Calypso v1.
if ( typeof window !== 'undefined' && ! isSupportSession() ) {
	// `window.currentUser` is injected by the server bootstrap; cast to a local
	// type rather than augmenting the global Window interface (which can break
	// tests — see the comment in client/lib/request-with-subkey-fallback).
	type BootstrapWindow = { currentUser?: { ID: number } };
	const bootstrapUserId = ( window as unknown as BootstrapWindow ).currentUser?.ID;
	const storedUserId = localStorage.getItem( dashboardUserIdKey );
	if (
		bootstrapUserId !== undefined &&
		storedUserId !== null &&
		String( bootstrapUserId ) !== storedUserId
	) {
		localStorage.removeItem( reactQueryCacheKey );
	}
}

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
		localStorage.removeItem( dashboardUserIdKey );
	}
}

/**
 * Persist the currently authenticated user's ID alongside the query cache.
 * This ID is checked on startup to detect account switches made via Calypso v1
 * (legacy logout/login), so that stale cached data from a previous user is
 * discarded before it can be displayed.
 */
export function setAuthenticatedUserId( userId: number ) {
	if ( typeof window !== 'undefined' && ! isSupportSession() ) {
		localStorage.setItem( dashboardUserIdKey, String( userId ) );
	}
}
