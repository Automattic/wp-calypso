import config from '@automattic/calypso-config';
import { PLAN_PERSONAL, PLAN_PREMIUM } from '@automattic/calypso-products';
import {
	STATS_TYPE_DEVICE_STATS,
	STATS_FEATURE_UTM_STATS,
	STAT_TYPE_SEARCH_TERMS,
	STAT_TYPE_VIDEO_PLAYS,
	STAT_TYPE_TOP_AUTHORS,
} from './constants';

export function statTypeToPlan( statType: string ) {
	if ( ! config.isEnabled( 'stats/paid-wpcom-v3' ) ) {
		return PLAN_PREMIUM;
	}

	// Commercial stats features that require the premium plan
	if (
		[
			STAT_TYPE_TOP_AUTHORS,
			STAT_TYPE_SEARCH_TERMS,
			STAT_TYPE_VIDEO_PLAYS,
			STATS_FEATURE_UTM_STATS,
			STATS_TYPE_DEVICE_STATS,
		].includes( statType )
	) {
		return PLAN_PREMIUM;
	}

	return PLAN_PERSONAL;
}
