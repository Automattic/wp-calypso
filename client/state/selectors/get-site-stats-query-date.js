/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getSerializedStatsQuery } from 'state/stats/lists/utils';

/**
 * Returns the date of the last site stats query
 *
 * @param  {object}  state    Global state tree
 * @param  {number}  siteId   Site ID
 * @param  {string}  statType Type of stat
 * @param  {object}  query    Stats query object
 * @returns {Date}             Date of the last site stats query
 */
export default function getSiteStatsQueryDate( state, siteId, statType, query ) {
	const serializedQuery = getSerializedStatsQuery( query );
	return get( state.stats.lists.requests, [ siteId, statType, serializedQuery, 'date' ] );
}
