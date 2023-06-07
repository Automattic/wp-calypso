import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export function queryNotices( siteId: number | null ): Promise< any > {
	return wpcom.req.get( {
		method: 'GET',
		apiNamespace: 'wpcom/v2',
		path: `/sites/${ siteId }/jetpack-stats-dashboard/notices`,
	} );
}

export default function useNoticeVisibilityQuery( siteId: number | null, noticeId: string ) {
	return useQuery( {
		queryKey: [ 'stats', 'notices-visibility', siteId ],
		queryFn: () => queryNotices( siteId ),
		select: ( payload: Record< string, boolean > ): boolean => !! payload?.[ noticeId ],
		staleTime: 1000 * 60 * 1, // 1 minutes
		retry: 1,
		retryDelay: 3 * 1000, // 3 seconds
	} );
}
