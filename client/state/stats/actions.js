/**
 * Internal dependencies
 */
import { SITE_STATS_RECEIVE } from 'state/action-types';

/**
 * Returns an action object to be used in signalling that a site stats object has
 * been received.
 *
 * @param  {Object} siteStats The Site Stats received
 * @return {Object}      Action object
 */
export function siteStatsReceive( siteStats ) {
	console.log('siteStatsReceive');
	return {
		type: SITE_STATS_RECEIVE,
		siteStats
	};
}
