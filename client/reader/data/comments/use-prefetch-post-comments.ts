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
		( { siteId, postId }: { siteId: number; postId: number } ) =>
			queryClient.prefetchInfiniteQuery( siteCommentsInfiniteQuery( { siteId, postId } ) ),
		[ queryClient ]
	);
};
