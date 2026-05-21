import { readRelatedPostsQuery } from '@automattic/api-queries';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { normalizePostsForCache, syncPostCache } from 'calypso/reader/data/post-cache-sync';
import readerContentWidth from 'calypso/reader/lib/content-width';
import type { ReadRelatedPostsResponse, ReadRelatedPostsScope } from '@automattic/api-core';
import type { QueryObserverResult, RefetchOptions } from '@tanstack/react-query';
import type { ReaderPost } from 'calypso/reader/data/post-cache';

export interface UseReaderRelatedPostsResult {
	posts: ReaderPost[] | undefined;
	isError: boolean;
	refetch: (
		options?: RefetchOptions
	) => Promise< QueryObserverResult< ReadRelatedPostsResponse, Error > >;
}

export const useReaderRelatedPosts = (
	siteId: number,
	postId: number,
	scope: ReadRelatedPostsScope
): UseReaderRelatedPostsResult => {
	const queryClient = useQueryClient();
	const contentWidth = readerContentWidth();
	const query = useQuery( readRelatedPostsQuery( siteId, postId, scope, 2, contentWidth ) );
	const fetchedPosts = useMemo(
		() => normalizePostsForCache( query.data?.posts ?? [] ),
		[ query.data?.posts ]
	);

	useEffect( () => {
		if ( query.data?.posts?.length ) {
			syncPostCache( queryClient, query.data.posts );
		}
	}, [ query.data?.posts, queryClient ] );

	return {
		posts: query.data ? fetchedPosts : undefined,
		isError: query.isError,
		refetch: query.refetch,
	};
};
