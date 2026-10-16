import { saveReadPostMutation, unsaveReadPostMutation } from '@automattic/api-queries';
import { useMutation, useQueryClient, type MutateOptions } from '@tanstack/react-query';
import { useCallback } from 'react';
import { savedKeyForPost } from './saved-key-for-post';
import type { ReadSavedPostParams, ReadSavedPostResponse } from '@automattic/api-core';
import type { Post } from 'calypso/reader/data/post';

const SOURCE_READER_WEB = 'reader-web';

type SavePostOptions = MutateOptions< ReadSavedPostResponse, Error, ReadSavedPostParams, unknown >;

/**
 * Save and unsave Reader posts. The keys query updates optimistically; pass
 * `onSuccess` / `onError` for notices and tracking. Posts without the IDs the
 * API needs are ignored.
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
			const key = savedKeyForPost( post );
			if ( key ) {
				unsave( { key, source: SOURCE_READER_WEB }, options );
			}
		},
		[ unsave ]
	);

	return { savePost, unsavePost, isPending: isSavePending || isUnsavePending };
}
