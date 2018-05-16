/** @format */

/**
 * Internal dependencies
 */

import wpcom from 'lib/wp';
import {
	SITE_KEYRINGS_REQUEST,
	SITE_KEYRINGS_REQUEST_FAILURE,
	SITE_KEYRINGS_REQUEST_SUCCESS,
	SITE_KEYRINGS_SAVE,
	SITE_KEYRINGS_SAVE_FAILURE,
	SITE_KEYRINGS_SAVE_SUCCESS,
	SITE_KEYRINGS_DELETE,
	SITE_KEYRINGS_DELETE_FAILURE,
	SITE_KEYRINGS_DELETE_SUCCESS,
} from 'state/action-types';

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
			.getSiteKeyrings( siteId )
			.then( keyrings => {
				dispatch( {
					type: SITE_KEYRINGS_REQUEST_SUCCESS,
					siteId,
					keyrings,
				} );
			} )
			.catch( error => {
				dispatch( {
					type: SITE_KEYRINGS_REQUEST_FAILURE,
					siteId,
					error,
				} );

				return Promise.reject( error );
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
			.createSiteKeyring( siteId, keyrings )
			.then( body => {
				dispatch( {
					type: SITE_KEYRINGS_SAVE_SUCCESS,
					siteId,
					keyrings,
				} );

				return body;
			} )
			.catch( error => {
				dispatch( {
					type: SITE_KEYRINGS_SAVE_FAILURE,
					siteId,
					error,
				} );

				return Promise.reject( error );
			} );
	};
}

export function deleteSiteKeyring( siteId, keyringSiteId ) {
	return dispatch => {
		dispatch( {
			type: SITE_KEYRINGS_DELETE,
			siteId,
			keyringSiteId,
		} );

		return wpcom
			.undocumented()
			.deleteSiteKeyring( siteId, keyringSiteId )
			.then( body => {
				dispatch( {
					type: SITE_KEYRINGS_DELETE_SUCCESS,
					siteId,
					keyringSiteId,
				} );

				return body;
			} )
			.catch( error => {
				dispatch( {
					type: SITE_KEYRINGS_DELETE_FAILURE,
					error,
					siteId,
					keyringSiteId,
				} );

				return Promise.reject( error );
			} );
	};
}
