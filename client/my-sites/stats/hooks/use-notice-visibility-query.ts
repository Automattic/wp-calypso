import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

const DEFAULT_SERVER_NOTICES_VISIBILITY = {
	opt_in_new_stats: false,
	traffic_page_highlights_module_settings: false,
	traffic_page_settings: false,
	do_you_love_jetpack_stats: false,
	commercial_site_upgrade: false,
	// TODO: Check if the site needs to be upgraded to a higher tier on the back end.
	tier_upgrade_notice: true,
};
const DEFAULT_CLIENT_NOTICES_VISIBILITY = {
	client_paid_plan_purchase_success: true,
	client_free_plan_purchase_success: true,
};
const DEFAULT_NOTICES_VISIBILITY = {
	...DEFAULT_CLIENT_NOTICES_VISIBILITY,
	...DEFAULT_SERVER_NOTICES_VISIBILITY,
};
export type Notices = typeof DEFAULT_NOTICES_VISIBILITY;
export type NoticeIdType = keyof Notices;

// These notices are mutually exclusive, so if one is active, the other should be hidden.
// The IDs are sorted by priory from high to low.
const CONFLICT_NOTICE_ID_GROUPS: Record< string, Array< NoticeIdType > > = {
	settings_tool_tips: [ 'traffic_page_settings', 'traffic_page_highlights_module_settings' ],
	dashboard_notices: [
		'client_paid_plan_purchase_success',
		'client_free_plan_purchase_success',
		'do_you_love_jetpack_stats',
		'commercial_site_upgrade',
		'tier_upgrade_notice',
	],
};

/**
 * Only allow one notice in a conflict group to be active at a time.
 */
export const processConflictNotices = ( notices: Notices ): Notices => {
	notices = { ...notices };
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

const queryNotices = async function ( siteId: number | null ): Promise< Notices > {
	const payload = await wpcom.req.get( {
		method: 'GET',
		apiNamespace: 'wpcom/v2',
		path: `/sites/${ siteId }/jetpack-stats-dashboard/notices`,
	} );

	return { ...DEFAULT_NOTICES_VISIBILITY, ...payload };
};

const useNoticesVisibilityQueryRaw = function < T >(
	siteId: number | null,
	select?: ( payload: Notices ) => T
) {
	return useQuery( {
		queryKey: [ 'stats', 'notices-visibility', 'raw', siteId ],
		queryFn: () => queryNotices( siteId ),
		select,
		staleTime: 1000 * 30, // 30 seconds
		retry: 1,
		retryDelay: 3 * 1000, // 3 seconds,
	} );
};

export function useNoticeVisibilityQuery( siteId: number | null, noticeId: NoticeIdType ) {
	const selectVisibilityForSingleNotice = ( payload: Notices ) => {
		payload = processConflictNotices( payload );
		return !! payload?.[ noticeId ];
	};
	return useNoticesVisibilityQueryRaw< boolean >( siteId, selectVisibilityForSingleNotice );
}

export function useNoticesVisibilityQuery( siteId: number | null ) {
	return useNoticesVisibilityQueryRaw< Notices >( siteId );
}
