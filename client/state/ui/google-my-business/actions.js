/** @format */

/**
 * Internal dependencies
 */
import { GOOGLE_MY_BUSINESS_STATS_CHANGE_INTERVAL } from 'state/action-types';

/**
 * Returns an action object to be used in signalling that the interval of the
 * Google My Business stats chart should change
 *
 * @param  {Number} siteId Site ID
 * @param  {String} statType 'QUERIES' | 'VIEWS' | 'ACTIONS'
 * @param  {String} interval 'week' | 'month' | 'quarter'
 * @return {Object} Action object
 */
export const changeGoogleMyBusinessStatsInterval = ( siteId, statType, interval ) => ( {
	type: GOOGLE_MY_BUSINESS_STATS_CHANGE_INTERVAL,
	siteId,
	statType,
	interval,
} );
