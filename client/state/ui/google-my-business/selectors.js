/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the current interval of a Google My Business stats chart or the
 * default value, 'week'
 *
 * @param  {Object} state Global state tree
 * @param  {Number} siteId Site ID
 * @param  {String} statType 'QUERIES' | 'VIEWS' | 'ACTIONS'
 * @return {String} interval 'week' | 'month' | 'quarter'
 */
export function getStatsInterval( state, siteId, statType ) {
	return get( state.ui.googleMyBusiness, [ siteId, 'statsInterval', statType ], 'week' );
}
