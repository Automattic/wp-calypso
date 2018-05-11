/** @format */

/**
 * Internal dependencies
 */

import wpcom from 'lib/wp';
import {
	SITE_KEYRINGS_RECEIVE,
	SITE_KEYRINGS_REQUEST,
	SITE_KEYRINGS_REQUEST_FAILURE,
	SITE_KEYRINGS_REQUEST_SUCCESS,
	SITE_KEYRINGS_SAVE,
	SITE_KEYRINGS_SAVE_FAILURE,
	SITE_KEYRINGS_SAVE_SUCCESS,
	SITE_KEYRINGS_UPDATE,
} from 'state/action-types';

/**
 * Returns an action object to be used in signalling that site keyrings have been received.
 *
 * @param  {Number} siteId Site ID
 * @param  {Object} keyrings The site keyrings object
 * @return {Object}        Action object
 */
export function receiveSiteKeyrings( siteId, keyrings ) {
	return {
		type: SITE_KEYRINGS_RECEIVE,
		siteId,
		keyrings,
	};
}

/**
 * Returns an action object to be used in signalling that some site keyrings have been update.
 *
 * @param  {Number} siteId Site ID
 * @param  {Object} keyrings The updated site settings
 * @return {Object}        Action object
 */
export function updateSiteKeyrings( siteId, keyrings ) {
	return {
		type: SITE_KEYRINGS_UPDATE,
		siteId,
		keyrings,
	};
}

/**
 * Returns an action thunk which, when invoked, triggers a network request to
 * retrieve site keyrings
 *
 * @param  {Number} siteId Site ID
 * @return {Function}      Action thunk
 */
export function requestSiteKeyrings( siteId ) {
	return dispatch => {
		dispatch( {
			type: SITE_KEYRINGS_REQUEST,
			siteId,
		} );

		return wpcom
			.undocumented()
			.keyrings( siteId )
			.then( ( { keyrings } ) => {
				dispatch( receiveSiteKeyrings( siteId, keyrings ) );
				dispatch( {
					type: SITE_KEYRINGS_REQUEST_SUCCESS,
					siteId,
				} );
			} )
			.catch( error => {
				dispatch( {
					type: SITE_KEYRINGS_REQUEST_FAILURE,
					siteId,
					error,
				} );
			} );
	};
}

export function saveSiteKeyrings( siteId, keyrings ) {
	return dispatch => {
		dispatch( {
			type: SITE_KEYRINGS_SAVE,
			siteId,
		} );

		return wpcom
			.undocumented()
			.keyrings( siteId, 'post', keyrings )
			.then( body => {
				dispatch( updateSiteKeyrings( siteId, body.updated ) );
				dispatch( {
					type: SITE_KEYRINGS_SAVE_SUCCESS,
					siteId,
				} );

				return body;
			} )
			.catch( error => {
				dispatch( {
					type: SITE_KEYRINGS_SAVE_FAILURE,
					siteId,
					error,
				} );

				return error;
			} );
	};
}
