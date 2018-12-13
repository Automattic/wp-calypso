/** @format */

/**
 * External dependencies
 */
import url from 'url';
import { stringify } from 'qs';
import { toPairs, identity, includes, get, mapKeys, partial, flowRight } from 'lodash';
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import debugFactory from 'debug';
import wpcom from 'lib/wp';

const debug = debugFactory( 'calypso:gutenberg' );

const debugMiddleware = ( options, next ) => {
	const { path, apiNamespace = 'wp/v2', apiVersion } = options;
	if ( apiVersion ) {
		debug( 'Sending API request to: ', `/rest/v${ apiVersion }${ path }` );
	} else {
		debug( 'Sending API request to: ', `/${ apiNamespace }${ path }` );
	}

	return next( options );
};

// Rewrite default API paths to match WP.com equivalents. Note that
// passed apiNamespace will be prepended to the replaced path.
export const wpcomPathMappingMiddleware = getSiteSlug => ( options, next ) => {
	const siteSlug = getSiteSlug();

	//support for fetchAllMiddleware, that uses url instead of path
	if ( ! options.path && options.url ) {
		return next( {
			...options,
			path: options.url.replace( 'https://public-api.wordpress.com/wp/v2', '' ),
			apiNamespace: 'wp/v2',
		} );
	}

	// wp/v2 namespace mapping
	//
	// Path rewrite example:
	// 		/wp/v2/types/post →
	//		/wp/v2/sites/example.wordpress.com/types/post
	if ( /\/wp\/v2\//.test( options.path ) ) {
		const path = options.path.replace( '/wp/v2/', `/sites/${ siteSlug }/` );

		return next( { ...options, path, apiNamespace: 'wp/v2' } );
	}

	// wpcom/v2 namespace mapping
	//
	// Path rewrite example:
	// 		/wpcom/v2/publicize/connection-test-results →
	//		/wpcom/v2/sites/example.wordpress.com/publicize/connection-test-results
	if ( /\/wpcom\/v2\//.test( options.path ) ) {
		const path = options.path.replace( '/wpcom/v2/', `/sites/${ siteSlug }/` );

		return next( { ...options, path, apiNamespace: 'wpcom/v2' } );
	}

	/*
	 * oembed/1.0 namespace mapping
	 *
	 * Path rewrite example:
	 * 		/oembed/1.0/proxy?url=<source URL> →
	 * 		/oembed/1.0/sites/example.wordpress.com/proxy?url=<source URL>&force=wpcom
	 */
	if ( /\/oembed\/1\.0\/proxy/.test( options.path ) ) {
		const handleOembedError = embedUrl => errorResponse => {
			debug( 'oembed failed with error: ', errorResponse );
			// we've tried to embed a URL that can't be embedded. Emulate core's fallback link here.
			return {
				html: `<a href="${ embedUrl }">${ embedUrl }</a>`,
				type: 'rich',
				provider_name: 'Embed',
			};
		};

		const urlObject = url.parse( options.path, { parseQueryString: true } );
		const embedUrl = urlObject.query.url;
		const query = {
			force: 'wpcom',
			url: embedUrl,
		};
		const oembedPath = `/sites/${ siteSlug }/proxy?${ stringify( query ) }`;

		return next( {
			...options,
			path: oembedPath,
			apiNamespace: 'oembed/1.0',
			onError: handleOembedError( embedUrl ),
		} );
	}

	return next( options );
};

const wpcomRequest = method => {
	/* wpcom.req.del is just a wrapper around wpcom.req.post
	 * and it always uses the `POST` method.
	 * https://github.com/Automattic/wpcom.js/blob/master/lib/util/request.js#L70
	 *
	 * Instead we use wpcom.req.get for `DELETE`, that passes the method
	 * along with the rest of the request parameters.
	 */
	if ( includes( [ 'GET', 'DELETE' ], method ) ) {
		return wpcom.req.get.bind( wpcom.req );
	}
	return wpcom.req.post.bind( wpcom.req );
};

/**
 * Creates an object that conforms with the Fetch API, where
 * the response body is accessed using a json() function and
 * headers are retrieved using case-insensitive search.
 *
 * @param {Object} body wpcom.req response body
 * @param {Object} headers wpcom.req response headers
 * @returns {Object} response object that conforms with the Fetch API
 */
const createFetchResponse = ( body, headers ) => {
	const normalizedHeaders = mapKeys( headers, ( value, key ) => key.toLowerCase() );

	const getHeader = flowRight(
		partial( get, normalizedHeaders ),
		header => header.toLowerCase()
	);

	return {
		json: () => body,
		headers: { get: getHeader },
	};
};

const wpcomProxyMiddleware = options => {
	// Make authenticated calls using the WordPress.com REST Proxy
	// bypassing the apiFetch call that uses window.fetch.
	// This intentionally breaks the middleware chain.
	const {
		path,
		body = {},
		data,
		method: rawMethod,
		apiVersion,
		apiNamespace = 'wp/v2',
		onError = identity,
		fromApi = identity,
		parse = true,
	} = options;

	const method = rawMethod ? rawMethod.toUpperCase() : 'GET';

	const payload = {};
	if ( body.constructor.name === 'FormData' && body.has( 'file' ) ) {
		// options.body is a FormData object which we need to convert to a plain old object
		// Due to error below using Chrome and Safari using the wpcom proxy
		// Error: Uncaught DOMException: Failed to execute 'postMessage' on 'Window': FormData object could not be cloned.
		payload.data = toPairs( Array.from( body.entries() ) );
		payload.formData = [ [ 'file', body.get( 'file' ) ] ];
	} else if ( data || body ) {
		payload.body = data || body;
	}

	return new Promise( ( resolve, reject ) => {
		wpcomRequest( method )(
			{
				path,
				method,
				...( !! apiVersion && { apiVersion } ),
				...( ! apiVersion && { apiNamespace } ),
				...payload,
			},
			//error, data, headers
			( error, dataResponse, headers ) => {
				if ( error || dataResponse.error ) {
					return reject( onError( error || dataResponse.error ) );
				}

				/**
				 * If parse === false, the originator of the apiFetch call expects the response
				 * to conform with the Fetch API
				 */
				if ( ! parse ) {
					return resolve( createFetchResponse( fromApi( dataResponse ), headers ) );
				}

				return resolve( fromApi( dataResponse ) );
			}
		);
	} );
};

// Utility function to apply all required API middleware in correct order.
export const applyAPIMiddleware = getSiteSlug => {
	// First middleware in, last out.

	// This call intentionally breaks the middleware chain.
	apiFetch.use( wpcomProxyMiddleware );

	apiFetch.use( debugMiddleware );

	apiFetch.use( wpcomPathMappingMiddleware( getSiteSlug ) );

	//depends on wpcomPathMappingMiddleware
	apiFetch.use( apiFetch.fetchAllMiddleware );

	apiFetch.use( apiFetch.createRootURLMiddleware( 'https://public-api.wordpress.com/' ) );
};
