/**
 * Internal dependencies
 */

import wpcom from 'lib/wp';
import {
	USER_SUGGESTIONS_RECEIVE,
	USER_SUGGESTIONS_REQUEST,
	USER_SUGGESTIONS_REQUEST_SUCCESS,
	USER_SUGGESTIONS_REQUEST_FAILURE,
} from 'state/action-types';

/**
 * Returns an action object to be used in signalling that user suggestions for a site
 * have been received.
 *
 * @param  {number} siteId  	Site ID
 * @param  {object} suggestions User suggestions
 * @returns {object}         	Action object
 */
export function receiveUserSuggestions( siteId, suggestions ) {
	return {
		type: USER_SUGGESTIONS_RECEIVE,
		suggestions,
		siteId,
	};
}

/**
 * Returns an action thunk which, when invoked, triggers a network request to
 * retrieve user suggestions for a site.
 *
 * @param  {number}   siteId  Site ID
 * @returns {Function}         Action thunk
 */
export function requestUserSuggestions( siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: USER_SUGGESTIONS_REQUEST,
			siteId,
		} );

		return wpcom
			.users()
			.suggest( { site_id: siteId } )
			.then( ( data ) => {
				dispatch( receiveUserSuggestions( siteId, data.suggestions ) );
				dispatch( {
					type: USER_SUGGESTIONS_REQUEST_SUCCESS,
					siteId,
					data,
				} );
			} )
			.catch( ( error ) =>
				dispatch( {
					type: USER_SUGGESTIONS_REQUEST_FAILURE,
					siteId,
					error,
				} )
			);
	};
}
