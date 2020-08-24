/**
 * External dependencies
 */

import { omit, mapValues, isArray, isObject } from 'lodash';

/**
 * Internal dependencies
 */
import wp from 'lib/wp';

const omitDeep = ( input, props ) => {
	if ( isArray( input ) ) {
		return input.map( ( elem ) => omitDeep( elem, props ) );
	}

	if ( isObject( input ) ) {
		return mapValues( omit( input, props ), ( value ) => omitDeep( value, props ) );
	}

	return input;
};

const _request = ( method, path, siteId, body, namespace = 'wc/v3' ) => {
	// WPCOM API breaks if query parameters are passed after "?" instead of "&". Hide this hack from the calling code
	path = path.replace( '?', '&' );

	return wp.req[ 'get' === method ? 'get' : 'post' ](
		{
			path: `/jetpack-blogs/${ siteId }/rest-api/`,
		},
		{
			path: `/${ namespace }/${ path }&_via_calypso&_method=${ method }`,
			body: body && JSON.stringify( body ),
			json: true,
		}
	).then( ( { data } ) => omitDeep( data, '_links' ) );
};

const _requestWithHeaders = ( method, path, siteId, sendBody, namespace = 'wc/v3' ) => {
	return _request( method, path + '&_envelope', siteId, sendBody, namespace ).then(
		( response ) => {
			const { headers, body, status } = response;

			if ( status !== 200 ) {
				throw {
					status: body.data.status,
					message: body.message,
					error: body.code,
				};
			}

			return { data: body, headers };
		}
	);
};

/**
 * Higher-level layer on top of the WPCOM.JS library, made specifically for making requests to a
 * Jetpack-connected WooComemrce site.
 *
 * @param {number} siteId Site ID to make the request to
 * @returns {object} An object with the properties "get", "post", "put" and "del", which are functions to
 * make an HTTP GET, POST, PUT and DELETE request, respectively.
 */
export default ( siteId ) => ( {
	/**
	 * Sends a GET request to the API
	 *
	 * @param {string} path REST path to hit, omitting the "blog.url/wp-json/wc/v#/" prefix
	 * @param {string} namespace URL namespace, defaults to 'wc/v3'
	 * @returns {Promise} Resolves with the JSON response, or rejects with an error
	 */
	get: ( path, namespace ) => _request( 'get', path, siteId, undefined, namespace ),

	/**
	 * Sends a GET request to the API and returns headers along with the body.
	 *
	 * @param {string} path REST path to hit, omitting the "blog.url/wp-json/wc/v#/" prefix
	 * @param {string} namespace URL namespace, defaults to 'wc/v3'
	 * @returns {Promise} Resolves with the JSON response, or rejects with an error
	 */
	getWithHeaders: ( path, namespace ) =>
		_requestWithHeaders( 'get', path, siteId, undefined, namespace ),

	/**
	 * Sends a POST request to the API
	 *
	 * @param {string} path REST path to hit, omitting the "blog.url/wp-json/wc/v#/" prefix
	 * @param {object} body Payload to send
	 * @param {string} namespace URL namespace, defaults to 'wc/v3'
	 * @returns {Promise} Resolves with the JSON response, or rejects with an error
	 */
	post: ( path, body, namespace ) => _request( 'post', path, siteId, body || {}, namespace ),

	/**
	 * Sends a PUT request to the API.
	 * Note that the underlying request will be a POST, with an special URL parameter to
	 * be interpreted by the WPCOM server as a PUT request.
	 *
	 * @param {string} path REST path to hit, omitting the "blog.url/wp-json/wc/v#/" prefix
	 * @param {object} body Payload to send
	 * @param {string} namespace URL namespace, defaults to 'wc/v3'
	 * @returns {Promise} Resolves with the JSON response, or rejects with an error
	 */
	put: ( path, body, namespace ) => _request( 'put', path, siteId, body || {}, namespace ),

	/**
	 * Sends a DELETE request to the API.
	 * Note that the underlying request will be a POST, with an special URL parameter to
	 * be interpreted by the WPCOM server as a DELETE request.
	 *
	 * @param {string} path REST path to hit, omitting the "blog.url/wp-json/wc/v#/" prefix
	 * @param {string} namespace URL namespace, defaults to 'wc/v3'
	 * @returns {Promise} Resolves with the JSON response, or rejects with an error
	 */
	del: ( path, namespace ) => _request( 'delete', path, siteId, undefined, namespace ),
} );
