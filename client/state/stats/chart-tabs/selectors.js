import { get } from 'lodash';
import { QUERY_FIELDS } from 'calypso/state/stats/chart-tabs/constants';

import 'calypso/state/stats/init';

const EMPTY_RESULT = [];

/**
 * Returns the count records for a given site and period
 * @param   {Object} state Global state tree
 * @param   {number} siteId Site ID
 * @param   {string} date The most recent day to include in results (YYYY-MM-DD format)
 * @param   {string} period Type of duration to include in the query (such as daily)
 * @param   {number} quantity Number of periods to include in the query
 * @returns {Array} Array of count objects
 */
export function getCountRecords( state, siteId, date, period, quantity ) {
	const requestKey = `${ date }-${ period }-${ quantity }`;

	return get( state, [ 'stats', 'chartTabs', 'counts', siteId, requestKey ], EMPTY_RESULT );
}

/**
 * Returns an array of strings denoting the query fields that are still loading
 * @param   {Object} state Global state tree
 * @param   {number} siteId Site ID
 * @param   {string} date The most recent day to include in results (YYYY-MM-DD format)
 * @param   {string} period Type of duration to include in the query (such as daily)
 * @param   {number} quantity Number of periods to include in the query
 * @returns {Array}  Array of stat types as strings
 */
export function getLoadingTabs( state, siteId, date, period, quantity ) {
	const requestKey = `${ date }-${ period }-${ quantity }`;

	return QUERY_FIELDS.filter( ( type ) =>
		get( state, [ 'stats', 'chartTabs', 'isLoading', siteId, requestKey, type ] )
	);
}
