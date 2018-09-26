/** @format */

/**
 * External dependencies
 */
import wpcomProxyRequest from 'wpcom-proxy-request';
import url from 'url';
import { stringify } from 'qs';

/**
 * Internal dependencies
 */
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:gutenberg' );

export const debugMiddleware = ( options, next ) => {
	debug( 'Sending API request to: ', options.url );

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

export const oembedMiddleware = ( options, next, siteSlug ) => {
	// Updates https://public-api.wordpress.com/wp/v2/oembed/1.0/proxy?url=<source URL> to
	// https://public-api.wordpress.com/rest/v1.1/sites/<site ID>/embeds/render?embed_url=<source URL>&force=wpcom
	// This intentionally breaks the middleware chain if we match an embed.
	if ( /oembed\/1.0\/proxy/.test( options.url ) ) {
		const urlObject = url.parse( options.url, { parseQueryString: true } );
		// Make authenticated calls using the WordPress.com REST Proxy
		// bypassing the apiFetch call that uses window.fetch.
		// This intentionally breaks the middleware chain.
		return new Promise( ( resolve, reject ) => {
			const query = {
				force: 'wpcom',
				embed_url: urlObject.query.url,
			};
			wpcomProxyRequest(
				{
					path: `/sites/${ siteSlug }/embeds/render?${ stringify( query ) }`,
					apiVersion: '1.1',
				},
				( error, bodyOrData ) => {
					if ( error ) {
						return reject( error );
					}

					return resolve( bodyOrData );
				}
			);
		} );
	}
	return next( options );
};

export const wpcomProxyMiddleware = parameters => {
	// Make authenticated calls using the WordPress.com REST Proxy
	// bypassing the apiFetch call that uses window.fetch.
	// This intentionally breaks the middleware chain.
	return new Promise( ( resolve, reject ) => {
		const { body, data, ...options } = parameters;

		wpcomProxyRequest(
			{
				...options,
				...( ( body || data ) && { body: body || data } ),
				apiNamespace: 'wp/v2',
			},
			( error, bodyOrData ) => {
				if ( error ) {
					return reject( error );
				}

				return resolve( bodyOrData );
			}
		);
	} );
};
