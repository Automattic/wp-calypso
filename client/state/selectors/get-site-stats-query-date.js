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
 * @param  {Object}  state    Global state tree
 * @param  {Number}  siteId   Site ID
 * @param  {String}  statType Type of stat
 * @param  {Object}  query    Stats query object
 * @return {Date}             Date of the last site stats query
 */
export default function getSiteStatsQueryDate( state, siteId, statType, query ) {
	const serializedQuery = getSerializedStatsQuery( query );
	return get( state.stats.lists.requests, [ siteId, statType, serializedQuery, 'date' ] );
}
