import { throttle } from 'lodash';
import { QueryClient } from 'react-query';
import { persistQueryClient } from 'react-query/persistQueryClient-experimental';
import { shouldPersist, MAX_AGE, SERIALIZE_THROTTLE } from 'calypso/state/initial-state';
import { getPersistedStateItem, storePersistedStateItem } from 'calypso/state/persisted-state';
import { shouldDehydrateQuery, shouldPersistQuery } from './should-dehydrate-query';

export async function createQueryClient( userId: number | undefined ): Promise< QueryClient > {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { cacheTime: MAX_AGE } },
	} );

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

export { shouldPersistQuery };
