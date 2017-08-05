/**
 * External dependencies
 */
import { omit, mapValues, isArray, isObject } from 'lodash';
import request from 'superagent';

/**
 * Internal dependencies
 */
import wp from 'lib/wp';

const omitDeep = ( input, props ) => {
	if ( isArray( input ) ) {
		return input.map( elem => omitDeep( elem, props ) );
	}

	if ( isObject( input ) ) {
		return mapValues( omit( input, props ), value => omitDeep( value, props ) );
	}

	return input;
};

const _directRequest = ( method, path, siteId, body, auth ) => {
	console.log( 'DIRECT REQUEST: ' + method + ' ' + path );
	console.log( 'auth: ', auth );

	const url = `${ auth.root }wc/v3/${ path }`;
	return request( method, url )
		.set( 'Accept', 'application/json' )
		.set( 'cookie', auth.cookie )
		.set( 'X-WP-Nonce', auth.nonce )
		.then( ( { data } ) => omitDeep( data, '_links' ) );
};

const _request = ( method, path, siteId, body ) => {
	// WPCOM API breaks if query parameters are passed after "?" instead of "&". Hide this hack from the calling code
	path = path.replace( '?', '&' );

	return wp.req[ 'get' === method ? 'get' : 'post' ](
		{
			path: `/jetpack-blogs/${ siteId }/rest-api/`
		},
		{
			path: `/wc/v3/${ path }&_method=${ method }`,
			body: body && JSON.stringify( body ),
			json: true,
		}
	).then( ( { data } ) => omitDeep( data, '_links' ) );
};

const _requestWithHeaders = ( method, path, siteId, sendBody ) => {
	return _request( method, path + '&_envelope', siteId, sendBody ).then( response => {
		const { headers, body, status } = response;

		if ( status !== 200 ) {
			throw {
				status: body.data.status,
				message: body.message,
				error: body.code,
			};
		}

		return { data: body, headers };
	} );
};

/**
 * Higher-level layer on top of the WPCOM.JS library, made specifically for making requests to a
 * Jetpack-connected WooComemrce site.
 * @param {Number} siteId Site ID to make the request to
 * @return {Object} An object with the properties "get", "post", "put" and "del", which are functions to
 * make an HTTP GET, POST, PUT and DELETE request, respectively.
 */
export default ( siteId, directAuth = false ) => ( {
	/**
	 * Sends a GET request to the API
	 * @param {String} path REST path to hit, omitting the "blog.url/wp-json/wc/v#/" prefix
	 * @return {Promise} Resolves with the JSON response, or rejects with an error
	 */
	get: ( path ) => ( directAuth ? _directRequest( 'get', path, siteId, null, directAuth ) : _request( 'get', path, siteId ) ),

	/**
	 * Sends a GET request to the API and returns headers along with the body.
	 * @param {String} path REST path to hit, omitting the "blog.url/wp-json/wc/v#/" prefix
	 * @return {Promise} Resolves with the JSON response, or rejects with an error
	 */
	getWithHeaders: ( path ) => _requestWithHeaders( 'get', path, siteId ),

	/**
	 * Sends a POST request to the API
	 * @param {String} path REST path to hit, omitting the "blog.url/wp-json/wc/v#/" prefix
	 * @param {Object} body Payload to send
	 * @return {Promise} Resolves with the JSON response, or rejects with an error
	 */
	post: ( path, body ) => _request( 'post', path, siteId, body || {} ),

	/**
	 * Sends a PUT request to the API.
	 * Note that the underlying request will be a POST, with an special URL parameter to
	 * be interpreted by the WPCOM server as a PUT request.
	 * @param {String} path REST path to hit, omitting the "blog.url/wp-json/wc/v#/" prefix
	 * @param {Object} body Payload to send
	 * @return {Promise} Resolves with the JSON response, or rejects with an error
	 */
	put: ( path, body ) => _request( 'put', path, siteId, body || {} ),

	/**
	 * Sends a DELETE request to the API.
	 * Note that the underlying request will be a POST, with an special URL parameter to
	 * be interpreted by the WPCOM server as a DELETE request.
	 * @param {String} path REST path to hit, omitting the "blog.url/wp-json/wc/v#/" prefix
	 * @return {Promise} Resolves with the JSON response, or rejects with an error
	 */
	del: ( path ) => _request( 'delete', path, siteId ),
} );
