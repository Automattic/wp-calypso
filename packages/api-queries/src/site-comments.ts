import {
	createSiteCommentReply,
	createSitePostReply,
	fetchSiteComment,
	fetchSitePostReplies,
	likeSiteComment,
	unlikeSiteComment,
	type CreateSiteCommentReplyParams as CoreCreateSiteCommentReplyParams,
	type CreateSitePostReplyParams,
	type SiteComment,
	type SiteCommentLikeMutationParams as CoreSiteCommentLikeMutationParams,
	type SiteCommentLikeMutationResponse,
	type SiteCommentQueryParams,
	type SitePostRepliesQueryParams,
	type SitePostRepliesResponse,
} from '@automattic/api-core';
import {
	infiniteQueryOptions,
	mutationOptions,
	queryOptions,
	type InfiniteData,
} from '@tanstack/react-query';

const DEFAULT_STATUS = 'approved';
const DEFAULT_NUMBER = 50;
const DEFAULT_ORDER = 'DESC';

export interface CreateSiteCommentReplyParams extends CoreCreateSiteCommentReplyParams {
	postId?: number;
}

export interface SiteCommentLikeMutationParams extends CoreSiteCommentLikeMutationParams {
	postId?: number;
}

type SiteCommentsInfiniteQueryParams = Pick<
	SitePostRepliesQueryParams,
	'siteId' | 'postId' | 'status' | 'number' | 'order'
>;

export type SiteCommentsPageParam =
	| {
			direction: 'before' | 'after';
			before?: string;
			after?: string;
			offset?: number;
	  }
	| undefined;

export const siteCommentsInfiniteQueryKey = (
	siteId: number,
	postId: number,
	status: string = DEFAULT_STATUS,
	number: number = DEFAULT_NUMBER,
	order: 'ASC' | 'DESC' = DEFAULT_ORDER
) => [ 'site', 'comments', 'infinite', siteId, postId, status, { number, order } ] as const;

export const siteCommentsInfiniteQueryPrefix = ( siteId: number, postId: number ) =>
	[ 'site', 'comments', 'infinite', siteId, postId ] as const;

const validDates = ( comments: SiteComment[] = [] ) =>
	comments
		.map( ( comment ) => ( comment.date ? new Date( comment.date ) : null ) )
		.filter( ( date ): date is Date => !! date && ! isNaN( date.getTime() ) );

const newestDate = ( comments: SiteComment[] = [] ) => {
	const dates = validDates( comments );
	return dates.length
		? new Date( Math.max( ...dates.map( ( date ) => date.getTime() ) ) )
		: undefined;
};

const oldestDate = ( comments: SiteComment[] = [] ) => {
	const dates = validDates( comments );
	return dates.length
		? new Date( Math.min( ...dates.map( ( date ) => date.getTime() ) ) )
		: undefined;
};

const commentCountAtDate = ( comments: SiteComment[] = [], date?: Date ): number => {
	if ( ! date || isNaN( date.getTime() ) ) {
		return 0;
	}

	const timestampSeconds = date.getTime() / 1000;
	return comments.filter( ( comment ) => {
		if ( ! comment.date ) {
			return false;
		}
		return Date.parse( comment.date ) / 1000 === timestampSeconds;
	} ).length;
};

/**
 * Pages through a post's comments newest first by default, with `before` cursors for earlier pages
 * and `after` cursors for newer ones.
 *
 * Oldest first pages forward by offset instead: new comments only land past the end, and comments
 * written into the cache by mutations never change how many pages are loaded.
 */
