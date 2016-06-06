/**
 * External dependencies
 */
import omit from 'lodash/omit';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	SITE_STATS_RECEIVE,
	SITE_STATS_REQUEST,
	SITE_STATS_REQUEST_FAILURE,
	SITE_STATS_REQUEST_SUCCESS
} from 'state/action-types';

/**
 * Returns an action object to be used in signalling that stats for a given type of stats and query
 * have been received.
 *
 * @param  {Number} siteId   Site ID
 * @param  {String} statType Stat Key
 * @param  {Object} query    Stats query
 * @param  {Array}  data     Stat Data
 * @return {Object}          Action object
 */
export function receiveSiteStats( siteId, statType, query, data ) {
	return {
		type: SITE_STATS_RECEIVE,
		statType,
		siteId,
		query,
		data
	};
}

/**
 * Returns an action thunk which, when invoked, triggers a network request to
 * retrieve site stats.
 *
 * @param  {Number} siteId   Site ID
 * @param  {String} statType Type of stats
 * @param  {Object} query    Stats Query
 * @return {Function}        Action thunk
 */
export function requestSiteStats( siteId, statType, query ) {
	return ( dispatch ) => {
		dispatch( {
			type: SITE_STATS_REQUEST,
			statType,
			siteId,
			query
		} );

		return wpcom.site( siteId )[ statType ]( query ).then( data => {
			dispatch( receiveSiteStats( siteId, statType, query, omit( data, '_headers' ) ) );
			dispatch( {
				type: SITE_STATS_REQUEST_SUCCESS,
				statType,
				siteId,
				query
			} );
		} ).catch( error => {
			dispatch( {
				type: SITE_STATS_REQUEST_FAILURE,
				statType,
				siteId,
				query,
				error
			} );
		} );
	};
}
