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
 * Returns an action object to be used in signalling that status have been received.
 *
 * @param  {number} siteId Site ID
 * @param  {object} status Status object
 * @returns {object} Action object
 */
export const receiveStatus = ( siteId, status ) => ( {
	type: WP_SUPER_CACHE_RECEIVE_STATUS,
	siteId,
	status,
} );

/*
 * Retrieves status for a site.
 *
 * @param  {number} siteId Site ID
 * @returns {Function} Action thunk that requests status for a given site
 */
export const requestStatus = ( siteId ) => {
	return ( dispatch ) => {
		dispatch( {
			type: WP_SUPER_CACHE_REQUEST_STATUS,
			siteId,
		} );

		return wp.req
			.get(
				{ path: `/jetpack-blogs/${ siteId }/rest-api/` },
				{ path: '/wp-super-cache/v1/status' }
			)
			.then( ( { data } ) => dispatch( receiveStatus( siteId, data ) ) )
			.catch( () => dispatch( { type: WP_SUPER_CACHE_REQUEST_STATUS_FAILURE } ) );
	};
};
