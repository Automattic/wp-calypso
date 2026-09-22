import { fetchReadNewBlogs } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const readNewBlogsQueryKey = [ 'read', 'new-blogs' ] as const;

/**
 * The caller's "Discover new blogs" recs (READ-542). The snapshot changes
 * rarely (a one-time export for v0), so it's cached for the session.
 */
export const readNewBlogsQuery = () =>
	queryOptions( {
		queryKey: readNewBlogsQueryKey,
		queryFn: () => fetchReadNewBlogs(),
		staleTime: 30 * 60 * 1000,
	} );
