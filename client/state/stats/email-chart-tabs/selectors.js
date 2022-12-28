import { get } from 'lodash';
import { QUERY_FIELDS } from 'calypso/state/stats/chart-tabs/constants';

import 'calypso/state/stats/init';

const EMPTY_RESULT = [];

/**
 * Returns the count records for a given site and period
 *
 * @param   {object}  state    Global state tree
 * @param   {number}  siteId   Site ID
 * @param   {string}  period   Type of duration to include in the query (such as daily)
 * @returns {Array}            Array of count objects
 */
export function getCountRecords( state, siteId, period ) {
	return get( state, [ 'stats', 'chartTabs', 'counts', siteId, period ], EMPTY_RESULT );
}

/**
 * Returns an array of strings denoting the query fields that are still loading
 *
 * @param   {object}  state    Global state tree
 * @param   {number}  siteId   Site ID
 * @param   {number}  postId   Site ID
 * @param   {string}  period   Type of duration to include in the query (such as daily)
 * @returns {Array}          	 Array of stat types as strings
 */
export function getLoadingTabs( state, siteId, postId, period ) {
	return QUERY_FIELDS.filter( () =>
		get( state, [ 'stats', 'emails', 'requesting', siteId, postId, period ] )
	);
}
