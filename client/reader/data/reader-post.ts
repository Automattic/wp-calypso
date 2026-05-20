import { readerPostQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import readerContentWidth from 'calypso/reader/lib/content-width';
import { useDispatch } from 'calypso/state';
import { READER_POSTS_RECEIVE } from 'calypso/state/reader/action-types';
import { receivePosts } from 'calypso/state/reader/posts/actions';
import { useCachedReaderPost } from './reader-post-cache';
import type { ReaderPostCachePost } from './reader-post-cache';
import type { ReadPostKey } from '@automattic/api-core';
import type { UseQueryResult } from '@tanstack/react-query';

const buildErrorPost = ( postKey: Partial< ReadPostKey >, error: unknown ) => {
	const blogId = ( postKey as { blogId?: number } ).blogId;
	const feedId = ( postKey as { feedId?: number } ).feedId;
	const postId = postKey.postId as number | undefined;

	// Deterministic so that re-runs of the error effect (e.g. when the parent
	// passes a new postKey object literal each render) overwrite the same entry
	// in the posts reducer (keyed by global_ID) instead of accumulating dupes.
	const globalId = `error-${ blogId ?? feedId }-${ postId }`;

	return {
		feed_ID: feedId,
		ID: postId,
		site_ID: blogId,
		is_external: ! blogId,
		global_ID: globalId,
		is_error: true,
		feed_item_ID: postId,
		error,
	};
};

export type ReaderPostResult = Omit< UseQueryResult< ReaderPostCachePost, Error >, 'data' > & {
	data: ReaderPostCachePost | undefined;
};

// UI-facing hook: returns the React Query result shape, with `data` resolved
// from the Reader post cache when available and fetched when missing.
export const useReaderPost = (
	postKey: Partial< ReadPostKey > | null | undefined
): ReaderPostResult => {
	const dispatch = useDispatch();
	const cachedPost = useCachedReaderPost( postKey );
	const hasRenderablePostContent = !! (
		cachedPost?.content ||
		cachedPost?.excerpt ||
		cachedPost?.better_excerpt ||
		cachedPost?.use_excerpt
	);
	const shouldFetch =
		! cachedPost ||
		cachedPost._state === 'minimal' ||
		( ! cachedPost.is_error && ! hasRenderablePostContent );

	const queryOptions = readerPostQuery( postKey, readerContentWidth() );
	const query = useQuery( {
		...queryOptions,
		enabled: queryOptions.enabled !== false && shouldFetch,
	} );

	useEffect( () => {
		if ( query.data ) {
			dispatch( receivePosts( [ query.data ] ) );
		}
	}, [ query.data, dispatch ] );

	// Dispatch the raw action to bypass `receivePosts`' normalization, which
	// doesn't apply to a post that never loaded.
	useEffect( () => {
		if ( ! query.isError || ! postKey ) {
			return;
		}
		dispatch( {
			type: READER_POSTS_RECEIVE,
			posts: [ buildErrorPost( postKey, query.error ) ],
		} );
	}, [ query.isError, query.error, postKey, dispatch ] );

	return {
		...query,
		data: cachedPost ?? query.data,
	};
};
