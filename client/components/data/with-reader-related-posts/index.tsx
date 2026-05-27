import { readRelatedPostsQuery } from '@automattic/api-queries';
import { usePostsQuery } from 'calypso/reader/data/post/query';
import readerContentWidth from 'calypso/reader/lib/content-width';
import type { ReadRelatedPostsScope } from '@automattic/api-core';
import type { UseQueryResult } from '@tanstack/react-query';
import type { Post } from 'calypso/reader/data/post/cache';

export interface RelatedPostsResult {
	posts: Post[] | undefined;
	isError: boolean;
	refetch: UseQueryResult< Post[], Error >[ 'refetch' ];
}

export const useRelatedPosts = (
	siteId: number,
	postId: number,
	scope: ReadRelatedPostsScope
): RelatedPostsResult => {
	const contentWidth = readerContentWidth();
	const query = usePostsQuery(
		readRelatedPostsQuery( siteId, postId, scope, 2, contentWidth ),
		( data ) => data.posts
	);

	return {
		posts: query.data,
		isError: query.isError,
		refetch: query.refetch,
	};
};
