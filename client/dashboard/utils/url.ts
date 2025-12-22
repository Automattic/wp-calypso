import { getProtocol } from '@wordpress/url';

export function isRelativeUrl( url: string ) {
	if ( ! url ) {
		return false;
	}

	return ! url.startsWith( '//' ) && ! getProtocol( url );
}

export function isOnboardingUrl( url: string ) {
	const path = new URL( url, window.location.origin ).pathname;
	return path.startsWith( '/setup' ) || path.startsWith( '/start' );
}

export function urlToSlug( url: string ) {
	return url.replace( /^https?:\/\//, '' ).replace( /\//g, '::' );
}

export function queryParamToArray( param: unknown ): string[] {
	return typeof param === 'string'
		? param.split( ',' ).map( ( domain: string ) => domain.trim() )
		: [];
}
