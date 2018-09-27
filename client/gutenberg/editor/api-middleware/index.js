/** @format */

/**
 * External dependencies
 */
import url from 'url';
import { stringify } from 'qs';
import { toPairs, identity } from 'lodash';

/**
 * Internal dependencies
 */
import debugFactory from 'debug';
import wpcom from 'lib/wp';

const debug = debugFactory( 'calypso:gutenberg' );

export const debugMiddleware = ( options, next ) => {
	const { path, apiNamespace = 'wp/v2', apiVersion } = options;
	if ( apiVersion ) {
		debug( 'Sending API request to: ', `/rest/v${ apiVersion }${ path }` );
	} else {
		debug( 'Sending API request to: ', `/${ apiNamespace }${ path }` );
	}

	return next( options );
};

export const urlRewriteMiddleware = ( options, next, siteSlug ) => {
	// Rewrite default API paths to match WP.com equivalents.
	// Example: https://public-api.wordpress.com/wp/v2/posts -> https://public-api.wordpress.com/sites/{siteSlug}/posts
	const wpcomUrl = options.url.replace( '/wp/v2/', `/sites/${ siteSlug }/` );

	return next( { ...options, url: wpcomUrl } );
};

export const pathRewriteMiddleware = ( options, next, siteSlug ) => {
	// Rewrite default API paths to match WP.com equivalents.
	// Example: /wp/v2/posts -> /wp/v2/sites/{siteSlug}/posts
	const wpcomPath = options.path.replace( '/wp/v2/', `/sites/${ siteSlug }/` );

	return next( { ...options, path: wpcomPath } );
};

const wpcomRequest = method => {
	if ( method !== 'GET' ) {
		return wpcom.req.post.bind( wpcom.req );
	}
	return wpcom.req.get.bind( wpcom.req );
};

export const wpcomProxyMiddleware = parameters => {
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
		transformResponse = identity,
		transformError = identity,
	} = parameters;

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
			( error, dataResponse ) => {
				if ( error || dataResponse.error ) {
					return reject( transformError( error || dataResponse.error ) );
				}
				return resolve( transformResponse( dataResponse ) );
			}
		);
	} );
};

/**
 * Transforms a v1.1 wpcom response to a wp/v2 response
 * @param   {Object}  response the v1.1 oembed response
 * @returns {Object}  transformed response
 */
const transformOembedResponseFromWpcomToCore = response => {
	const { result, ...rest } = response;
	return {
		...rest,
		html: result,
	};
};

/**
 * Error handling for an oembed error
 * @param   {String}  embedUrl the fallback embed url
 * @returns {Object}  transformed response
 */
const handleOembedError = embedUrl => errorResponse => {
	debug( 'oembed failed with error: ', errorResponse );
	// we've tried to embed a URL that can't be embedded. Emulate core's fallback link here.
	return {
		html: `<a href="${ embedUrl }">${ embedUrl }</a>`,
		type: 'rich',
		provider_name: 'Embed',
	};
};

export const oembedMiddleware = ( options, next, siteSlug ) => {
	// Updates https://public-api.wordpress.com/wp/v2/oembed/1.0/proxy?url=<source URL> to
	// https://public-api.wordpress.com/rest/v1.1/sites/<site ID>/embeds/render?embed_url=<source URL>&force=wpcom
	if ( /oembed\/1.0\/proxy/.test( options.url ) ) {
		const urlObject = url.parse( options.url, { parseQueryString: true } );
		const embedUrl = urlObject.query.url;
		const query = {
			force: 'wpcom',
			embed_url: embedUrl,
		};
		const oembedPath = `/sites/${ siteSlug }/embeds/render?${ stringify( query ) }`;
		return next( {
			...options,
			path: oembedPath,
			apiVersion: '1.1',
			transformError: handleOembedError( embedUrl ),
			transformResponse: transformOembedResponseFromWpcomToCore,
		} );
	}
	return next( options );
};
