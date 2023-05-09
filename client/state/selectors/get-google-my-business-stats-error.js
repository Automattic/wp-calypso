import { get } from 'lodash';

/**
 * Retrieves Google My Business stats error for the specified criteria.
 *
 * @param {Object} state - Global state tree
 * @param {number} siteId - Id of the site
 * @param {string} statType - Type of metrics (e.g. 'queries')
 * @param {string} interval - Time period (e.g. 'month')
 * @param {string} aggregation - Type of aggregation (e.g. 'daily')
 * @returns {Object} the corresponding stats error, or null if there is no error
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
