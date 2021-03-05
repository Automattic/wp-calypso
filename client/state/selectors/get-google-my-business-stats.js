/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Retrieves Google My Business stats for the specified criteria.
 *
 * @param {object} state - Global state tree
 * @param {number} siteId - Id of the site
 * @param {string} statType - Type of metrics (e.g. 'queries')
 * @param {string} interval - Time period (e.g. 'month')
 * @param {string} aggregation - Type of aggregation (e.g. 'daily')
 * @returns {number} the corresponding stats, or null if not found
 */
export default function getGoogleMyBusinessStats( state, siteId, statType, interval, aggregation ) {
	return get(
		state,
		[ 'googleMyBusiness', siteId, 'stats', statType, interval, aggregation ],
		null
	);
}
