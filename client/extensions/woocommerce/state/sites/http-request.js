/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';

/**
 * Returns a proper WPCOM_HTTP_REQUEST action (http data layer) for dispatching requests
 * in data-layer handlers.
 * @param {String} method HTTP Request Method
 * @param {String} path The WC API path to make a request to (after /wc/v#)
 * @param {Number} siteId Site ID to make the request to
 * @param {Object} body HTTP Body for POST and PUT Requests
 * @param {Object} action The original requesting action
 * @return {Object} WPCOM_HTTP_REQUEST Action
 */
const _request = ( method, path, siteId, body, action ) => {
	// WPCOM API breaks if query parameters are passed after "?" instead of "&". Hide this hack from the calling code
	path = path.replace( '?', '&' );
	path = `/wc/v3/${ path }&_method=${ method }`;
	return http( {
		apiVersion: '1.1',
		method: 'GET' === method ? 'GET' : 'POST',
		path: `/jetpack-blogs/${ siteId }/rest-api/`,
		query: {
			path,
			json: true,
		},
		body: body && JSON.stringify( body ),
	}, action );
};

/**
 * Provides a wrapper over the http data-layer, made specifically for making requests to
 * WooCommerce endpoints without repeating things like /wc/v3.
 * @param {Number} siteId Site ID to make the request to
 * @param {Object} action The original requesting action
 * @return {Object} An object with the properties "get", "post", "put" and "del", which are functions to
 * make an HTTP GET, POST, PUT and DELETE request, respectively.
 */
export default ( siteId, action ) => ( {

	/**
	 * Sends a GET request to the API
	 * @param {String} path REST path to hit, omitting the "blog.url/wp-json/wc/v#/" prefix
	 * @return {Object} WPCOM_HTTP_REQUEST Action
	 */
	get: ( path ) => _request( 'GET', path, siteId, null, action ),

	/**
	 * Sends a POST request to the API
	 * @param {String} path REST path to hit, omitting the "blog.url/wp-json/wc/v#/" prefix
	 * @param {Object} body Payload to send
	 * @return {Object} WPCOM_HTTP_REQUEST Action
	 */
	post: ( path, body ) => _request( 'POST', path, siteId, body || {}, action ),

	/**
	 * Sends a PUT request to the API.
	 * Note that the underlying request will be a POST, with an special URL parameter to
	 * be interpreted by the WPCOM server as a PUT request.
	 * @param {String} path REST path to hit, omitting the "blog.url/wp-json/wc/v#/" prefix
	 * @param {Object} body Payload to send
	 * @return {Object} WPCOM_HTTP_REQUEST Action
	 */
	put: ( path, body ) => _request( 'PUT', path, siteId, body || {}, action ),

	/**
	 * Sends a DELETE request to the API.
	 * Note that the underlying request will be a POST, with an special URL parameter to
	 * be interpreted by the WPCOM server as a DELETE request.
	 * @param {String} path REST path to hit, omitting the "blog.url/wp-json/wc/v#/" prefix
	 * @return {Object} WPCOM_HTTP_REQUEST Action
	 */
	del: ( path ) => _request( 'DELETE', path, siteId, null, action ),
} );
