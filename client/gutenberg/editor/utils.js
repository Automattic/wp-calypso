/** @format */
/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import wpcomProxyRequest from 'wpcom-proxy-request';

export const overrideAPIPaths = () => {
	// TODO: fix for /gutenberg in Calypso
	apiFetch.use( options => {
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
	} );

	const rootURL = 'https://public-api.wordpress.com/';
	apiFetch.use( apiFetch.createRootURLMiddleware( rootURL ) );
};
