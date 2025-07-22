import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient } from '@tanstack/react-query';
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

const persister = createSyncStoragePersister( { storage: window.localStorage } );
const maxAge = 1000 * 60 * 60 * 24; // 24 hours

const [ , persistPromise ] = persistQueryClient( {
	queryClient,
	persister,
	buster: '3', // Bump when query data shape changes.
	maxAge,
	dehydrateOptions: {
		shouldDehydrateQuery: ( { meta } ) => {
			if ( meta?.persist === false ) {
				return false;
			}
			return true;
		},
	},
} );

export { persistPromise };
