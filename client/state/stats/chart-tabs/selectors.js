/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { QUERY_FIELDS } from 'state/stats/chart-tabs/constants';

const EMPTY_RESULT = [];

/**
 * Returns the count records for a given site and period
 *
 * @param   {Object}  state    Global state tree
 * @param   {Number}  siteId   Site ID
 * @param   {string}  period   Type of duration to include in the query (such as daily)
 * @returns {Array}            Array of count objects
 */
export function getCountRecords( state, siteId, period ) {
	return get( state, [ 'stats', 'chartTabs', 'counts', siteId, period ], EMPTY_RESULT );
}

/**
 * Returns an array of strings denoting the query fields that are still loading
 *
 * @param   {Object}  state    Global state tree
 * @param   {Number}  siteId   Site ID
 * @param   {string}  period   Type of duration to include in the query (such as daily)
 * @returns {Array}          	 Array of stat types as strings
 */
export function getLoadingTabs( state, siteId, period ) {
	return QUERY_FIELDS.filter( type =>
		get( state, [ 'stats', 'chartTabs', 'isLoading', siteId, period, type ] )
	);
}
