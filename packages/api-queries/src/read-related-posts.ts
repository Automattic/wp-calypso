import { fetchReadRelatedPosts } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';
import type { ReadRelatedPostsScope } from '@automattic/api-core';

export const readRelatedPostsQuery = (
	siteId: number | null | undefined,
	postId: number | null | undefined,
	scope: ReadRelatedPostsScope = 'all',
	size: number = 2,
	contentWidth?: number
) => {
	return queryOptions( {
		queryKey: [ 'read', 'related-posts', siteId, postId, scope, size, contentWidth ],
		queryFn: () =>
			fetchReadRelatedPosts( {
				siteId: siteId!,
				postId: postId!,
				scope,
				size,
				contentWidth,
			} ),
		staleTime: 5 * 60 * 1000,
		enabled: siteId != null && postId != null,
	} );
};
