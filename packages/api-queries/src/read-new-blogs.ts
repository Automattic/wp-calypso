import { fetchReadNewBlogs } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';
import type { ReadNewBlogs } from '@automattic/api-core';

export const readNewBlogsQueryKey = [ 'read', 'new-blogs' ] as const;

const hasRecs = ( data: ReadNewBlogs | undefined ) => ( data?.recs.length ?? 0 ) > 0;

/**
 * The caller's "Discover new blogs" recs (READ-542). A non-empty snapshot
 * changes rarely (a one-time export for v0), so it's cached for 30 minutes and
 * persisted. An empty result is only cached briefly and never persisted, so a
 * user who gets recs later isn't kept on a stale empty answer.
 */
export const readNewBlogsQuery = () =>
	queryOptions( {
		queryKey: readNewBlogsQueryKey,
		queryFn: () => fetchReadNewBlogs(),
		staleTime: ( query ) => ( hasRecs( query.state.data ) ? 30 * 60 * 1000 : 5 * 60 * 1000 ),
		meta: { persist: hasRecs },
	} );
