import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient, defaultShouldDehydrateQuery } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

export const queryClient = new QueryClient( {
	defaultOptions: {
		queries: {
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
	storage: typeof window !== 'undefined' ? window.localStorage : null,
} );

const maxAge = 1000 * 60 * 60 * 24; // 24 hours

const [ , persistPromise ] = persistQueryClient( {
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

export { persistPromise };
