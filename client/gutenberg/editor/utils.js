/** @format */
/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import wpcomProxyRequest from 'wpcom-proxy-request';
import { noop, startsWith } from 'lodash';

export const overrideAPIPaths = siteSlug => {
	const rootURL = 'https://public-api.wordpress.com/';
	apiFetch.use( apiFetch.createRootURLMiddleware( rootURL ) );

	apiFetch.use( ( options, next ) => {
		if ( startsWith( options.path, '/wp/v2/sites/' ) ) {
			// rewrite default API paths to match WP.com equivalents
			// Example: /wp/v2/posts -> /wp/v2/sites/{siteSlug}/posts
			const wpcomPath = `/wp/v2/sites/${ siteSlug }/` + options.path.replace( '/wp/v2/', '' );
			return next( { ...options, path: wpcomPath } );
		} else if ( startsWith( options.path, '/me' ) ) {
			// rewrite the namespace of /me endpoints
			// example: /wp/v2/me/settings -> /rest/v1.1/me/settings
			return new Promise( ( resolve, reject ) => {
				wpcomProxyRequest(
					{
						...options,
						apiNamespace: 'rest/v1.1',
					},
					( error, body ) => {
						if ( error ) {
							return reject( error );
						}
						return resolve( body );
					}
				);
			} );
		}
		return noop;
	} );
};
