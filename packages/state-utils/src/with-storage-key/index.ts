/**
 * External dependencies
 */
import type { Reducer } from 'redux';

type StorageKeyReducer< T extends Reducer > = T & {
	storageKey: string;
};

const withStorageKey = < T extends Reducer >(
	storageKey: string,
	reducer: T
): StorageKeyReducer< T > => {
	( reducer as StorageKeyReducer< T > ).storageKey = storageKey;
	return reducer as StorageKeyReducer< T >;
};

export default withStorageKey;
