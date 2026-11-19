import { siteCommentQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';

type UseCommentParams = {
	siteId?: number;
	commentId?: number | string;
};

type UseCommentOptions = {
	enabled?: boolean;
	retry?: boolean | number;
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
