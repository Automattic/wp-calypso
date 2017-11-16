/** @format */

/**
 * Internal dependencies
 */

import wpcom from 'lib/wp';
import {
	SITE_CHECKLIST_RECEIVE,
	SITE_CHECKLIST_REQUEST,
	SITE_CHECKLIST_REQUEST_FAILURE,
	SITE_CHECKLIST_REQUEST_SUCCESS,
} from 'state/action-types';

/**
 * Returns an action object to be used in signalling that site settings have been received.
 *
 * @param  {Number} siteId Site ID
 * @param  {Object} checklist The site checklist object
 * @return {Object}        Action object
 */
export function receiveSiteChecklist( siteId, checklist ) {
	return {
		type: SITE_CHECKLIST_RECEIVE,
		siteId,
		checklist,
	};
}

/**
 * Returns an action thunk which, when invoked, triggers a network request to
 * retrieve a site checklist
 *
 * @param  {Number} siteId Site ID
 * @return {Function}      Action thunk
 */
export function requestSiteChecklist( siteId ) {
	return dispatch => {
		dispatch( {
			type: SITE_CHECKLIST_REQUEST,
			siteId,
		} );

		return wpcom
			.undocumented()
			.checklist( siteId )
			.then( ( { data } ) => {
				dispatch( receiveSiteChecklist( siteId, data ) );
				dispatch( {
					type: SITE_CHECKLIST_REQUEST_SUCCESS,
					siteId,
				} );
			} )
			.catch( error => {
				dispatch( {
					type: SITE_CHECKLIST_REQUEST_FAILURE,
					siteId,
					error,
				} );
			} );
	};
}
