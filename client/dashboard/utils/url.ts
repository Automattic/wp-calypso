import { getProtocol } from '@wordpress/url';
import { wpcomLink } from './link';

export function isRelativeUrl( url: string ) {
	if ( ! url ) {
		return false;
	}

	return ! url.startsWith( '//' ) && ! getProtocol( url );
}

export function isOnboardingUrl( url: string ) {
	return [ '/setup', '/start' ].some( ( path ) => url.startsWith( wpcomLink( path ) ) );
}

export function urlToSlug( url: string ) {
	return url.replace( /^https?:\/\//, '' ).replace( /\//g, '::' );
}

export function queryParamToArray( param: unknown ): string[] {
	return typeof param === 'string'
		? param.split( ',' ).map( ( domain: string ) => domain.trim() )
		: [];
}
