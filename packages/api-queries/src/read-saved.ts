import {
	fetchReadSavedKeys,
	saveReadPost,
	unsaveReadPost,
	type ReadSavedKey,
	type ReadSavedKeyEntry,
	type ReadSavedKeysResponse,
	type ReadSavedPostParams,
	type ReadSavedPostResponse,
} from '@automattic/api-core';
import { mutationOptions, queryOptions, type QueryClient } from '@tanstack/react-query';
import { getStreamInfiniteQueryKeyPrefix } from './read-streams';

export const readSavedKeysQuery = () =>
	queryOptions( {
		queryKey: [ 'read', 'saved', 'keys' ],
		queryFn: () => fetchReadSavedKeys(),
		staleTime: 1000 * 60 * 5,
	} );

/**
 * A string that identifies a saved key, for comparing keys and building lookups.
 */
export const getReadSavedKeyId = ( key: ReadSavedKey ): string =>
	'feed_item_id' in key
		? `feed-item-${ key.feed_item_id }`
		: `blog-${ key.blog_id }-post-${ key.post_id }`;

const READ_SAVED_MUTATION_KEY = [ 'read', 'saved' ] as const;

interface RemovedSavedKey {
	entry: ReadSavedKeyEntry;
	index: number;
}

const findSavedKeyIndex = ( data: ReadSavedKeysResponse, key: ReadSavedKey ) => {
	const id = getReadSavedKeyId( key );
	return data.keys.findIndex( ( entry ) => getReadSavedKeyId( entry ) === id );
};

async function cancelSavedKeysQuery( queryClient: QueryClient ) {
	try {
		await queryClient.cancelQueries( { queryKey: readSavedKeysQuery().queryKey } );
	} catch {
		// Best effort: if this rejects, `onMutate` must still resolve so the
		// optimistic write and the request go ahead.
	}
}

/**
 * Optimistically add a key to the keys query. Returns whether it was added, so
 * a failed save undoes only its own change.
 */
function addSavedKey( queryClient: QueryClient, key: ReadSavedKey ): boolean {
	const queryKey = readSavedKeysQuery().queryKey;
	const data = queryClient.getQueryData( queryKey );
	if ( ! data || findSavedKeyIndex( data, key ) !== -1 ) {
		return false;
	}

	queryClient.setQueryData( queryKey, {
		keys: [ { ...key, date_saved: new Date().toISOString() }, ...data.keys ],
		total: data.total + 1,
	} );
	return true;
}

/**
 * Optimistically remove a key from the keys query. Returns what was removed, so
 * a failed unsave restores only its own change.
 */
function removeSavedKey(
	queryClient: QueryClient,
	key: ReadSavedKey
): RemovedSavedKey | undefined {
	const queryKey = readSavedKeysQuery().queryKey;
	const data = queryClient.getQueryData( queryKey );
	const index = data ? findSavedKeyIndex( data, key ) : -1;
	if ( ! data || index === -1 ) {
		return undefined;
	}

	queryClient.setQueryData( queryKey, {
		keys: data.keys.filter( ( _entry, i ) => i !== index ),
		total: Math.max( 0, data.total - 1 ),
	} );
	return { entry: data.keys[ index ], index };
}

function restoreSavedKey( queryClient: QueryClient, { entry, index }: RemovedSavedKey ) {
	const queryKey = readSavedKeysQuery().queryKey;
	const data = queryClient.getQueryData( queryKey );
	if ( ! data || findSavedKeyIndex( data, entry ) !== -1 ) {
		return;
	}

	const keys = [ ...data.keys ];
	keys.splice( index, 0, entry );
	queryClient.setQueryData( queryKey, { keys, total: data.total + 1 } );
}

function invalidateSaved( queryClient: QueryClient ) {
	// Saves on several cards can be in flight at once, each with its own
	// optimistic write. A refetch while another is in flight would overwrite
	// that write with server data from before it, so only the last to settle
	// refetches. `onSettled` runs while its own mutation still counts.
	if ( queryClient.isMutating( { mutationKey: READ_SAVED_MUTATION_KEY } ) > 1 ) {
		return;
	}

	void queryClient.invalidateQueries( { queryKey: readSavedKeysQuery().queryKey } );
	void queryClient.invalidateQueries( { queryKey: getStreamInfiniteQueryKeyPrefix( 'saved' ) } );
}

// Calypso boots its own QueryClient (see `client/state/query-client.ts`), so
// each mutation factory takes the caller's QueryClient. Pass `useQueryClient()`
// from the consuming component.

export const saveReadPostMutation = ( queryClient: QueryClient ) =>
	mutationOptions< ReadSavedPostResponse, Error, ReadSavedPostParams, { added: boolean } >( {
		meta: { statId: 'read-post-save' },
		mutationKey: [ ...READ_SAVED_MUTATION_KEY, 'new' ],
		mutationFn: saveReadPost,
		onMutate: async ( { key } ) => {
			await cancelSavedKeysQuery( queryClient );
			return { added: addSavedKey( queryClient, key ) };
		},
		onError: ( _error, { key }, context ) => {
			if ( context?.added ) {
				removeSavedKey( queryClient, key );
			}
		},
		onSettled: () => invalidateSaved( queryClient ),
	} );

export const unsaveReadPostMutation = ( queryClient: QueryClient ) =>
	mutationOptions<
		ReadSavedPostResponse,
		Error,
		ReadSavedPostParams,
		{ removed: RemovedSavedKey | undefined }
	>( {
		meta: { statId: 'read-post-unsave' },
		mutationKey: [ ...READ_SAVED_MUTATION_KEY, 'delete' ],
		mutationFn: unsaveReadPost,
		onMutate: async ( { key } ) => {
			await cancelSavedKeysQuery( queryClient );
			return { removed: removeSavedKey( queryClient, key ) };
		},
		onError: ( _error, _params, context ) => {
			if ( context?.removed ) {
				restoreSavedKey( queryClient, context.removed );
			}
		},
		onSettled: () => invalidateSaved( queryClient ),
	} );
