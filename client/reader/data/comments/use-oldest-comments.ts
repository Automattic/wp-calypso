import { siteCommentsOldestFirstInfiniteQuery } from '@automattic/api-queries';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { mergeComments } from './normalization';

type UseOldestCommentsParams = {
	siteId?: number;
	postId?: number;
	status?: string;
	number?: number;
};

/**
 * Loads a post's comments forward from its first one, for oldest-first views of threads too long
 * to page back to the start through the newest-first query.
 */
export const useOldestComments = (
	{ siteId, postId, status = 'approved', number }: UseOldestCommentsParams,
	{ enabled = true }: { enabled?: boolean } = {}
) => {
	const query = useInfiniteQuery( {
		...siteCommentsOldestFirstInfiniteQuery( {
			siteId: siteId ?? 0,
			postId: postId ?? 0,
			status,
			number,
		} ),
		enabled: Boolean( enabled && siteId && postId ),
		retry: false,
	} );

	const comments = useMemo(
		() => mergeComments( query.data?.pages.map( ( page ) => page.comments ) ?? [] ),
		[ query.data?.pages ]
	);

	return {
		data: query.data,
		comments,
		hasNextPage: query.hasNextPage,
		isFetchingNextPage: query.isFetchingNextPage,
		fetchNextPage: query.fetchNextPage,
	};
};
