/**
 * Internal dependencies
 */

import wpcom from 'lib/wp';
import {
	PAGE_TEMPLATES_RECEIVE,
	PAGE_TEMPLATES_REQUEST,
	PAGE_TEMPLATES_REQUEST_FAILURE,
	PAGE_TEMPLATES_REQUEST_SUCCESS,
} from 'state/action-types';

/**
 * Returns an action object used in signalling that a set of templates has been
 * received for a site.
 *
 * @param  {number}   siteId    Site ID
 * @param  {object[]} templates Array of template objects
 * @returns {object}             Action object
 */
export function receivePageTemplates( siteId, templates ) {
	return {
		type: PAGE_TEMPLATES_RECEIVE,
		siteId,
		templates,
	};
}

/**
 * Returns a function which, when invoked, triggers a network request to fetch
 * page templates for a site.
 *
 * @param  {number}   siteId Site ID
 * @returns {Function}        Action thunk
 */
export function requestPageTemplates( siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: PAGE_TEMPLATES_REQUEST,
			siteId,
		} );

		return wpcom
			.site( siteId )
			.pageTemplates()
			.then( ( { templates } ) => {
				dispatch( receivePageTemplates( siteId, templates ) );
				dispatch( {
					type: PAGE_TEMPLATES_REQUEST_SUCCESS,
					siteId,
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: PAGE_TEMPLATES_REQUEST_FAILURE,
					siteId,
					error,
				} );
			} );
	};
}
