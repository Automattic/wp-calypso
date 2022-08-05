import { throttle } from 'lodash';
import { QueryClient } from 'react-query';
import { persistQueryClient } from 'react-query/persistQueryClient-experimental';
import { shouldPersist, MAX_AGE, SERIALIZE_THROTTLE } from 'calypso/state/initial-state';
import { getPersistedStateItem, storePersistedStateItem } from 'calypso/state/persisted-state';
import { shouldDehydrateQuery } from './should-dehydrate-query';

let loggedOutQueryClient: QueryClient;
export async function getLoggedOutQueryClient(): Promise< QueryClient > {
	if ( loggedOutQueryClient ) {
		return loggedOutQueryClient;
	}
	return await createQueryClient();
}

export async function createQueryClient( userId?: number ): Promise< QueryClient > {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { cacheTime: MAX_AGE } },
	} );

	if ( 'undefined' === typeof userId ) {
		loggedOutQueryClient = queryClient;
	}

	if ( shouldPersist() ) {
		const storeKey = `query-state-${ userId ?? 'logged-out' }`;
		const persistor = {
			persistClient: throttle(
				( state ) => storePersistedStateItem( storeKey, state ),
				SERIALIZE_THROTTLE,
				{ leading: false, trailing: true }
			),
			restoreClient: () => getPersistedStateItem( storeKey ),
			removeClient: () => {
				// not implemented
			},
		};
		await persistQueryClient( {
			queryClient,
			persistor,
			maxAge: MAX_AGE,
			dehydrateOptions: {
				shouldDehydrateQuery,
			},
		} );
	}
	return queryClient;
}
