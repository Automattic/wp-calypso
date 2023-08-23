import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export type Notices = {
	opt_in_new_stats: boolean;
	traffic_page_highlights_module_settings: boolean;
	traffic_page_settings: boolean;
	do_you_love_jetpack_stats: boolean;
};

const QUERY_OPTIONS = {
	staleTime: 1000 * 30, // 30 seconds
	retry: 1,
	retryDelay: 3 * 1000, // 3 seconds
};

// These notices are mutually exclusive, so if one is active, the other should be hidden.
// The IDs are sorted by priory from high to low.
const CONFLICT_NOTICE_ID_GROUPS: Record< string, Array< keyof Notices > > = {
	settings_tool_tips: [ 'traffic_page_settings', 'traffic_page_highlights_module_settings' ],
	dashboard_notices: [ 'do_you_love_jetpack_stats' ],
};

/**
 * Only allow one notice in a conflict group to be active at a time.
 */
export const processConflictNotices = ( notices: Notices ): Notices => {
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

export function queryNotices( siteId: number | null ): Promise< Notices > {
	return wpcom.req.get( {
		method: 'GET',
		apiNamespace: 'wpcom/v2',
		path: `/sites/${ siteId }/jetpack-stats-dashboard/notices`,
	} );
}

export default function useNoticeVisibilityQuery( siteId: number | null, noticeId: string ) {
	return useQuery( {
		queryKey: [ 'stats', 'notices-visibility', siteId ],
		queryFn: () => queryNotices( siteId ).then( processConflictNotices ),
		select: ( payload: Record< string, boolean > ): boolean => !! payload?.[ noticeId ],
		...QUERY_OPTIONS,
	} );
}

export function useNoticesVisibilityQueryRaw( siteId: number | null ) {
	return useQuery( {
		queryKey: [ 'stats', 'notices-visibility', siteId ],
		queryFn: () => queryNotices( siteId ),
		...QUERY_OPTIONS,
	} );
}
