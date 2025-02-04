import { STATS_CHART_COUNTS_REQUEST, STATS_CHART_COUNTS_RECEIVE } from 'calypso/state/action-types';
import 'calypso/state/data-layer/wpcom/sites/stats/visits';

import 'calypso/state/stats/init';

/**
 * Returns an action thunk which, when invoked, triggers a network request to
 * retrieve visitor counts for StatsChartTabs.
 * @param   {string} date The most recent day to include in results (YYYY-MM-DD format)
 * @param   {string} period Type of duration to include in the query (such as daily)
 * @param   {number} quantity Number of periods to include in the query
 * @param   {number} siteId Site ID
 * @param   {Array} statFields Comma separated list of stat fields
 * @returns {Object} Action object
 */

export function requestChartCounts( {
	chartTab,
	date,
	chartStart,
	period,
	quantity,
	siteId,
	statFields,
} ) {
	const requestKey = `${ date }-${ period }-${ quantity }`;

	return {
		type: STATS_CHART_COUNTS_REQUEST,
		chartTab,
		date,
		chartStart,
		period,
		quantity,
		siteId,
		statFields,
		requestKey,
	};
}

/**
 * Returns an action object to be used in signalling that a visitor count object has
 * been received.
 * @param   {number} siteId Site ID
 * @param   {string} date The most recent day to include in results (YYYY-MM-DD format)
 * @param   {string} period Type of duration to include in the query (such as daily)
 * @param   {number} quantity Number of periods to include in the query
 * @param   {Object} data Visitor counts API response
 * @returns {Object} Action object
 */
export function receiveChartCounts( siteId, date, period, quantity, data ) {
	const requestKey = `${ date }-${ period }-${ quantity }`;

	return {
		type: STATS_CHART_COUNTS_RECEIVE,
		siteId,
		period,
		data,
		requestKey,
	};
}
