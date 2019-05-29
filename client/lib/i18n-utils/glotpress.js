/** @format */

/**
 * External dependencies
 */
import request from 'superagent';

/**
 * Internal dependencies
 */
import { GP_BASE_URL } from './constants';

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

/**
 * Causes translate.wordpress.com to start recording queried translations
 * @param {String} original to record
 * @param {String} context to record
 * @param {Function} post see postRequest()
 * @returns {Object} request object
 */
export function recordOriginals( original, context = '',  post = postRequest ) {
	const glotPressUrl =  + `${ GP_BASE_URL }/api/translations/-record-originals`;
	const postFormData = [ `originals[]=${ context }\u0004${ original }` ];
	return post( glotPressUrl, postFormData )
		.catch( ( err ) => console.log( 'recordOriginals failed:', err ) );
}
