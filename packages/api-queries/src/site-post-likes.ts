import { fetchPostLikes } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const postLikesQuery = ( siteId?: number, postId?: number ) => {
	return queryOptions( {
		queryKey: [ 'site', siteId, 'post', postId, 'likes' ],
		staleTime: 1000 * 120,
		queryFn: () => fetchPostLikes( siteId!, postId! ),
		enabled: !! siteId && !! postId,
	} );
};
