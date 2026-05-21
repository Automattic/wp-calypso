import { readerPostQuery } from '@automattic/api-queries';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import readerContentWidth from 'calypso/reader/lib/content-width';
import { useDispatch } from 'calypso/state';
import { useCachedReaderPost } from './post-cache';
import {
	normalizeReaderPostsForCache,
	syncReaderConversationFollowStatus,
	syncReaderPostCache,
} from './post-cache-sync';
import type { ReaderPost } from './post-cache';
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

export type ReaderPostResult = Omit< UseQueryResult< ReaderPost, Error >, 'data' > & {
	data: ReaderPost | undefined;
};

// UI-facing hook: returns the React Query result shape, with `data` resolved
// from the Reader post cache when available and fetched when missing.
export const useReaderPost = (
	postKey: Partial< ReadPostKey > | null | undefined
): ReaderPostResult => {
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
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
	const normalizedQueryPost = useMemo(
		() => ( query.data ? normalizeReaderPostsForCache( [ query.data ] )[ 0 ] : undefined ),
		[ query.data ]
	);

	useEffect( () => {
		if ( query.isSuccess && query.data ) {
			syncReaderPostCache( queryClient, [ query.data ] );
			syncReaderConversationFollowStatus( dispatch, [ query.data ] );
		}
	}, [ query.isSuccess, query.data, queryClient, dispatch ] );

	useEffect( () => {
		if ( ! query.isError || ! postKey ) {
			return;
		}
		syncReaderPostCache( queryClient, [ buildErrorPost( postKey, query.error ) ] );
	}, [ query.isError, query.error, postKey, queryClient ] );

	return {
		...query,
		data: cachedPost ?? normalizedQueryPost,
	};
};