export const siteCommentsInfiniteQuery = ( {
	siteId,
	postId,
	status,
	number,
	order = DEFAULT_ORDER,
}: SiteCommentsInfiniteQueryParams ) =>
	infiniteQueryOptions<
		SitePostRepliesResponse,
		Error,
		InfiniteData< SitePostRepliesResponse, SiteCommentsPageParam >,
		ReturnType< typeof siteCommentsInfiniteQueryKey >,
		SiteCommentsPageParam
	>( {
		queryKey: siteCommentsInfiniteQueryKey( siteId, postId, status, number, order ),
		queryFn: ( { pageParam } ) =>
			fetchSitePostReplies( {
				siteId,
				postId,
				status,
				number,
				order: order === 'ASC' || pageParam?.direction === 'after' ? 'ASC' : 'DESC',
				before: pageParam?.before,
				after: pageParam?.after,
				offset: pageParam?.offset,
			} ),
		initialPageParam: undefined,
		// Most threads poll for newer comments, so a refocus or reopen doesn't refetch every loaded page.
		staleTime: 60 * 1000,
		refetchOnWindowFocus: false,
		getNextPageParam: ( lastPage, allPages ) => {
			const pageSize = number ?? DEFAULT_NUMBER;
			// Mutations add and remove comments in cached pages, so a page's length can't mark the end.
			if ( order === 'ASC' ) {
				const offset = allPages.length * pageSize;
				return offset < ( allPages[ 0 ]?.found ?? 0 )
					? { direction: 'after' as const, offset }
					: undefined;
			}

			if ( lastPage.comments.length < pageSize ) {
				return undefined;
			}

			// With a `before` cursor, `found` counts the comments left before it, not the post's total.
			if ( lastPage.found && lastPage.comments.length >= lastPage.found ) {
				return undefined;
			}

			const oldest = oldestDate( lastPage.comments );
			return oldest
				? {
						direction: 'before' as const,
						before: oldest.toISOString(),
					}
				: undefined;
		},
		getPreviousPageParam: ( firstPage, allPages ) => {
			const newest = order === 'DESC' ? newestDate( firstPage.comments ) : undefined;
			return newest
				? {
						direction: 'after' as const,
						after: newest.toISOString(),
						offset: commentCountAtDate(
							allPages.flatMap( ( page ) => page.comments ),
							newest
						),
					}
				: undefined;
		},
		enabled: Boolean( siteId && postId ),
		meta: { persist: false },
	} );

export const siteCommentQueryKey = ( siteId: number, commentId: number | string ) =>
	[ 'site', 'comment', siteId, commentId ] as const;

export const siteCommentQuery = ( { siteId, commentId }: SiteCommentQueryParams ) =>
	queryOptions< SiteComment >( {
		queryKey: siteCommentQueryKey( siteId, commentId ),
		queryFn: () => fetchSiteComment( { siteId, commentId } ),
		enabled: Boolean( siteId && commentId ),
		meta: { persist: false },
	} );

/**
 * Creates a root reply/comment for a post.
 *
 * This factory only describes the network mutation. Reader placeholder and
 * cache replacement behavior lives in
 * `client/reader/data/comments/use-post-comment-actions`.
 */
export const createSitePostCommentMutation = () =>
	mutationOptions< SiteComment, Error, CreateSitePostReplyParams >( {
		meta: { statId: 'site-post-cmt-create' },
		mutationFn: createSitePostReply,
	} );

/**
 * Creates a reply under an existing site comment.
 *
 * Reader placeholder and cache replacement behavior lives in
 * `client/reader/data/comments/use-post-comment-actions`.
 */
export const createSiteCommentReplyMutation = () =>
	mutationOptions< SiteComment, Error, CreateSiteCommentReplyParams >( {
		meta: { statId: 'site-cmt-reply-create' },
		mutationFn: ( { siteId, parentCommentId, content } ) =>
			createSiteCommentReply( { siteId, parentCommentId, content } ),
	} );

/**
 * Likes a site comment and returns the server-authoritative like count.
 *
 * Optimistic toggling and rollback are applied by `useCommentLikeMutations`.
 */
export const likeSiteCommentMutation = () =>
	mutationOptions< SiteCommentLikeMutationResponse, Error, SiteCommentLikeMutationParams >( {
		meta: { statId: 'site-cmt-like' },
		mutationFn: ( { siteId, commentId } ) => likeSiteComment( { siteId, commentId } ),
	} );

/**
 * Unlikes a site comment and returns the server-authoritative like count.
 *
 * Optimistic toggling and rollback are applied by `useCommentLikeMutations`.
 */
export const unlikeSiteCommentMutation = () =>
	mutationOptions< SiteCommentLikeMutationResponse, Error, SiteCommentLikeMutationParams >( {
		meta: { statId: 'site-cmt-unlike' },
		mutationFn: ( { siteId, commentId } ) => unlikeSiteComment( { siteId, commentId } ),
	} );
