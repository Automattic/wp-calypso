import { getReadSavedKeyId, readSavedKeysQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { savedKeysForPost } from './saved-key-for-post';
import type { ReadSavedKeysResponse } from '@automattic/api-core';
import type { Post } from 'calypso/reader/data/post';

type SavedPostKeysQueryOptions = {
	enabled?: boolean;
};

/**
 * Every key the current user has saved, newest first.
 */
export function useSavedPostKeys( options?: SavedPostKeysQueryOptions ) {
	return useQuery( { ...readSavedKeysQuery(), ...options } );
}

// Every card reads the same keys response, so build its lookup once and share it.
const savedKeyIdsByResponse = new WeakMap< ReadSavedKeysResponse, Set< string > >();

/**
 * The `getReadSavedKeyId()` of every key in the response.
 */
export function getSavedKeyIds( data: ReadSavedKeysResponse ) {
	let ids = savedKeyIdsByResponse.get( data );
	if ( ! ids ) {
		ids = new Set( data.keys.map( getReadSavedKeyId ) );
		savedKeyIdsByResponse.set( data, ids );
	}
	return ids;
}

/**
 * Whether the current user has saved the post: `undefined` until the saved keys
 * load, and `false` for a post the API can't save. Reflects a save or unsave as
 * soon as it starts, since the mutations update the keys query optimistically.
 */
export function useIsPostSaved(
	post: Post | null | undefined,
	options?: SavedPostKeysQueryOptions
): boolean | undefined {
	const [ keyId = null, otherKeyId = null ] = post
		? savedKeysForPost( post ).map( getReadSavedKeyId )
		: [];
	// Selecting a boolean means a card only re-renders when its own post flips.
	const select = useCallback(
		( data: ReadSavedKeysResponse ) => {
			const ids = getSavedKeyIds( data );
			return (
				( keyId !== null && ids.has( keyId ) ) || ( otherKeyId !== null && ids.has( otherKeyId ) )
			);
		},
		[ keyId, otherKeyId ]
	);
	const { data: isSaved } = useQuery( {
		...readSavedKeysQuery(),
		...options,
		select,
		enabled: keyId !== null && ( options?.enabled ?? true ),
	} );

	return keyId === null ? false : isSaved;
}
