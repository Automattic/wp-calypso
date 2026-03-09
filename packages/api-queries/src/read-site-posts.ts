import { fetchReadSitePost } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const readSitePostQuery = (
	blogId: number,
	postId: number,
	query?: Record< string, unknown >
) => {
	return queryOptions( {
		queryKey: [ 'read', 'site', Number( blogId ), 'posts', Number( postId ), query ],
		queryFn: () => fetchReadSitePost( blogId, postId, query ),
		enabled: blogId != null && postId != null,
		staleTime: 1000 * 60, // 1 minute
		refetchOnWindowFocus: false,
	} );
};
