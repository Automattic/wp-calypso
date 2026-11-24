import { useMemo } from 'react';
import {
	buildCommentsTree,
	filterComments,
	getCommentTimestamp,
	mergeComments,
} from './normalization';
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
	const oldestFirstThread = useMemo( () => {
		if ( ! needsOldestQuery || ! oldestQuery.data ) {
			return null;
		}

		const oldestPages = oldestQuery.data.pages.map( ( page ) => page.comments );
		// Pages arrive oldest first, and comments posted here are cached at the front of the first page,
		// so the last comment fetched marks how far the start of the thread reaches.
		const lastFetched = oldestPages.at( -1 )?.at( -1 );
		const frontier = lastFetched ? getCommentTimestamp( lastFetched ) : -Infinity;

		const merged = mergeComments( [
			...oldestPages,
			...( query.data?.pages.map( ( page ) => page.comments ) ?? [] ),
		] );
		const reachesNewest =
			! oldestQuery.hasNextPage ||
			( newestFirstComments.length > 0 &&
				getCommentTimestamp( newestFirstComments[ 0 ] ) <= frontier );
		// Comments past the frontier would leave a gap, so they wait until the two ends meet.
		const gap = reachesNewest
			? -1
			: merged.findIndex(
					( comment ) => comment.isPlaceholder || getCommentTimestamp( comment ) > frontier
				);

		return { comments: gap === -1 ? merged : merged.slice( 0, gap ), reachesNewest };
	}, [
		needsOldestQuery,
		newestFirstComments,
		oldestQuery.data,
		oldestQuery.hasNextPage,
		query.data?.pages,
	] );
	const comments = oldestFirstThread?.comments ?? newestFirstComments;
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
				! oldestFirstThread && query.hasNextPage && hasMoreComments && ! query.isFetchingNextPage,
			haveLaterCommentsToFetch: oldestFirstThread
				? ! oldestFirstThread.reachesNewest && ! oldestQuery.isFetchingNextPage
				: query.hasPreviousPage && hasMoreComments && ! query.isFetchingPreviousPage,
			hasReceivedBefore,
			hasReceivedAfter,
		},
		found,
		// Until the first comments arrive, the list keeps its order rather than flash the wrong window.
		isOldestFirst: oldestFirst && ( ! needsOldestQuery || Boolean( oldestFirstThread ) ),
		fetchEarlierComments: oldestFirstThread ? noop : query.fetchNextPage,
		fetchLaterComments: oldestFirstThread ? oldestQuery.fetchNextPage : query.fetchPreviousPage,
		fetchNewestComments: query.fetchPreviousPage,
	};
};
