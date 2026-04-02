import { fetchPostLikes } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const postLikesQuery = ( siteId?: number | null, postId?: number | null ) => {
	return queryOptions( {
		queryKey: [ 'site', siteId, 'post', postId, 'likes' ],
		staleTime: 1000 * 120,
		queryFn: () => fetchPostLikes( siteId!, postId! ),
		enabled: !! siteId && !! postId,
	} );
};
