/** @format */

/**
 * External dependencies
 */
import request from 'superagent';

/**
 * Internal dependencies
 */

/**
 * Sends the POST request
 * @param {String} glotPressUrl API url
 * @param {String} postFormData post data url param string
 * @returns {Object} request object
 */
export function postRequest( glotPressUrl, postFormData ) {
	return (
		request
			.post( glotPressUrl )
			.withCredentials()
			.send( postFormData )
			// .then( response => normalizeDetailsFromTranslationData( head( response.body ) ) )
			.then( response => response.body )
			.catch( error => {
				throw error; // pass on the error so the call sites can handle it accordingly.
			} )
	);
}
