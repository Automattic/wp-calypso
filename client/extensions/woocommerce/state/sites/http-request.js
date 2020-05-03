/**
 * Internal dependencies
 */

import { http } from 'state/data-layer/wpcom-http/actions';

/**
 * Returns a proper WPCOM_HTTP_REQUEST action (http data layer) for dispatching requests
 * in data-layer handlers.
 * The resulting data will be in the form of `{ data: { API data } }`
 *
 * @param {string} method HTTP Request Method
 * @param {string} path The WC API path to make a request to (after /wc/v#)
 * @param {number} siteId Site ID to make the request to
 * @param {object} body HTTP Body for POST and PUT Requests
 * @param {object} action The original requesting action
 * @param {string} namespace Namespace to be pre-pended to path (e.g. /wc/v3)
 * @returns {object} WPCOM_HTTP_REQUEST Action
 */
const _request = ( method, path, siteId, body, action, namespace ) => {
	// WPCOM API breaks if query parameters are passed after "?" instead of "&". Hide this hack from the calling code
	path = path.replace( '?', '&' );
	path = `${ namespace }/${ path }&_method=${ method }`;

	let requestMethod;
	let requestQuery;
	let requestBody;

	// DELETE, PUT, and POST all get passed to the Jetpack API as a POST request
	switch ( method ) {
		case 'GET':
			requestMethod = 'GET';
			requestQuery = {
				path,
				json: true,
			};
			requestBody = null;
			break;
		case 'DELETE':
			requestMethod = 'POST';
			requestQuery = {
				json: true,
			};
			requestBody = {
				path,
			};
			break;
		default:
			requestMethod = 'POST';
			requestQuery = {
				json: true,
			};
			requestBody = {
				path,
				body: body && JSON.stringify( body ),
				json: true,
			};
	}

	return http(
		{
			apiVersion: '1.1',
			method: requestMethod,
			path: `/jetpack-blogs/${ siteId }/rest-api/`,
			query: requestQuery,
			body: requestBody,
		},
		action
	);
};

/**
 * Prepares a request action that will return the body and headers.
 * The resulting data will be in the form of `{ data: { status: <code>, body: { API data }, headers: { API response headers } } }`
 *
 * @param {string} method HTTP Request Method
 * @param {string} path The WC API path to make a request to (after /wc/v#)
 * @param {number} siteId Site ID to make the request to
 * @param {object} body HTTP Body for POST and PUT Requests
 * @param {object} action The original requesting action
 * @param {string} namespace Namespace to be pre-pended to path (e.g. /wc/v3)
 * @returns {object} WPCOM_HTTP_REQUEST Action
 */
const _requestWithHeaders = ( method, path, siteId, body, action, namespace ) => {
	return _request( method, path + '&_envelope', siteId, body, action, namespace );
};

/**
 * Provides a wrapper over the http data-layer, made specifically for making requests to
 * WooCommerce endpoints without repeating things like /wc/v3.
 *
 * @param {number} siteId Site ID to make the request to
 * @param {object} action The original requesting action
 * @param {string} namespace Namespace to be pre-pended to path. Defaults to /wc/v3
 * @returns {object} An object with the properties "get", "post", "put" and "del", which are functions to
 * make an HTTP GET, POST, PUT and DELETE request, respectively.
 */
export default ( siteId, action, namespace = '/wc/v3' ) => ( {
	/**
	 * Sends a GET request to the API
	 *
	 * @param {string} path REST path to hit, omitting the "blog.url/wp-json/wc/v#/" prefix
	 * @returns {object} WPCOM_HTTP_REQUEST Action with `data = { API data }`
	 */
	get: ( path ) => _request( 'GET', path, siteId, null, action, namespace ),

	/**
	 * Sends a GET request to the API that will return with headers
	 *
	 * @param {string} path REST path to hit, omitting the "blog.url/wp-json-/wc/v#/" prefix
	 * @returns {object} WPCOM_HTTP_REQUEST Action with `data = { status: <code>, body: { API data }, headers: { API response headers } }`
	 */
	getWithHeaders: ( path ) => _requestWithHeaders( 'GET', path, siteId, null, action, namespace ),

	/**
	 * Sends a POST request to the API
	 *
	 * @param {string} path REST path to hit, omitting the "blog.url/wp-json/wc/v#/" prefix
	 * @param {object} body Payload to send
	 * @returns {object} WPCOM_HTTP_REQUEST Action
	 */
	post: ( path, body ) => _request( 'POST', path, siteId, body || {}, action, namespace ),

	/**
	 * Sends a PUT request to the API.
	 * Note that the underlying request will be a POST, with an special URL parameter to
	 * be interpreted by the WPCOM server as a PUT request.
	 *
	 * @param {string} path REST path to hit, omitting the "blog.url/wp-json/wc/v#/" prefix
	 * @param {object} body Payload to send
	 * @returns {object} WPCOM_HTTP_REQUEST Action
	 */
	put: ( path, body ) => _request( 'PUT', path, siteId, body || {}, action, namespace ),

	/**
	 * Sends a DELETE request to the API.
	 * Note that the underlying request will be a POST, with an special URL parameter to
	 * be interpreted by the WPCOM server as a DELETE request.
	 *
	 * @param {string} path REST path to hit, omitting the "blog.url/wp-json/wc/v#/" prefix
	 * @returns {object} WPCOM_HTTP_REQUEST Action
	 */
	del: ( path ) => _request( 'DELETE', path, siteId, null, action, namespace ),
} );
