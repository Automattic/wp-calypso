import { siteCommentsInfiniteQuery } from '@automattic/api-queries';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

/**
 * Returns a function that warms the first page of a post's comments, so a view
 * opened soon after renders them without a loading state.
 */
export const usePrefetchPostComments = () => {
	const queryClient = useQueryClient();

	return useCallback(
		( { siteId, postId }: { siteId: number; postId: number } ) => {
			const query = siteCommentsInfiniteQuery( { siteId, postId } );
			// A failed query is always stale, so prefetching it would repeat the request on every hover.
			if ( queryClient.getQueryState( query.queryKey )?.status === 'error' ) {
				return;
			}
			queryClient.prefetchInfiniteQuery( query );
		},
		[ queryClient ]
	);
};
