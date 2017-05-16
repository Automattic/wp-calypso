/**
 * External dependencies
 */
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	SITE_DELETE,
	SITE_DELETE_FAILURE,
	SITE_DELETE_RECEIVE,
	SITE_DELETE_SUCCESS,
	SITE_RECEIVE,
	SITE_REQUEST,
	SITE_REQUEST_FAILURE,
	SITE_REQUEST_SUCCESS,
	SITES_RECEIVE,
	SITES_REQUEST,
	SITES_REQUEST_SUCCESS,
	SITES_REQUEST_FAILURE,
	SITES_UPDATE
} from 'state/action-types';
import { hasNewlyConnectedSite } from 'state/jetpack-connect/selectors';

/**
 * Returns an action object to be used in signalling that a site has been
 * deleted.
 *
 * @param  {Number} siteId ID of deleted site
 * @return {Object}        Action object
 */
export function receiveDeletedSite( siteId ) {
	return {
		type: SITE_DELETE_RECEIVE,
		siteId
	};
}

/**
 * Returns an action object to be used in signalling that a site object has
 * been received.
 *
 * @param  {Object} site Site received
 * @return {Object}      Action object
 */
export function receiveSite( site ) {
	return {
		type: SITE_RECEIVE,
		site
	};
}

/**
 * Returns an action object to be used in signalling that site objects have
 * been received.
 *
 * @param  {Object[]} sites Sites received
 * @return {Object}         Action object
 */
export function receiveSites( sites, getState ) {
	if ( hasNewlyConnectedSite( getState() ) ) {
		return {
			type: SITES_UPDATE,
			sites
		};
	}
	return {
		type: SITES_RECEIVE,
		sites
	};
}

/**
 * Returns an action object to be used in signalling that sites objects have
 * been updated.
 *
 * @param  {Object[]} sites Sites updated
 * @return {Object}         Action object
 */
export function receiveSiteUpdates( sites ) {
	return {
		type: SITES_UPDATE,
		sites
	};
}

/**
 * Triggers a network request to request all visible sites
 * @returns {Function}        Action thunk
 */
export function requestSites() {
	return ( dispatch, getState ) => {
		dispatch( {
			type: SITES_REQUEST
		} );
		return wpcom.me().sites( { site_visibility: 'all', include_domain_only: true } ).then( ( response ) => {
			dispatch( receiveSites( response.sites, getState ) );
			dispatch( {
				type: SITES_REQUEST_SUCCESS
			} );
		} ).catch( ( error ) => {
			dispatch( {
				type: SITES_REQUEST_FAILURE,
				error
			} );
		} );
	};
}

/**
 * Returns a function which, when invoked, triggers a network request to fetch
 * a site.
 *
 * @param  {Number}   siteId              Site ID
 * @param  {Boolean}  removeSiteOnFailure Remove the site from list if request fails
 * @return {Function}        Action thunk
 */
export function requestSite( siteId, removeSiteOnFailure = false ) {
	return ( dispatch ) => {
		dispatch( {
			type: SITE_REQUEST,
			siteId
		} );

		return wpcom.site( siteId ).get().then( ( site ) => {
			dispatch( receiveSite( omit( site, '_headers' ) ) );
			dispatch( {
				type: SITE_REQUEST_SUCCESS,
				siteId
			} );
		} ).catch( ( error ) => {
			dispatch( {
				type: SITE_REQUEST_FAILURE,
				siteId,
				error
			} );
			if ( removeSiteOnFailure ) {
				dispatch( receiveDeletedSite( siteId ) );
			}
		} );
	};
}

/**
 * Returns a function which, when invoked, triggers a network request to delete
 * a site.
 *
 * @param  {Number}   siteId Site ID
 * @return {Function}        Action thunk
 */
export function deleteSite( siteId ) {
	return dispatch => {
		dispatch( {
			type: SITE_DELETE,
			siteId
		} );
		return wpcom.undocumented().deleteSite( siteId ).then( () => {
			dispatch( receiveDeletedSite( siteId ) );
			dispatch( {
				type: SITE_DELETE_SUCCESS,
				siteId
			} );
		} ).catch( error => {
			dispatch( {
				type: SITE_DELETE_FAILURE,
				siteId,
				error
			} );
		} );
	};
}
