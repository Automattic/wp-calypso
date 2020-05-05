/**
 * Internal dependencies
 */
import { getUrlParts, isExternal } from 'lib/url';
import { URL as URLString } from 'types';

export default function isOutsideCalypso( url: URLString ): boolean {
	if ( isExternal( url ) ) {
		return true;
	}

	const { pathname } = getUrlParts( url );

	// Some paths live outside of Calypso even though they are hosted on the same domain
	// Examples: /support, /forums
	if (
		/^\/support($|\/)/i.test( pathname ) || // /support or /support/*
		/^\/([a-z]{2}|[a-z]{2}-[a-z]{2})\/support($|\/)/i.test( pathname ) || // /en/support or /pt-br/support/*, etc
		/^\/forums($|\/)/i.test( pathname ) || // /forums or /forums/*
		/^\/([a-z]{2}|[a-z]{2}-[a-z]{2})\/forums($|\/)/i.test( pathname ) // /en/forums or /pt-br/forums/*, etc
	) {
		return true;
	}

	return false;
}
