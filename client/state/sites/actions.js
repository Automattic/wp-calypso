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
	SITES_UPDATE
} from 'state/action-types';

/**
 * Returns an action object to be used in signalling that a site has been
 * deleted.
 *
 * @param  {Number} siteId  ID of deleted site
 * @param  {Boolean} silent Indicates to not show the global notice after the site is removed from the state.
 * @return {Object}         Action object
 */
export function receiveDeletedSite( siteId, silent = false ) {
	return {
		type: SITE_DELETE_RECEIVE,
		siteId,
		silent
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
export function receiveSites( sites ) {
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
 * Returns an action object that signals the intention to request all visible sites
 * @returns {Object} Action object
 */
export function requestSites() {
	return {
		type: SITES_REQUEST
	};
}

/**
 * Returns a function which, when invoked, triggers a network request to fetch
 * a site.
 *
 * @param  {Number}   siteId Site ID
 * @return {Function}        Action thunk
 */
export function requestSite( siteId ) {
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
