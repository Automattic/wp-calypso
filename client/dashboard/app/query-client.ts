import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { TWO_STEP_QUERY_KEY } from './auth';

export const queryClient = new QueryClient( {
	defaultOptions: {
		queries: {
			staleTime: 0,
			refetchOnWindowFocus: true,
			refetchOnMount: true,
		},
	},
} );

const persister = createSyncStoragePersister( { storage: window.localStorage } );
const maxAge = 1000 * 60 * 60 * 24; // 24 hours

const [ , persistPromise ] = persistQueryClient( {
	queryClient,
	persister,
	buster: '1', // Bump when query data shape changes.
	maxAge,
	dehydrateOptions: {
		shouldDehydrateQuery: ( { queryKey } ) => {
			if ( TWO_STEP_QUERY_KEY === queryKey ) {
				return false;
			}
			return true;
		},
	},
} );

export { persistPromise };
