/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Retrieves Google My Business stats error for the specified criteria.
 *
 * @param {object} state - Global state tree
 * @param {Number} siteId - Id of the site
 * @param {String} statType - Type of metrics (e.g. 'queries')
 * @param {String} interval - Time period (e.g. 'month')
 * @param {String} aggregation - Type of aggregation (e.g. 'daily')
 * @return {object} the corresponding stats error, or null if there is no error
 */
export default function getGoogleMyBusinessStatsError(
	state,
	siteId,
	statType,
	interval,
	aggregation
) {
	return get(
		state,
		[ 'googleMyBusiness', siteId, 'statsError', statType, interval, aggregation ],
		null
	);
}
