import { useMutation, useQueryClient } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import {
	NoticeRecords,
	Notices,
	noticesVisibilityQueryKey,
	toNoticeRecord,
} from './use-notice-visibility-query';

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
		mutationFn: ( update?: NoticeUpdate ) =>
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
			if ( ! record || ! queryClient.getQueryData< NoticeRecords >( queryKey ) ) {
				queryClient.invalidateQueries( { queryKey } );
				return;
			}
			// The POST record carries no `show`, but a write that went through always hides the notice.
			queryClient.setQueryData< NoticeRecords >( queryKey, ( records ) => ( {
				...records,
				[ noticeId ]: { ...toNoticeRecord( record ), show: false },
			} ) );
		},
	} );
}
