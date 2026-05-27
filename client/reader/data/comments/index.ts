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
import type { QueryClient } from '@tanstack/react-query';

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

type UseCommentsOptions = {
	enabled?: boolean;
	retry?: boolean | number;
};

type UseCommentParams = {
	siteId?: number;
	commentId?: number | string;
};

type UseCommentOptions = {
	enabled?: boolean;
};

type UsePostCommentsApiDisabledParams = {
	siteId?: number;
	postId?: number;
};

type UsePostCommentsApiDisabledOptions = {
	enabled?: boolean;
};

const COMMENTS_API_DISABLED_ERROR_MESSAGE = 'API calls to this blog have been disabled.';

const commentsApiDisabledQueryKey = ( siteId: number ) =>
	[ 'site', 'comments', 'api-disabled', siteId ] as const;

const getErrorStatus = ( error: unknown ) =>
	( error as { status?: number; response?: { status?: number } } )?.status ??
	( error as { response?: { status?: number } } )?.response?.status;

const getErrorMessage = ( error: unknown ) =>
	( error as { message?: string; body?: { message?: string } } )?.message ??
	( error as { body?: { message?: string } } )?.body?.message;

const getErrorName = ( error: unknown ) =>
	( error as { name?: string; body?: { name?: string; error?: string } } )?.name ??
	( error as { body?: { name?: string; error?: string } } )?.body?.name ??
	( error as { body?: { name?: string; error?: string } } )?.body?.error;

const setCommentsApiDisabled = ( queryClient: QueryClient, siteId: number ) =>
	queryClient.setQueryData( commentsApiDisabledQueryKey( siteId ), true );

export const isCommentsApiDisabledError = ( error: unknown ) =>
	getErrorStatus( error ) === 403 &&
	getErrorName( error ) === 'UnauthorizedError' &&
	getErrorMessage( error ) === COMMENTS_API_DISABLED_ERROR_MESSAGE;

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
	{ enabled = true, retry }: UseCommentsOptions = {}
) => {
	const queryClient = useQueryClient();
	const queryOptions = siteCommentsInfiniteQuery( {
		siteId: siteId ?? 0,
		postId: postId ?? 0,
		status,
		number,
	} );
	const query = useInfiniteQuery( {
		...queryOptions,
		queryFn: async ( context ) => {
			try {
				return await queryOptions.queryFn!( context );
			} catch ( error ) {
				if ( siteId && isCommentsApiDisabledError( error ) ) {
					setCommentsApiDisabled( queryClient, siteId );
				}
				throw error;
			}
		},
		enabled: Boolean( enabled && siteId && postId ),
		retry,
	} );

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
 * Reads whether the comments API is known to be disabled for a site.
 *
 * This does not fetch by itself. It subscribes to the in-memory React Query
 * cache populated by `usePostCommentsApiDisabled` when a comments request
 * returns the known API-disabled 403 response.
 */
export const useCommentsApiDisabled = ( siteId?: number ) => {
	const { data = false } = useQuery( {
		queryKey: commentsApiDisabledQueryKey( siteId ?? 0 ),
		queryFn: () => false,
		enabled: false,
		initialData: false,
		staleTime: Infinity,
		meta: { persist: false },
	} );

	return Boolean( siteId && data );
};

/**
 * Probes a post comments endpoint and records the site-level API-disabled flag.
 *
 * Full post uses this as the React Query replacement for the old Redux
 * `requestPostComments` availability check. Other surfaces can call
 * `useCommentsApiDisabled` to read the resulting cached flag without fetching.
 */
export const usePostCommentsApiDisabled = (
	{ siteId, postId }: UsePostCommentsApiDisabledParams,
	{ enabled = true }: UsePostCommentsApiDisabledOptions = {}
) => {
	const isApiDisabled = useCommentsApiDisabled( siteId );
	const comments = useComments(
		{ siteId, postId },
		{ enabled: Boolean( enabled && ! isApiDisabled ), retry: false }
	);
	const isDisabledError = isCommentsApiDisabledError( comments.error );

	return isApiDisabled || isDisabledError;
};

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
