import { useMutation, useQueryClient } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import {
	Notices,
	NoticeDismissStatus,
	noticesVisibilityQueryKey,
} from './use-notice-visibility-query';

export interface NoticeUpdate {
	status: NoticeDismissStatus;
	postponedFor?: number;
}

export function dismissNotice(
	siteId: number | null,
	noticeId: keyof Notices,
	status: NoticeDismissStatus,
	postponedFor = 0
): Promise< unknown > {
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: `/sites/${ siteId }/jetpack-stats-dashboard/notices`,
		body: {
			id: noticeId,
			status: status,
			postponed_for: postponedFor,
		},
	} );
}

/**
 * The hook arguments are the default update. `mutate()` may pass a `NoticeUpdate` for notices
 * whose next step depends on the saved record; each field it omits falls back to the hook argument.
 */
export default function useNoticeVisibilityMutation(
	siteId: number | null,
	noticeId: keyof Notices,
	status: NoticeDismissStatus = 'dismissed',
	postponedFor = 0
) {
	const queryClient = useQueryClient();
	return useMutation( {
		mutationKey: noticesVisibilityQueryKey( siteId ),
		mutationFn: ( update: NoticeUpdate | void ) =>
			dismissNotice(
				siteId,
				noticeId,
				update?.status ?? status,
				update?.postponedFor ?? postponedFor
			),
		retry: 1,
		retryDelay: 3 * 1000, // 3 seconds
		// Mutation-level rather than per-call: query-core only runs mutate()'s own
		// callbacks while the calling component is still mounted, and consumers may
		// navigate away before the retry succeeds. Not awaited, so callers chaining
		// on mutateAsync() don't also wait out the refetch.
		onSuccess: () => {
			queryClient.invalidateQueries( { queryKey: noticesVisibilityQueryKey( siteId ) } );
		},
	} );
}
