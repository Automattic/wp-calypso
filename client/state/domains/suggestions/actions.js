/**
 * Internal dependencies
 */

import wpcom from 'lib/wp';
import {
	DOMAINS_SUGGESTIONS_RECEIVE,
	DOMAINS_SUGGESTIONS_REQUEST,
	DOMAINS_SUGGESTIONS_REQUEST_FAILURE,
	DOMAINS_SUGGESTIONS_REQUEST_SUCCESS,
} from 'state/action-types';

/**
 * Returns an action object to be used in signalling that a domains suggestion object
 * has been received.
 *
 * @param   {Array}    suggestions              domain suggestions
 * @param   {object}   queryObject              domain suggestions queryObject
 * @returns {object}   Action object
 */
export function receiveDomainsSuggestions( suggestions, queryObject ) {
	return {
		type: DOMAINS_SUGGESTIONS_RECEIVE,
		queryObject,
		suggestions,
	};
}

/**
 * Triggers a network request to find domain suggestions
 *
 * @param   {object}   queryObject                          domain suggestions queryObject
 * @param   {string}   queryObject.query                    domainQuery
 * @param   {number}   queryObject.quantity                 max results
 * @param   {string}   queryObject.vendor                   vendor
 * @param   {?boolean} queryObject.include_wordpressdotcom  adds wordpress subdomain suggestions when true
 * @returns {Function}                                      Action thunk
 */
export function requestDomainsSuggestions( queryObject ) {
	return ( dispatch ) => {
		dispatch( {
			type: DOMAINS_SUGGESTIONS_REQUEST,
			queryObject,
		} );
		return wpcom
			.domains()
			.suggestions( queryObject )
			.then( ( suggestions ) => {
				dispatch( receiveDomainsSuggestions( suggestions, queryObject ) );
				dispatch( {
					type: DOMAINS_SUGGESTIONS_REQUEST_SUCCESS,
					queryObject,
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: DOMAINS_SUGGESTIONS_REQUEST_FAILURE,
					queryObject,
					error,
				} );
			} );
	};
}
