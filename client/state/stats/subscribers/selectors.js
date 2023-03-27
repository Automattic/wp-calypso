import { get } from 'lodash';
import 'calypso/state/stats/init';

/**
 * Returns sunscribers for site id
 *
 * @param  {Object}  state    Global state tree
 * @param  {number}  siteId   Site ID
 * @returns {Object}          Data containing subscribers
 */
export function getSiteStatsSubscribers( state, siteId ) {
	return get( state, [ 'stats', 'subscribers', siteId ], null );
}
