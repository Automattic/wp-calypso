import {
	getReadSavedKeyId,
	readSavedKeysQuery,
	saveReadPostMutation,
	unsaveReadPostMutation,
} from '@automattic/api-queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { savedKeyForPost, savedKeysForPost } from './saved-key-for-post';
import { getSavedKeyIds } from './use-saved-post-keys';
import type { ReadSavedKey, ReadSavedKeysResponse } from '@automattic/api-core';
import type { Post } from 'calypso/reader/data/post';

const SOURCE_READER_WEB = 'reader-web';

interface SavePostOptions {
	onSuccess?: () => void;
	onError?: ( error: Error ) => void;
}

/**
 * Save and unsave Reader posts. The keys query updates optimistically; pass
 * `onSuccess` / `onError` for notices and tracking. Posts without the IDs the
 * API needs are ignored.
 *
 * Unsaving removes every key the post is saved under, and calls back once all
 * the requests have finished.
 */
export function useSavePost() {
	const queryClient = useQueryClient();
	const { mutate: save, isPending: isSavePending } = useMutation(
		saveReadPostMutation( queryClient )
	);
	const { mutateAsync: unsaveKey } = useMutation( unsaveReadPostMutation( queryClient ) );
	// `mutate()` only calls back for its latest call, so the requests for a
	// post's keys run as one mutation.
	const { mutate: unsaveKeys, isPending: isUnsavePending } = useMutation( {
		mutationFn: async ( keys: ReadSavedKey[] ) => {
			const results = await Promise.allSettled(
				keys.map( ( key ) => unsaveKey( { key, source: SOURCE_READER_WEB } ) )
			);
			const failure = results.find(
				( result ): result is PromiseRejectedResult => result.status === 'rejected'
			);
			if ( failure ) {
				throw failure.reason;
			}
		},
	} );

	const savePost = useCallback(
		( post: Post, options?: SavePostOptions ) => {
			const key = savedKeyForPost( post );
			if ( key ) {
				save( { key, source: SOURCE_READER_WEB }, options );
			}
		},
		[ save ]
	);

	const unsavePost = useCallback(
		( post: Post, options?: SavePostOptions ) => {
			const keys = savedKeysForPost( post );
			if ( ! keys.length ) {
				return;
			}

			const data = queryClient.getQueryData< ReadSavedKeysResponse >(
				readSavedKeysQuery().queryKey
			);
			const savedKeys = data
				? keys.filter( ( key ) => getSavedKeyIds( data ).has( getReadSavedKeyId( key ) ) )
				: [];
			unsaveKeys( savedKeys.length ? savedKeys : keys.slice( 0, 1 ), options );
		},
		[ queryClient, unsaveKeys ]
	);

	return { savePost, unsavePost, isPending: isSavePending || isUnsavePending };
}
