import { siteCommentQuery, siteCommentsInfiniteQuery } from '@automattic/api-queries';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { SiteComment } from '@automattic/api-core';

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

const EMPTY_COMMENTS: SiteComment[] = [];

const getCommentTimestamp = ( comment: SiteComment ) => {
	const timestamp = Date.parse( comment.date ?? '' );
	return Number.isNaN( timestamp ) ? Number.POSITIVE_INFINITY : timestamp;
};

const sortCommentsByDate = ( comments: SiteComment[] ) =>
	[ ...comments ].sort( ( first, second ) => {
		const firstTimestamp = getCommentTimestamp( first );
		const secondTimestamp = getCommentTimestamp( second );

		if ( firstTimestamp === secondTimestamp ) {
			return 0;
		}

		return firstTimestamp - secondTimestamp;
	} );

const mergeComments = ( pages: SiteComment[][] ) => {
	const commentsById = new Map< SiteComment[ 'ID' ], SiteComment >();

	pages.flat().forEach( ( comment ) => {
		if ( ! commentsById.has( comment.ID ) ) {
			commentsById.set( comment.ID, comment );
		}
	} );

	return sortCommentsByDate( [ ...commentsById.values() ] );
};

const filterComments = ( comments: SiteComment[], status: string, authorId?: number ) =>
	comments.filter( ( comment ) => {
		const commentAuthorId = comment.author?.ID;
		if (
			authorId &&
			commentAuthorId &&
			comment.status === 'unapproved' &&
			commentAuthorId !== authorId
		) {
			return false;
		}

		if ( status !== 'all' ) {
			return comment.isPlaceholder || comment.status === status;
		}

		return true;
	} );

const buildCommentsTree = ( comments: SiteComment[] ) => {
	const tree: Record< string | number, { data: SiteComment; children: SiteComment[ 'ID' ][] } > & {
		children: SiteComment[ 'ID' ][];
	} = {
		children: [],
	};

	comments.forEach( ( comment ) => {
		tree[ comment.ID ] = {
			data: comment,
			children: [],
		};
	} );

	comments.forEach( ( comment ) => {
		if ( comment.parent && tree[ comment.parent.ID ] ) {
			tree[ comment.parent.ID ].children.push( comment.ID );
		} else if ( comment.parent === false ) {
			tree.children.push( comment.ID );
		}
	} );

	return tree;
};

export const mergeCommentLists = (
	comments: SiteComment[],
	additionalComments: SiteComment[] = EMPTY_COMMENTS
) => mergeComments( [ comments, additionalComments ] );

export const buildCommentsTreeForDisplay = ( {
	comments,
	displayStatus = 'approved',
	authorId,
}: {
	comments: SiteComment[];
	displayStatus?: string;
	authorId?: number;
} ) => buildCommentsTree( filterComments( comments, displayStatus, authorId ) );

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
