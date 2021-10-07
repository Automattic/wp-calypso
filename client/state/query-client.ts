import { throttle } from 'lodash';
import { QueryClient } from 'react-query';
import { persistQueryClient } from 'react-query/persistQueryClient-experimental';
import { shouldPersist, MAX_AGE, SERIALIZE_THROTTLE } from 'calypso/state/initial-state';
import { getPersistedStateItem, storePersistedStateItem } from 'calypso/state/persisted-state';

export async function createQueryClient( userId: number | undefined ): Promise< QueryClient > {
	const queryClient = new QueryClient();
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
		} );
	}
	return queryClient;
}
