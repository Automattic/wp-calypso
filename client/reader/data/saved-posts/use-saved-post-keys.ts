import { getReadSavedKeyId, readSavedKeysQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { savedKeyForPost } from './saved-key-for-post';
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

// Module-level so each observer only rebuilds the set when the keys change.
const selectSavedKeyIds = ( data: ReadSavedKeysResponse ) =>
	new Set( data.keys.map( getReadSavedKeyId ) );

/**
 * Whether the current user has saved the post. Reflects a save or unsave as
 * soon as it starts, since the mutations update the keys query optimistically.
 */
export function useIsPostSaved(
	post: Post | null | undefined,
	options?: SavedPostKeysQueryOptions
): boolean {
	const key = post ? savedKeyForPost( post ) : null;
	const { data: savedKeyIds } = useQuery( {
		...readSavedKeysQuery(),
		...options,
		select: selectSavedKeyIds,
		enabled: !! key && ( options?.enabled ?? true ),
	} );

	return !! key && !! savedKeyIds?.has( getReadSavedKeyId( key ) );
}
