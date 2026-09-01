import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import getDefaultQueryParams from './default-query-params';

export const NOTICES_KEY_ABLE_TO_SUBMIT_FEEDBACK = 'able_to_submit_user_feedback';
export const NOTICES_KEY_SHOW_FLOATING_USER_FEEDBACK_PANEL = 'show_floating_user_feedback_panel';

const DEFAULT_SERVER_NOTICES_VISIBILITY = {
	opt_in_new_stats: false,
	do_you_love_jetpack_stats: false,
	commercial_site_upgrade: false,
	// Defaults to hidden until the server includes it in the notices response,
	// so the client can ship ahead of the WPCOM allow-list change.
	free_site_upgrade: false,
	// The server reports this id (true until a dismissal is in effect), so the
	// default only covers request failures: the grid stays hidden rather than
	// rendering without a working dismissal round-trip.
	pricing_grid: false,
	// Defaults to hidden until the server includes it in the notices response,
	// so the client can ship ahead of the WPCOM allow-list change.
	traffic_tab_preview: false,
	// TODO: Check if the site needs to be upgraded to a higher tier on the back end.
	tier_upgrade: true,
	gdpr_cookie_consent: false,
	[ NOTICES_KEY_ABLE_TO_SUBMIT_FEEDBACK ]: true,
	[ NOTICES_KEY_SHOW_FLOATING_USER_FEEDBACK_PANEL ]: true,
};
const DEFAULT_CLIENT_NOTICES_VISIBILITY = {
	client_paid_plan_purchase_success: true,
	client_free_plan_purchase_success: true,
};
export const DEFAULT_NOTICES_VISIBILITY = {
	...DEFAULT_CLIENT_NOTICES_VISIBILITY,
	...DEFAULT_SERVER_NOTICES_VISIBILITY,
};
export type Notices = typeof DEFAULT_NOTICES_VISIBILITY;
export type NoticeIdType = keyof Notices;

// These notices are mutually exclusive, so if one is active, the other should be hidden.
// The IDs are sorted by priory from high to low.
// `pricing_grid` is deliberately NOT in this group even though the grid trumps every
// notice: it replaces the whole dashboard, so StatsNotices never mounts alongside it
// and no suppression is needed. Listing it here would instead suppress every other
// notice on all the sites that never see the grid (pre-launch sites, sites with
// plans), since the server reports the id as visible until a dismissal is recorded.
const CONFLICT_NOTICE_ID_GROUPS: Record< string, Array< NoticeIdType > > = {
	dashboard_notices: [
		// Set the highest priority to prevent blocking Stats under any circumstances.
		'gdpr_cookie_consent',
		'client_paid_plan_purchase_success',
		'client_free_plan_purchase_success',
		// Above the upsells: the preview invitation is temporary and cohort-limited, and the
		// upsells return as soon as it is dismissed or accepted.
		'traffic_tab_preview',
		// The two legacy upsell ids and `free_site_upgrade` are mutually exclusive: their
		// registry entries are enabled on opposite sides of the commercial paywall kill switch.
		'do_you_love_jetpack_stats',
		'commercial_site_upgrade',
		'free_site_upgrade',
		// TODO: Check if the current usage is over the tier limit inside the isVisibleFunc.
		'tier_upgrade',
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

/**
 * `free_site_upgrade` replaced the two upsell notices below, so a site that dismissed or
 * postponed either of them shouldn't meet the successor until that hiding lapses. The server
 * only reports an id as hidden while a dismissal is in effect, so a missing key means
 * "not dismissed". Drop this inheritance if the legacy ids ever leave the server response.
 */
export const normalizeNoticesVisibility = (
	payload: Partial< Notices > | null | undefined
): Notices => {
	const notices = { ...DEFAULT_NOTICES_VISIBILITY, ...payload };
	notices.free_site_upgrade =
		notices.free_site_upgrade &&
		payload?.do_you_love_jetpack_stats !== false &&
		payload?.commercial_site_upgrade !== false;
	return notices;
};

const queryNotices = async function ( siteId: number | null ): Promise< Notices > {
	let payload;

	try {
		payload = await wpcom.req.get( {
			method: 'GET',
			apiNamespace: 'wpcom/v2',
			path: `/sites/${ siteId }/jetpack-stats-dashboard/notices`,
		} );
	} catch ( error ) {
		return DEFAULT_NOTICES_VISIBILITY;
	}

	return normalizeNoticesVisibility( payload );
};

const useNoticesVisibilityQueryRaw = function < T >(
	siteId: number | null,
	select?: ( payload: Notices ) => T,
	enabled?: boolean
) {
	return useQuery( {
		...getDefaultQueryParams(),
		queryKey: [ 'stats', 'notices-visibility', 'raw', siteId ],
		queryFn: () => queryNotices( siteId ),
		select,
		enabled: enabled !== false,
	} );
};

export function useNoticeVisibilityQuery(
	siteId: number | null,
	noticeId: NoticeIdType,
	enabled?: boolean
) {
	const selectVisibilityForSingleNotice = ( payload: Notices ) => {
		payload = processConflictNotices( payload );
		return !! payload?.[ noticeId ];
	};
	return useNoticesVisibilityQueryRaw< boolean >(
		siteId,
		selectVisibilityForSingleNotice,
		enabled
	);
}

export function useNoticesVisibilityQuery( siteId: number | null ) {
	return useNoticesVisibilityQueryRaw< Notices >( siteId );
}
