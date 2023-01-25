import { get, sortBy } from 'lodash';

import 'calypso/state/stats/init';

const EMPTY_RESULT = [];

/**
 * Returns the count records for a given site and period
 *
 * @param   {Object}  state    Global state tree
 * @param   {number}  siteId   Site ID
 * @param   {number}  postId   Post ID
 * @param   {string}  period   Type of duration to include in the query (such as daily)
 * @param   {string}  statType The type of stat we are working with. For example: 'opens' for Email Open stats
 * @returns {Array}            Array of count objects
 */
export function getCountRecords( state, siteId, postId, period, statType ) {
	const stats = get( state.stats.emails.items, [ siteId, postId, period, statType ], null );
	return ! stats
		? EMPTY_RESULT
		: sortBy(
				Object.keys( stats ).map( ( key ) =>
					stats[ key ] && stats[ key ].chart ? stats[ key ].chart : {}
				),
				'period'
		  );
}

/**
 * Returns a boolean indicating if the tabs are still loading
 *
 * @param   {Object}  state       Global state tree
 * @param   {number}  siteId      Site ID
 * @param   {number}  postId      Post ID
 * @param   {string}  period      Type of duration to include in the query (such as daily)
 * @param   {string}  statType    The type of stat we are working with. For example: 'opens' for Email Open stats
 * @param   {string}  date        The date of the stat
 * @param   {number}  dataLength  The number of rows the data being shown has
 * @param   {number}  barNumber   The number of bars that the chart component can show at the moment
 * @returns {boolean}             If the query is still loading
 */
export function isLoadingTabs(
	state,
	siteId,
	postId,
	period,
	statType,
	date,
	dataLength,
	barNumber
) {
	const stats = get( state.stats.emails.items, [ siteId, postId, period, statType, date ], null );
	// if we have redux stats ready return false
	if ( dataLength < barNumber ) {
		return true;
	}
	if ( stats ) {
		return false;
	}
	return state.stats.emails
		? get(
				state.stats.emails.requests,
				[ siteId, postId, period, statType, date, 'requesting' ],
				false
		  )
		: false;
}
