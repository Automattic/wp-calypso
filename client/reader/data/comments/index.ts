import {
	createSiteCommentReplyMutation,
	createSitePostCommentMutation,
	siteCommentQuery,
	siteCommentsInfiniteQuery,
} from '@automattic/api-queries';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import {
	addCommentToNewestPage,
	createPlaceholderComment,
	removeCommentFromCache,
	replaceCommentInCache,
	type CommentActionParams,
} from './cache';
import { buildCommentsTree, filterComments, mergeComments } from './normalization';
import type { SiteComment } from '@automattic/api-core';

export { buildCommentsTreeForDisplay, mergeCommentLists } from './normalization';

type UseCommentsParams = {
	siteId?: number;
	postId?: number;
	status?: string;
	displayStatus?: string;
	authorId?: number;
	number?: number;
	commentTotal?: number;
};

type UseCommentParams = {
	siteId?: number;
	commentId?: number | string;
};

type UseCommentOptions = {
	enabled?: boolean;
};

/**
 * Loads and derives the paginated comment list for a Reader post.
 *
 * The REST endpoint returns pages in API order, but Reader components consume a
 * chronological `comments` array, a legacy-shaped parent/child `commentsTree`,
 * and legacy fetch-status names for "earlier" and "later" pagination controls.
 */
export const useComments = ( {
	siteId,
	postId,
	status = 'approved',
	displayStatus = status,
	authorId,
	number,
	commentTotal,
}: UseCommentsParams ) => {
	const query = useInfiniteQuery(
		siteCommentsInfiniteQuery( {
			siteId: siteId ?? 0,
			postId: postId ?? 0,
			status,
			number,
		} )
	);

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
			haveEarlierCommentsToFetch: query.hasNextPage && hasMoreComments,
			haveLaterCommentsToFetch: query.hasPreviousPage && hasMoreComments,
			hasReceivedBefore,
			hasReceivedAfter,
		},
		found,
		fetchEarlierComments: query.fetchNextPage,
		fetchLaterComments: query.fetchPreviousPage,
	};
};

/**
 * Loads a single site comment by ID.
 *
 * Use this for deep-linked comments or other cases where a specific comment may
 * not already be present in the paginated post comments cache. The `options`
 * argument controls whether the request should run.
 */
export const useComment = (
	{ siteId, commentId }: UseCommentParams,
	{ enabled = true }: UseCommentOptions = {}
) =>
	useQuery( {
		...siteCommentQuery( {
			siteId: siteId ?? 0,
			commentId: commentId ?? '',
		} ),
		enabled: Boolean( enabled && siteId && commentId ),
	} );

/**
 * Provides the legacy action-shaped API used by comment form class components.
 *
 * Create/reply insert a pending placeholder into the newest cached comments
 * page, replace it with the server comment on success, and keep the placeholder
 * in an error state for resend on failure. The initial comments page is fetched
 * with `DESC` ordering, so page index 0 is the newest API page even though
 * `useComments` later exposes comments chronologically.
 */
export const usePostCommentActions = () => {
	const queryClient = useQueryClient();
	const { mutateAsync: createPostComment } = useMutation( createSitePostCommentMutation() );
	const { mutateAsync: createCommentReply } = useMutation( createSiteCommentReplyMutation() );

	const createComment = useCallback(
		( params: CommentActionParams, requestComment: () => Promise< SiteComment > ) => {
			const placeholder = createPlaceholderComment( params );
			addCommentToNewestPage( queryClient, params.siteId, params.postId, placeholder );

			return requestComment().then(
				( comment ) => {
					replaceCommentInCache(
						queryClient,
						params.siteId,
						params.postId,
						placeholder.ID,
						comment
					);
					return comment;
				},
				( error ) => {
					replaceCommentInCache( queryClient, params.siteId, params.postId, placeholder.ID, {
						...placeholder,
						placeholderState: 'ERROR',
						placeholderError: error,
						placeholderErrorType: ( error as { error?: string } )?.error,
					} );
					throw error;
				}
			);
		},
		[ queryClient ]
	);

	return {
		writeComment: ( content: string, siteId: number, postId: number ) =>
			createComment( { content, siteId, postId }, () =>
				createPostComment( { content, siteId, postId } )
			),
		replyComment: (
			content: string,
			siteId: number,
			postId: number,
			parentCommentId: number | string
		) =>
			createComment( { content, siteId, postId, parentCommentId }, () =>
				createCommentReply( { content, siteId, postId, parentCommentId } )
			),
		deleteComment: ( siteId: number, postId: number, commentId: SiteComment[ 'ID' ] ) =>
			removeCommentFromCache( queryClient, siteId, postId, commentId ),
	};
};
