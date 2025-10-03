import { getProtocol } from '@wordpress/url';

export function isRelativeUrl( url: string ) {
	return ! url.startsWith( '//' ) && ! getProtocol( url );
}
