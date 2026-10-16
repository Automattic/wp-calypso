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

const savedKeysQueryKey = readSavedKeysQuery().queryKey;

const findSavedKeyIndex = ( data: ReadSavedKeysResponse, key: ReadSavedKey ) => {
	const id = getReadSavedKeyId( key );
	return data.keys.findIndex( ( entry ) => getReadSavedKeyId( entry ) === id );
};

async function cancelSavedKeysQuery( queryClient: QueryClient ) {
	try {
		await queryClient.cancelQueries( { queryKey: savedKeysQueryKey } );
	} catch {
		// Best effort: if this rejects, `onMutate` must still resolve so the
		// optimistic write and the request go ahead.
	}
}

/**
 * Optimistically insert an entry into the keys query, unless its key is
 * already there. Returns whether it was inserted.
 */
function insertSavedKey( queryClient: QueryClient, entry: ReadSavedKeyEntry, index = 0 ) {
	const data = queryClient.getQueryData( savedKeysQueryKey );
	if ( ! data || findSavedKeyIndex( data, entry ) !== -1 ) {
		return false;
	}

	const keys = [ ...data.keys ];
	keys.splice( index, 0, entry );
	queryClient.setQueryData( savedKeysQueryKey, { keys, total: data.total + 1 } );
	return true;
}

/**
 * Optimistically remove a key from the keys query. Returns how to put it back
 * where it was, or nothing if the key wasn't there.
 */
function removeSavedKey( queryClient: QueryClient, key: ReadSavedKey ) {
	const data = queryClient.getQueryData( savedKeysQueryKey );
	if ( ! data ) {
		return undefined;
	}
	const index = findSavedKeyIndex( data, key );
	if ( index === -1 ) {
		return undefined;
	}

	const entry = data.keys[ index ];
	queryClient.setQueryData( savedKeysQueryKey, {
		keys: data.keys.filter( ( _entry, i ) => i !== index ),
		total: Math.max( 0, data.total - 1 ),
	} );
	return () => {
		insertSavedKey( queryClient, entry, index );
	};
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

interface SavedWriteContext {
	write: symbol;
	undo?: () => void;
}

/**
 * The lifecycle saves and unsaves share. `apply` makes the optimistic change
 * and returns how to undo it, or nothing if it changed nothing.
 */
function savedWriteCallbacks(
	queryClient: QueryClient,
	apply: ( key: ReadSavedKey ) => ( () => void ) | undefined
) {
	return {
		onMutate: async ( { key }: ReadSavedPostParams ): Promise< SavedWriteContext > => {
			const writes = getSavedWrites( queryClient );
			const write = Symbol( 'saved write' );
			writes.pending++;
			writes.latest.set( getReadSavedKeyId( key ), write );

			await cancelSavedKeysQuery( queryClient );
			return { write, undo: apply( key ) };
		},
		onError: ( _error: Error, { key }: ReadSavedPostParams, context?: SavedWriteContext ) => {
			const isLatest =
				!! context &&
				getSavedWrites( queryClient ).latest.get( getReadSavedKeyId( key ) ) === context.write;
			if ( isLatest ) {
				context.undo?.();
			}
		},
		onSettled: (
			_data: ReadSavedPostResponse | undefined,
			_error: Error | null,
			{ key }: ReadSavedPostParams,
			context?: SavedWriteContext
		) => {
			const writes = getSavedWrites( queryClient );
			const id = getReadSavedKeyId( key );
			if ( context && writes.latest.get( id ) === context.write ) {
				writes.latest.delete( id );
			}

			writes.pending = Math.max( 0, writes.pending - 1 );
			if ( writes.pending > 0 ) {
				return;
			}

			void queryClient.invalidateQueries( { queryKey: savedKeysQueryKey } );
			void queryClient.invalidateQueries( {
				queryKey: getStreamInfiniteQueryKeyPrefix( 'saved' ),
			} );
		},
	};
}

// Calypso boots its own QueryClient (see `client/state/query-client.ts`), so
// each mutation factory takes the caller's QueryClient. Pass `useQueryClient()`
// from the consuming component.

export const saveReadPostMutation = ( queryClient: QueryClient ) =>
	mutationOptions< ReadSavedPostResponse, Error, ReadSavedPostParams, SavedWriteContext >( {
		meta: { statId: 'read-post-save' },
		mutationFn: saveReadPost,
		...savedWriteCallbacks( queryClient, ( key ) =>
			insertSavedKey( queryClient, { ...key, date_saved: new Date().toISOString() } )
				? () => removeSavedKey( queryClient, key )
				: undefined
		),
	} );

export const unsaveReadPostMutation = ( queryClient: QueryClient ) =>
	mutationOptions< ReadSavedPostResponse, Error, ReadSavedPostParams, SavedWriteContext >( {
		meta: { statId: 'read-post-unsave' },
		mutationFn: unsaveReadPost,
		...savedWriteCallbacks( queryClient, ( key ) => removeSavedKey( queryClient, key ) ),
	} );
