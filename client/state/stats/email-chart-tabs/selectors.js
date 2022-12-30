import { get } from 'lodash';

import 'calypso/state/stats/init';

const EMPTY_RESULT = [];

/**
 * Returns the count records for a given site and period
 *
 * @param   {object}  state    Global state tree
 * @param   {number}  siteId   Site ID
 * @param   {number}  postId   Post ID
 * @param   {string}  period   Type of duration to include in the query (such as daily)
 * @param   {string}  statType The type of stat we are working with. For example: 'opens' for Email Open stats
 * @returns {Array}            Array of count objects
 */
export function getCountRecords( state, siteId, postId, period, statType ) {
	const stats = get( state.stats.emails.items, [ siteId, postId, period, statType ], null );

	return stats ? Object.keys( stats ).map( ( key ) => stats[ key ] ) || EMPTY_RESULT : EMPTY_RESULT;
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
export function isLoadingTabs( state, siteId, postId, period, statType ) {
	return state.stats.emails
		? get( state.stats.emails.requests, [ siteId, postId, period, statType, 'requesting' ], false )
		: false;
}
