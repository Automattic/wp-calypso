/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Retrieves Google My Business stats for the specified criteria.
 *
 * @param {Object} state - Global state tree
 * @param {Number} siteId - Id of the site
 * @param {String} statType - Type of metrics (e.g. 'queries')
 * @param {String} interval - Time period (e.g. 'month')
 * @param {String} aggregation - Type of aggregation (e.g. 'daily')
 * @return {Number} the corresponding stats, or null if not found
 */
export default function getGoogleMyBusinessStats( state, siteId, statType, interval, aggregation ) {
	return get(
		state,
		[ 'googleMyBusiness', siteId, 'stats', statType, interval, aggregation ],
		null
	);
}
