import { useMemo } from 'react';
import { buildCommentsTree, filterComments, mergeComments } from './normalization';
import { usePostCommentsQuery, type UseCommentsOptions } from './use-post-comments-query';

type UseCommentsParams = {
	siteId?: number;
	postId?: number;
	status?: string;
	displayStatus?: string;
	authorId?: number;
	number?: number;
	commentTotal?: number;
};

/**
 * Loads and derives the paginated comment list for a Reader post.
 *
 * The REST endpoint returns pages in API order, but Reader components consume a
 * chronological `comments` array, a legacy-shaped parent/child `commentsTree`,
 * and legacy fetch-status names for "earlier" and "later" pagination controls.
 */
export const useComments = (
	{
		siteId,
		postId,
		status = 'approved',
		displayStatus = status,
		authorId,
		number,
		commentTotal,
	}: UseCommentsParams,
	{ enabled = true, retry = false }: UseCommentsOptions = {}
) => {
	const query = usePostCommentsQuery( { siteId, postId, status, number }, { enabled, retry } );

	const comments = useMemo(
		() => mergeComments( query.data?.pages.map( ( page ) => page.comments ) ?? [] ),
		[ query.data?.pages ]
	);
	const displayedComments = useMemo(
		() => filterComments( comments, displayStatus, authorId ),
		[ authorId, comments, displayStatus ]
	);
	const commentsTree = useMemo(
		() => buildCommentsTree( displayedComments ),
		[ displayedComments ]
	);
	const found = query.data?.pages[ 0 ]?.found ?? commentTotal ?? 0;
	const hasMoreComments = found > comments.length;
	const pageParams = query.data?.pageParams ?? [];
	const hasReceivedBefore = pageParams.some(
		( pageParam ) => ! pageParam || pageParam.direction === 'before'
	);
	const hasReceivedAfter = pageParams.some( ( pageParam ) => pageParam?.direction === 'after' );

	return {
		...query,
		comments,
		commentsTree,
		commentsFetchingStatus: {
			haveEarlierCommentsToFetch:
				query.hasNextPage && hasMoreComments && ! query.isFetchingNextPage,
			haveLaterCommentsToFetch:
				query.hasPreviousPage && hasMoreComments && ! query.isFetchingPreviousPage,
			hasReceivedBefore,
			hasReceivedAfter,
		},
		found,
		fetchEarlierComments: query.fetchNextPage,
		fetchLaterComments: query.fetchPreviousPage,
	};
};
