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

/**
 * Saves and unsaves that have started but not settled, per QueryClient.
 *
 * Saves on several cards can be in flight at once, each with its own
 * optimistic write. A refetch while another is in flight would overwrite that
 * write with server data from before it, so only the last write to settle
 * refetches. This counts writes itself rather than asking `isMutating()`:
 * writes that settle in the same tick each still see the others as pending,
 * so none of them would refetch.
 *
 * `latest` holds the newest write to each key. Only that write may roll back,
 * so an older failure can't undo a newer save or unsave of the same post. When
 * several writes to one post fail, the refetch after the last one settles
 * corrects what's shown.
 */
interface SavedWrites {
	pending: number;
	latest: Map< string, symbol >;
}

const savedWritesByClient = new WeakMap< QueryClient, SavedWrites >();

function getSavedWrites( queryClient: QueryClient ): SavedWrites {
	let writes = savedWritesByClient.get( queryClient );
	if ( ! writes ) {
		writes = { pending: 0, latest: new Map() };
		savedWritesByClient.set( queryClient, writes );
	}
	return writes;
}

function startSavedWrite( queryClient: QueryClient, key: ReadSavedKey ): symbol {
	const writes = getSavedWrites( queryClient );
	const write = Symbol( 'saved write' );
	writes.pending++;
	writes.latest.set( getReadSavedKeyId( key ), write );
	return write;
}

function isLatestSavedWrite( queryClient: QueryClient, key: ReadSavedKey, write?: symbol ) {
	return !! write && getSavedWrites( queryClient ).latest.get( getReadSavedKeyId( key ) ) === write;
}

function settleSavedWrite( queryClient: QueryClient, key: ReadSavedKey, write?: symbol ) {
	const writes = getSavedWrites( queryClient );
	if ( isLatestSavedWrite( queryClient, key, write ) ) {
		writes.latest.delete( getReadSavedKeyId( key ) );
	}

	writes.pending = Math.max( 0, writes.pending - 1 );
	if ( writes.pending > 0 ) {
		return;
	}

	void queryClient.invalidateQueries( { queryKey: readSavedKeysQuery().queryKey } );
	void queryClient.invalidateQueries( { queryKey: getStreamInfiniteQueryKeyPrefix( 'saved' ) } );
}

// Calypso boots its own QueryClient (see `client/state/query-client.ts`), so
// each mutation factory takes the caller's QueryClient. Pass `useQueryClient()`
// from the consuming component.

export const saveReadPostMutation = ( queryClient: QueryClient ) =>
	mutationOptions<
		ReadSavedPostResponse,
		Error,
		ReadSavedPostParams,
		{ write: symbol; added: boolean }
	>( {
		meta: { statId: 'read-post-save' },
		mutationFn: saveReadPost,
		onMutate: async ( { key } ) => {
			const write = startSavedWrite( queryClient, key );
			await cancelSavedKeysQuery( queryClient );
			return { write, added: addSavedKey( queryClient, key ) };
		},
		onError: ( _error, { key }, context ) => {
			if ( context?.added && isLatestSavedWrite( queryClient, key, context.write ) ) {
				removeSavedKey( queryClient, key );
			}
		},
		onSettled: ( _data, _error, { key }, context ) =>
			settleSavedWrite( queryClient, key, context?.write ),
	} );

export const unsaveReadPostMutation = ( queryClient: QueryClient ) =>
	mutationOptions<
		ReadSavedPostResponse,
		Error,
		ReadSavedPostParams,
		{ write: symbol; removed: RemovedSavedKey | undefined }
	>( {
		meta: { statId: 'read-post-unsave' },
		mutationFn: unsaveReadPost,
		onMutate: async ( { key } ) => {
			const write = startSavedWrite( queryClient, key );
			await cancelSavedKeysQuery( queryClient );
			return { write, removed: removeSavedKey( queryClient, key ) };
		},
		onError: ( _error, { key }, context ) => {
			if ( context?.removed && isLatestSavedWrite( queryClient, key, context.write ) ) {
				restoreSavedKey( queryClient, context.removed );
			}
		},
		onSettled: ( _data, _error, { key }, context ) =>
			settleSavedWrite( queryClient, key, context?.write ),
	} );
