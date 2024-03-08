import { get } from 'lodash';
import 'calypso/state/stats/init';

export function getStatsNoticeSettings( state, siteId ) {
	return get( state, [ 'stats', 'notices', siteId ], null );
}

export function isStatsNoticeSettingsFetching( state ) {
	return state.stats?.notices?.isFetching;
}
