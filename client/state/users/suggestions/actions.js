/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	USER_SUGGESTIONS_RECEIVE,
	USER_SUGGESTIONS_REQUEST,
	USER_SUGGESTIONS_REQUEST_SUCCESS,
	USER_SUGGESTIONS_REQUEST_FAILURE
} from 'state/action-types';

/**
 * Returns an action object to be used in signalling that user suggestions for a site
 * have been received.
 *
 * @param  {Number} siteId  Site ID
 * @param  {Object} data    User suggestions
 * @return {Object}         Action object
 */
export function receiveUserSuggestions( siteId, data ) {
	return {
		type: USER_SUGGESTIONS_RECEIVE,
		suggestions: data.suggestions,
		siteId
	};
};

/**
 * Returns an action thunk which, when invoked, triggers a network request to
 * retrieve user suggestions for a site.
 *
 * @param  {Number}   siteId  Site ID
 * @return {Function}         Action thunk
 */
export function requestUserSuggestions( siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: USER_SUGGESTIONS_REQUEST,
			siteId
		} );

		return wpcom.undocumented().userSuggestions().get( { site_id: siteId },
			function( error, data ) {
				if ( ! error ) {
					dispatch( receiveUserSuggestions( siteId, data ) );
					dispatch( {
						type: USER_SUGGESTIONS_REQUEST_SUCCESS,
						siteId
					} );
				} else {
					dispatch( {
						type: USER_SUGGESTIONS_REQUEST_FAILURE,
						siteId,
						error
					} );
				}
			}
		);
	};
}
