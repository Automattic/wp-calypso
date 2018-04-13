/** @format */

/**
 * Internal dependencies
 */
import { GOOGLE_MY_BUSINESS_STATS_CHANGE_INTERVAL } from 'state/action-types';

export const changeGoogleMyBusinessStatsInterval = ( siteId, statType, interval ) => ( {
	type: GOOGLE_MY_BUSINESS_STATS_CHANGE_INTERVAL,
	siteId,
	statType,
	interval,
} );
