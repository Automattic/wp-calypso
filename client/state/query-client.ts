import { throttle } from 'lodash';
import { QueryClient } from 'react-query';
import { persistQueryClient } from 'react-query/persistQueryClient-experimental';
import { shouldPersist, MAX_AGE, SERIALIZE_THROTTLE } from 'calypso/state/initial-state';
import { getPersistedStateItem, storePersistedStateItem } from 'calypso/state/persisted-state';

const SHOULD_PERSIST_QUERY_KEY = 'shouldPersistQuery';

type PersistencePredicate< T > = ( data: T ) => boolean;

type PersistenceMetaPartial< T > = {
	[ SHOULD_PERSIST_QUERY_KEY ]: PersistencePredicate< T > | boolean;
};

const hasPersistenceSetting = ( value: unknown ): value is boolean => {
	return typeof value === 'boolean';
};

const hasPersistenceCustomSetting = (
	value: unknown
): value is PersistencePredicate< unknown > => {
	return typeof value === 'function';
};

export const shouldPersistQuery = < T >(
	predicate: PersistencePredicate< T > | boolean
): PersistenceMetaPartial< T > => ( {
	[ SHOULD_PERSIST_QUERY_KEY ]: predicate,
} );

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
				shouldDehydrateQuery: ( query ) => {
					if ( query.state.status !== 'success' ) {
						return false;
					}

					const shouldPersist = query.meta?.[ SHOULD_PERSIST_QUERY_KEY ];

					if ( hasPersistenceSetting( shouldPersist ) ) {
						return shouldPersist;
					}

					if ( hasPersistenceCustomSetting( shouldPersist ) ) {
						return shouldPersist( query.state.data );
					}

					return true;
				},
			},
		} );
	}
	return queryClient;
}
