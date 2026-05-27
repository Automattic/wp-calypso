import { readerPostQuery } from '@automattic/api-queries';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import readerContentWidth from 'calypso/reader/lib/content-width';
import { useDispatch } from 'calypso/state';
import { syncConversationFollowStatus, syncPostCache, useCachedPost } from './cache';
import { usePostQuery } from './query';
import type { Post } from './cache';
import type { ReadPostKey } from '@automattic/api-core';
import type { UseQueryResult } from '@tanstack/react-query';

const buildErrorPost = ( postKey: Partial< ReadPostKey >, error: unknown ) => {
	const blogId = ( postKey as { blogId?: number } ).blogId;
	const feedId = ( postKey as { feedId?: number } ).feedId;
	const postId = postKey.postId as number | undefined;

	// Deterministic so that re-runs of the error effect (e.g. when the parent
	// passes a new postKey object literal each render) overwrite the same
	// canonical cache entry instead of accumulating duplicate error posts.
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

export type PostResult = Omit< UseQueryResult< Post | undefined, Error >, 'data' > & {
	data: Post | undefined;
};

// UI-facing hook: returns the React Query result shape, with `data` resolved
// from the Reader post cache when available and fetched when missing.
export const usePost = ( postKey: Partial< ReadPostKey > | null | undefined ): PostResult => {
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
	const cachedPost = useCachedPost( postKey );
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
	const query = usePostQuery(
		{
			...queryOptions,
			enabled: queryOptions.enabled !== false && shouldFetch,
		},
		( post ) => post,
		{
			onPostsSynced: ( posts ) => syncConversationFollowStatus( dispatch, posts ),
		}
	);

	useEffect( () => {
		if ( ! query.isError || ! postKey ) {
			return;
		}
		syncPostCache( queryClient, [ buildErrorPost( postKey, query.error ) ] );
	}, [ query.isError, query.error, postKey, queryClient ] );

	return {
		...query,
		data: cachedPost ?? query.data,
	};
};

export * from './cache';
export * from './likes';
export * from './middleware';
export * from './query';
