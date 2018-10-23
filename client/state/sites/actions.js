/** @format */

/**
 * External dependencies
 */

import { omit } from 'lodash';
import i18n from 'i18n-calypso';

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
	SITE_PLUGIN_UPDATED,
} from 'state/action-types';
import { SITE_REQUEST_FIELDS, SITE_REQUEST_OPTIONS } from 'state/sites/constants';
import 'state/data-layer/wpcom/sites/gutenberg';

/**
 * Returns an action object to be used in signalling that a site has been
 * deleted.
 *
 * @param  {Number} siteId  ID of deleted site
 * @return {Object}         Action object
 */
export function receiveDeletedSite( siteId ) {
	return {
		type: SITE_DELETE_RECEIVE,
		siteId,
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
		site,
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
		sites,
	};
}

/**
 * Triggers a network request to request all visible sites
 * @returns {Function}        Action thunk
 */
export function requestSites() {
	return dispatch => {
		dispatch( {
			type: SITES_REQUEST,
		} );

		return wpcom
			.me()
			.sites( {
				apiVersion: '1.2',
				site_visibility: 'all',
				include_domain_only: true,
				site_activity: 'active',
				fields: SITE_REQUEST_FIELDS,
				options: SITE_REQUEST_OPTIONS,
			} )
			.then( response => {
				dispatch( receiveSites( response.sites ) );
				dispatch( {
					type: SITES_REQUEST_SUCCESS,
				} );
			} )
			.catch( error => {
				dispatch( {
					type: SITES_REQUEST_FAILURE,
					error,
				} );
			} );
	};
}

/**
 * Returns a function which, when invoked, triggers a network request to fetch
 * a site.
 *
 * @param  {Number}   siteFragment Site ID or slug
 * @return {Function}              Action thunk
 */
export function requestSite( siteFragment ) {
	return dispatch => {
		dispatch( {
			type: SITE_REQUEST,
			siteId: siteFragment,
		} );

		return wpcom
			.site( siteFragment )
			.get()
			.then( site => {
				// If we can't manage the site, don't add it to state.
				if ( ! ( site && site.capabilities ) ) {
					return dispatch( {
						type: SITE_REQUEST_FAILURE,
						siteId: siteFragment,
						error: i18n.translate( 'No access to manage the site' ),
					} );
				}

				dispatch( receiveSite( omit( site, '_headers' ) ) );

				dispatch( {
					type: SITE_REQUEST_SUCCESS,
					siteId: siteFragment,
				} );
			} )
			.catch( error => {
				dispatch( {
					type: SITE_REQUEST_FAILURE,
					siteId: siteFragment,
					error,
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
			siteId,
		} );
		return wpcom
			.undocumented()
			.deleteSite( siteId )
			.then( () => {
				dispatch( receiveDeletedSite( siteId ) );
				dispatch( {
					type: SITE_DELETE_SUCCESS,
					siteId,
				} );
			} )
			.catch( error => {
				dispatch( {
					type: SITE_DELETE_FAILURE,
					siteId,
					error,
				} );
			} );
	};
}

export const sitePluginUpdated = siteId => ( {
	type: SITE_PLUGIN_UPDATED,
	siteId,
} );
