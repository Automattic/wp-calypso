import { siteCommentsInfiniteQuery } from '@automattic/api-queries';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

type PrefetchPostCommentsParams = {
	siteId: number;
	postId: number;
	status?: string;
};

/**
 * Returns a function that warms the first page of a post's comments, so a view
 * opened soon after renders them without a loading state.
 */
export const usePrefetchPostComments = () => {
	const queryClient = useQueryClient();

	return useCallback(
		( { siteId, postId, status = 'approved' }: PrefetchPostCommentsParams ) =>
			queryClient.prefetchInfiniteQuery( siteCommentsInfiniteQuery( { siteId, postId, status } ) ),
		[ queryClient ]
	);
};
