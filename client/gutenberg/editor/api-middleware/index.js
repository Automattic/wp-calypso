/** @format */

/**
 * External dependencies
 */
import url from 'url';
import { stringify } from 'qs';
import { toPairs, identity, includes, get } from 'lodash';
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
export const wpcomPathMappingMiddleware = ( options, next, siteSlug ) => {
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

		//TODO: temporary fix, we need to add fetchAllMiddleware from Gutenberg core, a -1 value is rewritten to fetch _all_ values
		// https://github.com/WordPress/gutenberg/blob/master/packages/api-fetch/src/middlewares/fetch-all-middleware.js
		// if ( /per_page=-1/.test( path ) ) {
		// 	path = path.replace( 'per_page=-1', 'per_page=100' );
		// }

		return next( { ...options, path, apiNamespace: 'wp/v2' } );
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
				if ( ! parse ) {
					const { Link: link, ...moreHeaders } = headers;
					return resolve( {
						json: () => fromApi( dataResponse ),
						headers: { get: header => get( { link, ...moreHeaders }, header ) },
					} );
				}
				return resolve( fromApi( dataResponse ) );
			}
		);
	} );
};

// Utility function to apply all required API middleware in correct order.
export const applyAPIMiddleware = siteSlug => {
	// First middleware in, last out.

	// This call intentionally breaks the middleware chain.
	apiFetch.use( wpcomProxyMiddleware );

	apiFetch.use( ( options, next ) => debugMiddleware( options, next ) );

	apiFetch.use( ( options, next ) => wpcomPathMappingMiddleware( options, next, siteSlug ) );

	apiFetch.use( apiFetch.fetchAllMiddleware );

	apiFetch.use( apiFetch.createRootURLMiddleware( 'https://public-api.wordpress.com/' ) );
};
