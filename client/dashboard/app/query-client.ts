// import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient } from '@tanstack/react-query';
// import { persistQueryClient } from '@tanstack/react-query-persist-client';

export const queryClient = new QueryClient( {
	defaultOptions: {
		queries: {
			staleTime: 0,
			refetchOnWindowFocus: true,
			refetchOnMount: true,
		},
	},
} );

// const persister = createSyncStoragePersister( { storage: window.localStorage } );
// const maxAge = 1000 * 60 * 60 * 24; // 24 hours

// const [ , persistPromise ] = persistQueryClient( {
// 	queryClient,
// 	persister,
// 	maxAge,
// } );
const persistPromise = Promise.resolve();

export { persistPromise };
