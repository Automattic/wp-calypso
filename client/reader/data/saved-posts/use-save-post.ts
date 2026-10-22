import {
	getReadSavedKeyId,
	readSavedKeysQuery,
	saveReadPostMutation,
	unsaveReadPostMutation,
} from '@automattic/api-queries';
import { useMutation, useQueryClient, type MutateOptions } from '@tanstack/react-query';
import { useCallback } from 'react';
import { savedKeyForPost, savedKeysForPost } from './saved-key-for-post';
import type {
	ReadSavedKeysResponse,
	ReadSavedPostParams,
	ReadSavedPostResponse,
} from '@automattic/api-core';
import type { Post } from 'calypso/reader/data/post';

const SOURCE_READER_WEB = 'reader-web';

type SavePostOptions = MutateOptions< ReadSavedPostResponse, Error, ReadSavedPostParams, unknown >;

/**
 * Save and unsave Reader posts. The keys query updates optimistically; pass
 * `onSuccess` / `onError` for notices and tracking. Posts without the IDs the
 * API needs are ignored.
 *
 * Unsaving removes every key the post is saved under, and calls the callbacks
 * once for each.
 */
export function useSavePost() {
	const queryClient = useQueryClient();
	const { mutate: save, isPending: isSavePending } = useMutation(
		saveReadPostMutation( queryClient )
	);
	const { mutate: unsave, isPending: isUnsavePending } = useMutation(
		unsaveReadPostMutation( queryClient )
	);

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
			const savedIds = new Set(
				queryClient
					.getQueryData< ReadSavedKeysResponse >( readSavedKeysQuery().queryKey )
					?.keys.map( getReadSavedKeyId )
			);
			const savedKeys = keys.filter( ( key ) => savedIds.has( getReadSavedKeyId( key ) ) );
			for ( const key of savedKeys.length ? savedKeys : keys.slice( 0, 1 ) ) {
				unsave( { key, source: SOURCE_READER_WEB }, options );
			}
		},
		[ queryClient, unsave ]
	);

	return { savePost, unsavePost, isPending: isSavePending || isUnsavePending };
}
