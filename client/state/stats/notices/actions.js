import {
	STATS_JETPACK_NOTICE_SETTINGS_REQUEST,
	STATS_JETPACK_NOTICE_SETTINGS_RECEIVE,
	STATS_JETPACK_NOTICE_SETTINGS_FAILURE,
} from 'calypso/state/action-types';
import 'calypso/state/stats/init';

export function requestStatNoticeSettings( siteId ) {
	return { type: STATS_JETPACK_NOTICE_SETTINGS_REQUEST, siteId };
}

export function receiveStatNoticeSettings( siteId, data ) {
	return { type: STATS_JETPACK_NOTICE_SETTINGS_RECEIVE, siteId, data };
}

export function requestStatNoticeSettingsFailure( siteId ) {
	return { type: STATS_JETPACK_NOTICE_SETTINGS_FAILURE, siteId };
}
