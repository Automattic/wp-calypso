/**
 * Internal dependencies
 */
import wp from 'lib/wp';
import {
	WP_SUPER_CACHE_RECEIVE_STATS,
	WP_SUPER_CACHE_GENERATE_STATS,
	WP_SUPER_CACHE_GENERATE_STATS_FAILURE,
	WP_SUPER_CACHE_GENERATE_STATS_SUCCESS,
} from '../action-types';

/**
 * Returns an action object to be used in signalling that stats have been received.
 *
 * @param  {Number} siteId Site ID
 * @param  {Object} stats Stats object
 * @return {Object} Action object
 */
export const receiveStats = ( siteId, stats ) => ( { type: WP_SUPER_CACHE_RECEIVE_STATS, siteId, stats } );

/*
 * Retrieves stats for a site.
 *
 * @param  {Number} siteId Site ID
 * @returns {Function} Action thunk that requests stats for a given site
 */
export const generateStats = ( siteId ) => {
	return ( dispatch ) => {
		dispatch( {
			type: WP_SUPER_CACHE_GENERATE_STATS,
			siteId,
		} );

		return wp.req.get( { path: `/jetpack-blogs/${ siteId }/rest-api/` }, { path: '/wp-super-cache/v1/stats' } )
			.then( ( { data } ) => {
				dispatch( receiveStats( siteId, data ) );
				dispatch( {
					type: WP_SUPER_CACHE_GENERATE_STATS_SUCCESS,
					siteId,
				} );
			} )
			.catch( () => {
				dispatch( {
					type: WP_SUPER_CACHE_GENERATE_STATS_FAILURE,
					siteId,
				} );
			} );
	};
};
