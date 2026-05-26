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

export type SiteCommentsQueryParams = SitePostRepliesQueryParams;
export type SiteCommentsResponse = SitePostRepliesResponse;

export interface CreateSiteCommentReplyParams extends CoreCreateSiteCommentReplyParams {
	postId: number;
}

export interface SiteCommentLikeMutationParams extends CoreSiteCommentLikeMutationParams {
	postId: number;
}

export type SiteCommentsPageParam =
	| {
			direction: 'before' | 'after';
			before?: string;
			after?: string;
			offset?: number;
	  }
	| undefined;

export const siteCommentsQueryKey = (
	siteId: number,
	postId: number,
	status: string = DEFAULT_STATUS,
	number: number = DEFAULT_NUMBER,
	order: 'ASC' | 'DESC' = DEFAULT_ORDER
) => [ 'site', 'comments', siteId, postId, status, { number, order } ] as const;

export const siteCommentsQueryPrefix = ( siteId: number, postId: number ) =>
	[ 'site', 'comments', siteId, postId ] as const;

export const siteCommentsInfiniteQueryKey = (
	siteId: number,
	postId: number,
	status: string = DEFAULT_STATUS,
	number: number = DEFAULT_NUMBER,
	order: 'ASC' | 'DESC' = DEFAULT_ORDER
) => [ 'site', 'comments', 'infinite', siteId, postId, status, { number, order } ] as const;

export const siteCommentsInfiniteQueryPrefix = ( siteId: number, postId: number ) =>
	[ 'site', 'comments', 'infinite', siteId, postId ] as const;

export const siteCommentsQuery = ( params: SiteCommentsQueryParams ) =>
	queryOptions< SitePostRepliesResponse >( {
		queryKey: siteCommentsQueryKey(
			params.siteId,
			params.postId,
			params.status,
			params.number,
			params.order
		),
		queryFn: () => fetchSitePostReplies( params ),
		enabled: Boolean( params.siteId && params.postId ),
		meta: { persist: false },
	} );

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

export const siteCommentsInfiniteQuery = ( params: SitePostRepliesQueryParams ) =>
	infiniteQueryOptions<
		SitePostRepliesResponse,
		Error,
		InfiniteData< SitePostRepliesResponse, SiteCommentsPageParam >,
		ReturnType< typeof siteCommentsInfiniteQueryKey >,
		SiteCommentsPageParam
	>( {
		queryKey: siteCommentsInfiniteQueryKey(
			params.siteId,
			params.postId,
			params.status,
			params.number,
			params.order
		),
		queryFn: ( { pageParam } ) =>
			fetchSitePostReplies( {
				...params,
				order: pageParam?.direction === 'after' ? 'ASC' : 'DESC',
				before: pageParam?.before,
				after: pageParam?.after,
				offset: pageParam?.offset,
			} ),
		initialPageParam: undefined,
		getNextPageParam: ( lastPage, allPages ) => {
			const number = params.number ?? DEFAULT_NUMBER;
			if (
				lastPage.comments.length < number ||
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
		enabled: Boolean( params.siteId && params.postId ),
		meta: { persist: false },
	} );

export const siteCommentQueryKey = ( siteId: number, commentId: number | string ) =>
	[ 'site', 'comment', siteId, commentId ] as const;

export const siteCommentQuery = ( params: SiteCommentQueryParams ) =>
	queryOptions< SiteComment >( {
		queryKey: siteCommentQueryKey( params.siteId, params.commentId ),
		queryFn: () => fetchSiteComment( params ),
		enabled: Boolean( params.siteId && params.commentId ),
		meta: { persist: false },
	} );

export const createSitePostCommentMutation = () =>
	mutationOptions< SiteComment, Error, CreateSitePostReplyParams >( {
		mutationFn: createSitePostReply,
	} );

export const createSiteCommentReplyMutation = () =>
	mutationOptions< SiteComment, Error, CreateSiteCommentReplyParams >( {
		mutationFn: ( { siteId, parentCommentId, content } ) =>
			createSiteCommentReply( { siteId, parentCommentId, content } ),
	} );

export const likeSiteCommentMutation = () =>
	mutationOptions< SiteCommentLikeMutationResponse, Error, SiteCommentLikeMutationParams >( {
		mutationFn: ( { siteId, commentId } ) => likeSiteComment( { siteId, commentId } ),
	} );

export const unlikeSiteCommentMutation = () =>
	mutationOptions< SiteCommentLikeMutationResponse, Error, SiteCommentLikeMutationParams >( {
		mutationFn: ( { siteId, commentId } ) => unlikeSiteComment( { siteId, commentId } ),
	} );
