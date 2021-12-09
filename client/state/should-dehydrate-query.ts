import { Query } from 'react-query';

type PersistencePredicate< T > = ( data: T ) => boolean;

const hasSimplePersistence = ( value: unknown ): value is boolean => {
	return typeof value === 'boolean';
};

const hasPersistencePredicate = ( value: unknown ): value is PersistencePredicate< unknown > => {
	return typeof value === 'function';
};

export const shouldDehydrateQuery = ( query: Query ): boolean => {
	if ( query.state.status !== 'success' ) {
		return false;
	}

	const shouldPersist = query.meta?.persist;

	if ( hasSimplePersistence( shouldPersist ) ) {
		return shouldPersist;
	}

	if ( hasPersistencePredicate( shouldPersist ) ) {
		return shouldPersist( query.state.data );
	}

	return true;
};
