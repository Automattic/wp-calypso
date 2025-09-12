import { isSupportSession } from '@automattic/calypso-support-session';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { MutationCache, QueryClient, defaultShouldDehydrateQuery } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

type MutationCacheConfig = MutationCache[ 'config' ];
type MutationSuccessCallback = NonNullable< MutationCacheConfig[ 'onSuccess' ] >;
type MutationErrorCallback = NonNullable< MutationCacheConfig[ 'onError' ] >;

const mutationSuccessCallback: MutationSuccessCallback[] = [];
const mutationErrorCallback: MutationErrorCallback[] = [];

function registerMutationSuccessCallback( callback: MutationSuccessCallback ) {
	mutationSuccessCallback.push( callback );
	return () => {
		const index = mutationSuccessCallback.indexOf( callback );
		if ( index > -1 ) {
			mutationSuccessCallback.splice( index, 1 );
		}
	};
}

function registerMutationErrorCallback( callback: MutationErrorCallback ) {
	mutationErrorCallback.push( callback );
	return () => {
		const index = mutationErrorCallback.indexOf( callback );
		if ( index > -1 ) {
			mutationErrorCallback.splice( index, 1 );
		}
	};
}

const queryClient = new QueryClient( {
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
	mutationCache: new MutationCache( {
		onSuccess: ( data, variables, context, mutation ) => {
			mutationSuccessCallback.forEach( ( callback ) => {
				callback( data, variables, context, mutation );
			} );
		},
		onError: ( error, variables, context, mutation ) => {
			mutationErrorCallback.forEach( ( callback ) => {
				callback( error, variables, context, mutation );
			} );
		},
	} ),
} );

const persister = createSyncStoragePersister( {
	storage: typeof window !== 'undefined' && ! isSupportSession() ? window.localStorage : null,
} );

const maxAge = 1000 * 60 * 60 * 24; // 24 hours

const [ , persistQueryClientPromise ] = persistQueryClient( {
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

export {
	queryClient,
	persistQueryClientPromise,
	registerMutationSuccessCallback,
	registerMutationErrorCallback,
};
