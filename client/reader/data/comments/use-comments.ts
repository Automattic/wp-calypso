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
	oldestFirst?: boolean;
};

const noop = async () => {};

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
		oldestFirst = false,
	}: UseCommentsParams,
	options: UseCommentsOptions = {}
) => {
	const query = usePostCommentsQuery( { siteId, postId, status, number }, options );

	const newestFirstComments = useMemo(
		() => mergeComments( query.data?.pages.map( ( page ) => page.comments ) ?? [] ),
		[ query.data?.pages ]
	);

	// A thread that's all loaded sorts in place. A longer one loads its start in one request instead
	// of paging back through every newer comment.
	const needsOldestQuery = oldestFirst && Boolean( query.hasNextPage );
	const oldestQuery = usePostCommentsQuery(
		{ siteId, postId, status, number, order: 'ASC' },
		{ ...options, enabled: needsOldestQuery && ( options.enabled ?? true ) }
	);
	const oldestFirstComments = useMemo(
		() =>
			needsOldestQuery && oldestQuery.data
				? mergeComments( oldestQuery.data.pages.map( ( page ) => page.comments ) )
				: null,
		[ needsOldestQuery, oldestQuery.data ]
	);
	const comments = oldestFirstComments ?? newestFirstComments;
	const displayedComments = useMemo(
		() => filterComments( comments, displayStatus, authorId ),
		[ authorId, comments, displayStatus ]
	);
	const commentsTree = useMemo(
		() => buildCommentsTree( displayedComments ),
		[ displayedComments ]
	);
	const pageParams = query.data?.pageParams ?? [];
	// Cursor pages count only the comments past their cursor, so only the first page has the total.
	const firstPage = query.data?.pages[ pageParams.findIndex( ( pageParam ) => ! pageParam ) ];
	const found = firstPage?.found ?? commentTotal ?? 0;
	const hasMoreComments = found > newestFirstComments.length;
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
				! oldestFirstComments && query.hasNextPage && hasMoreComments && ! query.isFetchingNextPage,
			haveLaterCommentsToFetch: oldestFirstComments
				? oldestQuery.hasNextPage && ! oldestQuery.isFetchingNextPage
				: query.hasPreviousPage && hasMoreComments && ! query.isFetchingPreviousPage,
			hasReceivedBefore,
			hasReceivedAfter,
		},
		found,
		// Until the first comments arrive, the list keeps its order rather than flash the wrong window.
		// If they can't load, the comments already here still flip.
		isOldestFirst:
			oldestFirst &&
			( ! needsOldestQuery || Boolean( oldestFirstComments ) || oldestQuery.isError ),
		fetchEarlierComments: oldestFirstComments ? noop : query.fetchNextPage,
		fetchLaterComments: oldestFirstComments ? oldestQuery.fetchNextPage : query.fetchPreviousPage,
		fetchNewestComments: query.fetchPreviousPage,
	};
};
