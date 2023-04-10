import { addQueryArgs } from '@wordpress/url';
import wpcom from 'calypso/lib/wp';

export function wpcomFetchNormalizePath( options ) {
	const wpApiRoot = '/wp/v2';
	if ( options.url && options.url.indexOf( wpApiRoot ) !== -1 ) {
		options.path = options.url.replace( wpApiRoot, '' );
		delete options.url;
	}

	if ( options.path ) {
		// Ensures path starts with a slash.
		if ( ! options.path.startsWith( '/' ) ) {
			options.path = '/' + options.path;
		}

		// Removes namespace from path.
		if ( options.apiNamespace ) {
			options.path = options.path.replace( '/' + options.apiNamespace, '' );
		}
	}

	return options;
}

export function wpcomFetchAddSitePrefix( siteId ) {
	return ( options, next ) => {
		if (
			options.hasOwnProperty( 'path' ) &&
			'undefined' !== typeof options.path &&
			! options.global
		) {
			if ( '' === options.path ) {
				options.path = '/?';
			}
			if ( options.path.startsWith( '/?' ) ) {
				// The root endpoint is a special case for wpcom, remap to
				// https://public-api.wordpress.com/wp-json/?rest_route=/sites/{site_id}/
				options.path = addQueryArgs( options.path, { rest_route: '/sites/' + siteId + '/' } );
				options.apiNamespace = 'wp-json';
			} else if ( options.path.indexOf( '/sites/' ) === -1 ) {
				options.path = '/sites/' + siteId + options.path;
			}
		}
		return next( options, next );
	};
}

export function wpcomFetchGutenbergNonce( options, next ) {
	options.path = addQueryArgs( options.path, {
		_gutenberg_nonce: 'placeholder',
	} );
	return next( options, next );
}

export function wpcomFetchHandler() {
	return wpcom.request;

	// return new Promise( ( resolve, reject ) => {
	// 	wpcom
	// 		.request( options )
	// 		.done( ( data ) => resolve( data ) )
	// 		.fail( ( error ) => reject( error ) );
	// } );
}
