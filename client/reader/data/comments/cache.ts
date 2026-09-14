import { siteCommentQueryKey, siteCommentsInfiniteQueryPrefix } from '@automattic/api-queries';
import type { SiteComment } from '@automattic/api-core';
import type { InfiniteData, QueryClient } from '@tanstack/react-query';

type SiteCommentsResponse = {
	comments: SiteComment[];
	found?: number;
};

type SiteCommentsInfiniteData = InfiniteData< SiteCommentsResponse >;

export type CommentActionParams = {
	content: string;
	siteId: number;
	postId: number;
	parentCommentId?: number | string;
};

export const createPlaceholderComment = ( {
	content,
	postId,
	parentCommentId,
}: CommentActionParams ): SiteComment => ( {
	ID: `placeholder-${ Date.now() }`,
	parent: parentCommentId ? { ID: parentCommentId } : false,
	date: new Date().toISOString(),
	content,
	status: 'pending',
	type: 'comment',
	post: { ID: postId },
	isPlaceholder: true,
	placeholderState: 'PENDING',
} );

const updatePostCommentsCache = (
	queryClient: QueryClient,
	siteId: number,
	postId: number,
	updater: ( data: SiteCommentsInfiniteData ) => SiteCommentsInfiniteData
) => {
	queryClient.setQueriesData< SiteCommentsInfiniteData >(
		{ queryKey: siteCommentsInfiniteQueryPrefix( siteId, postId ) },
		( data ) => ( data ? updater( data ) : data )
	);
};

export const addCommentToNewestPage = (
	queryClient: QueryClient,
	siteId: number,
	postId: number,
	comment: SiteComment
) =>
	updatePostCommentsCache( queryClient, siteId, postId, ( data ) => ( {
		...data,
		pages: data.pages.map( ( page, index ) =>
			index === 0
				? {
						...page,
						comments: [ comment, ...page.comments ],
				  }
				: page
		),
	} ) );

export const replaceCommentInCache = (
	queryClient: QueryClient,
	siteId: number,
	postId: number,
	commentId: SiteComment[ 'ID' ],
	comment: SiteComment
) =>
	updatePostCommentsCache( queryClient, siteId, postId, ( data ) => ( {
		...data,
		pages: data.pages.map( ( page ) => ( {
			...page,
			comments: page.comments.map( ( item ) => ( item.ID === commentId ? comment : item ) ),
		} ) ),
	} ) );

export const removeCommentFromCache = (
	queryClient: QueryClient,
	siteId: number,
	postId: number,
	commentId: SiteComment[ 'ID' ]
) =>
	updatePostCommentsCache( queryClient, siteId, postId, ( data ) => ( {
		...data,
		pages: data.pages.map( ( page ) => ( {
			...page,
			comments: page.comments.filter( ( item ) => item.ID !== commentId ),
		} ) ),
	} ) );

/**
 * Updates comment like state wherever Reader comments may have cached it.
 *
 * A comment can be rendered from the paginated post comments query or from the
 * single-comment query used by deep links. Like/unlike mutations call this for
 * optimistic writes, rollbacks, and final server reconciliation so both cache
 * shapes stay in sync.
 */
export const updateCommentLikeInCache = (
	queryClient: QueryClient,
	siteId: number,
	postId: number | undefined,
	commentId: SiteComment[ 'ID' ],
	iLike: boolean,
	likeCount: number
) => {
	const updateComment = ( comment: SiteComment ) =>
		comment.ID === commentId
			? {
					...comment,
					i_like: iLike,
					like_count: likeCount,
			  }
			: comment;

	if ( postId ) {
		updatePostCommentsCache( queryClient, siteId, postId, ( data ) => ( {
			...data,
			pages: data.pages.map( ( page ) => ( {
				...page,
				comments: page.comments.map( updateComment ),
			} ) ),
		} ) );
	}

	queryClient.setQueryData< SiteComment >( siteCommentQueryKey( siteId, commentId ), ( comment ) =>
		comment ? updateComment( comment ) : comment
	);
};
