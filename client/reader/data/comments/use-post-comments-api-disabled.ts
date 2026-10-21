import { isCommentsApiDisabledError, useCommentsApiDisabled } from './api-disabled';
import { usePostCommentsQuery } from './use-post-comments-query';

type UsePostCommentsApiDisabledParams = {
	siteId?: number;
	postId?: number;
};

type UsePostCommentsApiDisabledOptions = {
	enabled?: boolean;
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
	const comments = usePostCommentsQuery(
		{ siteId, postId },
		{ enabled: Boolean( enabled && ! isApiDisabled ), retry: false }
	);
	const isDisabledError = isCommentsApiDisabledError( comments.error );

	return isApiDisabled || isDisabledError;
};
