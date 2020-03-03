/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the current interval of a Google My Business stats chart or the
 * default value, 'week'
 *
 * @param  {object} state Global state tree
 * @param  {number} siteId Site ID
 * @param  {string} statType 'QUERIES' | 'VIEWS' | 'ACTIONS'
 * @returns {string} interval 'week' | 'month' | 'quarter'
 */
export function getStatsInterval( state, siteId, statType ) {
	return get( state.ui.googleMyBusiness, [ siteId, 'statsInterval', statType ], 'week' );
}
