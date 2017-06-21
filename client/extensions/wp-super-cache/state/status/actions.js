/**
 * Internal dependencies
 */
import wp from 'lib/wp';
import {
	WP_SUPER_CACHE_RECEIVE_STATUS,
	WP_SUPER_CACHE_REQUEST_STATUS,
	WP_SUPER_CACHE_REQUEST_STATUS_FAILURE,
} from '../action-types';

/**
 * Returns an action object to be used in signalling that notices have been received.
 *
 * @param  {Number} siteId Site ID
 * @param  {Object} notices Notices object
 * @return {Object} Action object
 */
export const receiveNotices = ( siteId, notices ) => ( { type: WP_SUPER_CACHE_RECEIVE_STATUS, siteId, notices } );

/*
 * Retrieves notices for a site.
 *
 * @param  {Number} siteId Site ID
 * @returns {Function} Action thunk that requests notices for a given site
 */
export const requestStatus = ( siteId ) => {
	return ( dispatch ) => {
		dispatch( {
			type: WP_SUPER_CACHE_REQUEST_STATUS,
			siteId,
		} );

		return wp.req.get( { path: `/jetpack-blogs/${ siteId }/rest-api/` }, { path: '/wp-super-cache/v1/notices' } )
			.then( ( { data } ) => dispatch( receiveNotices( siteId, data ) ) )
			.catch( () => dispatch( { type: WP_SUPER_CACHE_REQUEST_STATUS_FAILURE } ) );
	};
};
