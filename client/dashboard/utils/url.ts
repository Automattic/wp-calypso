import { getProtocol } from '@wordpress/url';

export function isRelativeUrl( url: string ) {
	if ( ! url ) {
		return false;
	}

	return ! url.startsWith( '//' ) && ! getProtocol( url );
}

export function urlToSlug( url: string ) {
	return url.replace( /^https?:\/\//, '' ).replace( /\//g, '::' );
}

export function queryParamToArray( param: unknown ): string[] {
	return typeof param === 'string'
		? param.split( ',' ).map( ( domain: string ) => domain.trim() )
		: [];
}
