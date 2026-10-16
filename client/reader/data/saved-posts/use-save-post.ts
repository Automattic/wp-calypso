import { saveReadPostMutation, unsaveReadPostMutation } from '@automattic/api-queries';
import { useMutation, useQueryClient, type MutateOptions } from '@tanstack/react-query';
import { useMemo } from 'react';
import { savedKeyForPost } from './saved-key-for-post';
import type { ReadSavedPostParams, ReadSavedPostResponse } from '@automattic/api-core';
import type { Post } from 'calypso/reader/data/post';

const SOURCE_READER_WEB = 'reader-web';

type SavePostOptions = MutateOptions< ReadSavedPostResponse, Error, ReadSavedPostParams, unknown >;

type SavedPostMutate = ( params: ReadSavedPostParams, options?: SavePostOptions ) => void;

// Posts without the IDs the API needs are ignored.
const forPost = ( mutate: SavedPostMutate ) => ( post: Post, options?: SavePostOptions ) => {
	const key = savedKeyForPost( post );
	if ( key ) {
		mutate( { key, source: SOURCE_READER_WEB }, options );
	}
};

/**
 * Save and unsave Reader posts. The keys query updates optimistically; pass
 * `onSuccess` / `onError` for notices and tracking.
 */
export function useSavePost() {
	const queryClient = useQueryClient();
	const { mutate: save, isPending: isSavePending } = useMutation(
		saveReadPostMutation( queryClient )
	);
	const { mutate: unsave, isPending: isUnsavePending } = useMutation(
		unsaveReadPostMutation( queryClient )
	);

	const savePost = useMemo( () => forPost( save ), [ save ] );
	const unsavePost = useMemo( () => forPost( unsave ), [ unsave ] );

	return { savePost, unsavePost, isPending: isSavePending || isUnsavePending };
}
