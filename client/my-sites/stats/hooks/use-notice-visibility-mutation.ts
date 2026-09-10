import { useMutation, useQueryClient } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { Notices, noticesVisibilityQueryKey, setNoticeHidden } from './use-notice-visibility-query';

type Status = 'dismissed' | 'postponed';

export interface NoticeUpdate {
	status: Status;
	postponedFor?: number;
}

interface NoticeUpdateResponse {
	updated?: boolean;
	notice?: Record< string, unknown >;
}

export function dismissNotice(
	siteId: number | null,
	noticeId: keyof Notices,
	status: Status,
	postponedFor = 0
): Promise< NoticeUpdateResponse > {
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
 * The hook arguments are the default update; `mutate()` may pass a `NoticeUpdate` to override
 * them per call, for notices whose next step depends on the saved record.
 */
export default function useNoticeVisibilityMutation(
	siteId: number | null,
	noticeId: keyof Notices,
	status: Status = 'dismissed',
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
		onSuccess: ( response ) => {
			const queryKey = noticesVisibilityQueryKey( siteId );
			const record = response?.notice;
			// A fetch already in flight would land after the patch and undo it; invalidating
			// cancels that fetch and starts one that sees the write.
			if (
				! record ||
				! queryClient.getQueryData( queryKey ) ||
				queryClient.getQueryState( queryKey )?.fetchStatus === 'fetching'
			) {
				queryClient.invalidateQueries( { queryKey } );
				return;
			}
			setNoticeHidden( queryClient, siteId, noticeId, record );
		},
	} );
}
