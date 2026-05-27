import { siteCommentQuery } from '@automattic/api-queries';
import { useQueries, useQuery } from '@tanstack/react-query';

type UseCommentParams = {
	siteId?: number;
	commentId?: number | string;
};

type UseCommentsByIdParams = {
	siteId?: number;
	postId?: number;
	commentIds?: Array< number | string >;
};

type UseCommentOptions = {
	enabled?: boolean;
	retry?: boolean | number;
};

const getCommentErrorKey = ( siteId: number, commentId: number | string ) =>
	`${ siteId }-${ commentId }`;

/**
 * Loads a single site comment by ID.
 *
 * Use this for deep-linked comments or other cases where a specific comment may
 * not already be present in the paginated post comments cache. The `options`
 * argument controls whether the request should run.
 */
export const useComment = (
	{ siteId, commentId }: UseCommentParams,
	{ enabled = true, retry = false }: UseCommentOptions = {}
) =>
	useQuery( {
		...siteCommentQuery( {
			siteId: siteId ?? 0,
			commentId: commentId ?? '',
		} ),
		enabled: Boolean( enabled && siteId && commentId ),
		retry,
	} );

/**
 * Loads a set of specific comments and returns legacy-shaped error keys.
 *
 * Conversations uses this for parent comments that are referenced by the list
 * response but missing from the loaded pages.
 */
export const useCommentsById = ( { siteId, postId, commentIds = [] }: UseCommentsByIdParams ) =>
	useQueries( {
		queries: commentIds.map( ( commentId ) => ( {
			...siteCommentQuery( {
				siteId: siteId ?? 0,
				commentId,
			} ),
			enabled: Boolean( siteId && commentId ),
			retry: false,
		} ) ),
		combine: ( results ) => ( {
			comments: results
				.map( ( query ) => query.data )
				.filter( ( comment ) => comment && ( ! comment.post?.ID || comment.post.ID === postId ) ),
			commentErrors: Object.fromEntries(
				results.flatMap( ( query, index ) => {
					const commentId = commentIds[ index ];
					if ( ! query.error || ! commentId ) {
						return [];
					}

					return [ [ getCommentErrorKey( siteId ?? 0, commentId ), query.error ] ];
				} )
			),
		} ),
	} );
