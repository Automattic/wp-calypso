/** @format */

/**
 * External dependencies
 */
import request from 'superagent';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { GP_BASE_URL } from './constants';

const debug = debugFactory( 'calypso:i18n-utils:glotpress' );

/**
 * Sends the POST request
 * @param {String} glotPressUrl API url
 * @param {String} postFormData post data url param string
 * @returns {Object} request object
 */
export function postRequest( glotPressUrl, postFormData ) {
	return request
		.post( glotPressUrl )
		.withCredentials()
		.send( postFormData )
		.then( response => response.body )
		.catch( error => {
			throw error; // pass on the error so the call sites can handle it accordingly.
		} );
}

export function encodeOriginalKey( { original, context } ) {
	return context + '\u0004' + original;
}

/**
 * Sends originals to translate.wordpress.com to be recorded
 * @param {[String]} originalKeys Array of original keys to record
 * @param {String} recordId fallback recordId to pass to the backend
 * @param {Function} post see postRequest()
 * @returns {Object} request object
 */
export function recordOriginals( originalKeys, recordId, post = postRequest ) {
	const glotPressUrl = `${ GP_BASE_URL }/api/translations/-record-originals`;
	const recordIdQueryFragment = recordId ? `record_id=${ encodeURIComponent( recordId ) }&` : '';
	const postFormData =
		recordIdQueryFragment + `originals=${ encodeURIComponent( JSON.stringify( originalKeys ) ) }`;

	return post( glotPressUrl, postFormData ).catch( err => debug( 'recordOriginals failed:', err ) );
}
