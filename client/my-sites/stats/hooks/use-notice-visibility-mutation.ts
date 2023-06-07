import { useMutation } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { Notices } from './use-notice-visibility-query';

type Status = 'dismissed' | 'postponed';

export function dismissNotice(
	siteId: number | null,
	noticeId: keyof Notices,
	status: Status,
	postponedFor: number | null = null
): Promise< any > {
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

export default function useNoticeVisibilityMutation(
	siteId: number | null,
	noticeId: keyof Notices,
	status: Status = 'dismissed',
	postponedFor: number | null = null
) {
	return useMutation( {
		mutationKey: [ 'stats', 'notices-visibility', siteId, noticeId ],
		mutationFn: () => dismissNotice( siteId, noticeId, status, postponedFor ),
		retry: 1,
		retryDelay: 3 * 1000, // 3 seconds
	} );
}
