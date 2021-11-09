import { Query } from 'react-query';

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

export const shouldDehydrateQuery = ( query: Query ): boolean => {
	if ( query.state.status !== 'success' ) {
		return false;
	}

	const shouldPersistQuery = query.meta?.[ SHOULD_PERSIST_QUERY_KEY ];

	if ( hasPersistenceSetting( shouldPersistQuery ) ) {
		return shouldPersistQuery;
	}

	if ( hasPersistenceCustomSetting( shouldPersistQuery ) ) {
		return shouldPersistQuery( query.state.data );
	}

	return true;
};
