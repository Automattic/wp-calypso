/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	SITE_RECEIVE,
	SITE_REQUEST,
	SITE_REQUEST_FAILURE,
	SITE_REQUEST_SUCCESS,
	SITES_RECEIVE,
	SITES_REQUEST,
	SITES_REQUEST_SUCCESS,
	SITES_REQUEST_FAILURE
} from 'state/action-types';
import { omit } from 'lodash';

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
 * Returns an action object to be used in signalling that a sites object has
 * been received.
 *
 * @param  {Object} sites Sites received
 * @return {Object}       Action object
 */
export function receiveSites( sites ) {
	return {
		type: SITES_RECEIVE,
		sites
	};
}

/**
 * Triggers a network request to request all visible sites
 * @returns {Function}        Action thunk
 */
export function requestSites() {
	return ( dispatch ) => {
		dispatch( {
			type: SITES_REQUEST
		} );
		return wpcom.me().sites( { site_visibility: 'all' } ).then( ( response ) => {
			dispatch( receiveSites( response.sites ) );
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
