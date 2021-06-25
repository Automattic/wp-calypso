/**
 * Internal dependencies
 */
import { URL as URLString, Scheme } from 'calypso/types';

const schemeRegex = /^\w+:\/\//;

export function addSchemeIfMissing( url: URLString, scheme: Scheme ): URLString {
	if ( false === schemeRegex.test( url ) ) {
		return scheme + '://' + url;
	}
	return url;
}

export function setUrlScheme( url: URLString, scheme: Scheme ) {
	const schemeWithSlashes = scheme + '://';
	if ( url && url.startsWith( schemeWithSlashes ) ) {
		return url;
	}

	const newUrl = addSchemeIfMissing( url, scheme );
	if ( newUrl !== url ) {
		return newUrl;
	}

	return url.replace( schemeRegex, schemeWithSlashes );
}
