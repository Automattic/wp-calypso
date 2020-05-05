/**
 * Internal dependencies
 */

import wpcom from 'lib/wp';
import {
	SITE_MEDIA_STORAGE_RECEIVE,
	SITE_MEDIA_STORAGE_REQUEST,
	SITE_MEDIA_STORAGE_REQUEST_SUCCESS,
	SITE_MEDIA_STORAGE_REQUEST_FAILURE,
} from 'state/action-types';

/**
 * Returns an action object to be used in signalling that a mediaStorage object
 * has been received.
 *
 * @param  {object} mediaStorage received
 * @param  {number} siteId       Site ID
 * @returns {object}              Action object
 */
export function receiveMediaStorage( mediaStorage, siteId ) {
	return {
		type: SITE_MEDIA_STORAGE_RECEIVE,
		mediaStorage,
		siteId,
	};
}

/**
 * Triggers a network request to find media storage limits for a given site
 *
 * @param   {number}   siteId Site ID
 * @returns {Function}        Action thunk
 */
export function requestMediaStorage( siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: SITE_MEDIA_STORAGE_REQUEST,
			siteId,
		} );
		return wpcom
			.undocumented()
			.site( siteId )
			.mediaStorage()
			.then( ( mediaStorage ) => {
				dispatch( receiveMediaStorage( mediaStorage, siteId ) );
				dispatch( {
					type: SITE_MEDIA_STORAGE_REQUEST_SUCCESS,
					siteId,
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: SITE_MEDIA_STORAGE_REQUEST_FAILURE,
					siteId,
					error,
				} );
			} );
	};
}
