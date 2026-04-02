import { fetchPostLikes } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const POST_LIKES_REFETCH_INTERVAL = 1000 * 120; // 2 minutes

export const postLikesQuery = ( siteId?: number | null, postId?: number | null ) => {
	return queryOptions( {
		queryKey: [ 'site', siteId, 'post', postId, 'likes' ],
		staleTime: POST_LIKES_REFETCH_INTERVAL,
		refetchInterval: POST_LIKES_REFETCH_INTERVAL,
		queryFn: () => fetchPostLikes( siteId!, postId! ),
		enabled: !! siteId && !! postId,
	} );
};
