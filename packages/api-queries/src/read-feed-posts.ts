import { fetchReadFeedPost } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const readFeedPostQuery = (
	feedId: number | string,
	postId: number | string,
	query?: Record< string, unknown >
) =>
	queryOptions( {
		queryKey: [ 'read', 'feed', Number( feedId ), 'posts', Number( postId ), query ],
		queryFn: () => fetchReadFeedPost( feedId, postId, query ),
		enabled: feedId != null && postId != null,
		staleTime: 1000 * 60,
		refetchOnWindowFocus: false,
	} );
