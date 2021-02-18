/**
 * Internal dependencies
 */
import { GOOGLE_MY_BUSINESS_STATS_CHANGE_INTERVAL } from 'calypso/state/action-types';

import 'calypso/state/google-my-business/init';

/**
 * Returns an action object to be used in signalling that the interval of the
 * Google My Business stats chart should change
 *
 * @param  {number} siteId Site ID
 * @param  {string} statType 'QUERIES' | 'VIEWS' | 'ACTIONS'
 * @param  {string} interval 'week' | 'month' | 'quarter'
 * @returns {object} Action object
 */
export const changeGoogleMyBusinessStatsInterval = ( siteId, statType, interval ) => ( {
	type: GOOGLE_MY_BUSINESS_STATS_CHANGE_INTERVAL,
	siteId,
	statType,
	interval,
} );
