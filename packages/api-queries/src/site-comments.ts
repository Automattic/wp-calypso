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
	'siteId' | 'postId' | 'status' | 'number'
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
	number: number = DEFAULT_NUMBER
) =>
	[
		'site',
		'comments',
		'infinite',
		siteId,
		postId,
		status,
		{ number, order: DEFAULT_ORDER },
	] as const;

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

const uniqueCommentsCount = ( pages: SitePostRepliesResponse[] ) =>
	new Set( pages.flatMap( ( page ) => page.comments.map( ( comment ) => comment.ID ) ) ).size;

export const siteCommentsInfiniteQuery = ( {
	siteId,
	postId,
	status,
	number,
}: SiteCommentsInfiniteQueryParams ) =>
	infiniteQueryOptions<
		SitePostRepliesResponse,
		Error,
		InfiniteData< SitePostRepliesResponse, SiteCommentsPageParam >,
		ReturnType< typeof siteCommentsInfiniteQueryKey >,
		SiteCommentsPageParam
	>( {
		queryKey: siteCommentsInfiniteQueryKey( siteId, postId, status, number ),
		queryFn: ( { pageParam } ) =>
			fetchSitePostReplies( {
				siteId,
				postId,
				status,
				number,
				order: pageParam?.direction === 'after' ? 'ASC' : 'DESC',
				before: pageParam?.before,
				after: pageParam?.after,
				offset: pageParam?.offset,
			} ),
		initialPageParam: undefined,
		getNextPageParam: ( lastPage, allPages ) => {
			const pageSize = number ?? DEFAULT_NUMBER;
			if (
				lastPage.comments.length < pageSize ||
				( lastPage.found && uniqueCommentsCount( allPages ) >= lastPage.found )
			) {
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
			const newest = newestDate( firstPage.comments );
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
		mutationFn: ( { siteId, commentId } ) => likeSiteComment( { siteId, commentId } ),
	} );

/**
 * Unlikes a site comment and returns the server-authoritative like count.
 *
 * Optimistic toggling and rollback are applied by `useCommentLikeMutations`.
 */
export const unlikeSiteCommentMutation = () =>
	mutationOptions< SiteCommentLikeMutationResponse, Error, SiteCommentLikeMutationParams >( {
		mutationFn: ( { siteId, commentId } ) => unlikeSiteComment( { siteId, commentId } ),
	} );
