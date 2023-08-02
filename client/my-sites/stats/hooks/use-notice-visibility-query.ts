import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export type Notices = {
	new_stats_feedback: boolean;
	opt_in_new_stats: boolean;
	opt_out_new_stats: boolean;
	traffic_page_highlights_module_settings: boolean;
	traffic_page_settings: boolean;
	do_you_love_jetpack_stats: boolean;
};

// These notices are mutually exclusive, so if one is active, the other should be hidden.
// The IDs are sorted by priory from high to low.
const CONFLICT_NOTICE_ID_GROUPS: Record< string, Array< keyof Notices > > = {
	settings_tool_tips: [ 'traffic_page_settings', 'traffic_page_highlights_module_settings' ],
};

/**
 * Only allow one notice in a conflict group to be active at a time.
 */
const processConflictNotices = ( notices: Notices ): Notices => {
	for ( const conflictNoticeGroup in CONFLICT_NOTICE_ID_GROUPS ) {
		let foundActiveNotice = false;
		for ( const confilictNoticeId of CONFLICT_NOTICE_ID_GROUPS[ conflictNoticeGroup ] ) {
			if ( foundActiveNotice ) {
				notices[ confilictNoticeId ] = false;
			} else if ( notices?.[ confilictNoticeId ] ) {
				foundActiveNotice = true;
			}
		}
	}
	return notices;
};

export async function queryNotices( siteId: number | null ): Promise< Notices > {
	const payload = await wpcom.req.get( {
		method: 'GET',
		apiNamespace: 'wpcom/v2',
		path: `/sites/${ siteId }/jetpack-stats-dashboard/notices`,
	} );

	return processConflictNotices( payload );
}

export default function useNoticeVisibilityQuery( siteId: number | null, noticeId: string ) {
	return useQuery( {
		queryKey: [ 'stats', 'notices-visibility', siteId ],
		queryFn: () => queryNotices( siteId ),
		select: ( payload: Record< string, boolean > ): boolean => !! payload?.[ noticeId ],
		staleTime: 1000 * 30, // 30 seconds
		retry: 1,
		retryDelay: 3 * 1000, // 3 seconds
	} );
}
