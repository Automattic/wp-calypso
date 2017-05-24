/**
 * Internal dependencies
 */
import wp from 'lib/wp';

const _request = ( func, path, siteId, body = {} ) => {
	return func( { path: `/jetpack-blogs/${ siteId }/rest-api/` }, { path: '/wc/v2/' + path, ...body } )
			.then( ( { data } ) => data );
};

const addURLParam = ( url, param ) => url + ( -1 !== url.indexOf( '?' ) ? '?' : '&' ) + param;

/**
 * Higher-level layer on top of the WPCOM.JS library, made specifically for making requests to a
 * Jetpack-connected WooComemrce site.
 * @param {Number} siteId Site ID to make the request to
 * @return {Object} An object with the properties "get", "post", "put" and "del", which are functions to
 * make an HTTP GET, POST, PUT and DELETE request, respectively.
 */
export default ( siteId ) => ( {
	/**
	 * Sends a GET request to the API
	 * @param {String} path REST path to hit, omitting the "blog.url/wp-json/wc/v2/" prefix
	 * @return {Promise} Resolves with the JSON response, or rejects with an error
	 */
	get: ( path ) => _request( wp.req.get, path, siteId ),

	/**
	 * Sends a POST request to the API
	 * @param {String} path REST path to hit, omitting the "blog.url/wp-json/wc/v2/" prefix
	 * @param {Object} body Payload to send
	 * @return {Promise} Resolves with the JSON response, or rejects with an error
	 */
	post: ( path, body ) => _request( wp.req.post, path, siteId, body ),

	/**
	 * Sends a PUT request to the API.
	 * Note that the underlying request will be a POST, with an special URL parameter to
	 * be interpreted by the WPCOM server as a PUT request.
	 * @param {String} path REST path to hit, omitting the "blog.url/wp-json/wc/v2/" prefix
	 * @param {Object} body Payload to send
	 * @return {Promise} Resolves with the JSON response, or rejects with an error
	 */
	put: ( path, body ) => _request( wp.req.post, addURLParam( path, '_method=put' ), siteId, body ),

	/**
	 * Sends a DELETE request to the API.
	 * Note that the underlying request will be a POST, with an special URL parameter to
	 * be interpreted by the WPCOM server as a DELETE request.
	 * @param {String} path REST path to hit, omitting the "blog.url/wp-json/wc/v2/" prefix
	 * @return {Promise} Resolves with the JSON response, or rejects with an error
	 */
	del: ( path ) => _request( wp.req.post, addURLParam( path, '_method=delete' ), siteId ),
} );
