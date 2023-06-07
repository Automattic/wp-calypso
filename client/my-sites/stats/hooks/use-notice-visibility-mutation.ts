import { useMutation } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export function dismissNotice(
	siteId: number | null,
	noticeId: string,
	status: string
): Promise< any > {
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: `/sites/${ siteId }/jetpack-stats-dashboard/notices`,
		body: {
			id: noticeId,
			status: status,
		},
	} );
}

export default function useNoticeVisibilityMutation(
	siteId: number | null,
	noticeId: string,
	status = 'dismissed'
) {
	return useMutation( {
		mutationKey: [ 'stats', 'notices-visibility', siteId, noticeId ],
		mutationFn: () => dismissNotice( siteId, noticeId, status ),
	} );
}
