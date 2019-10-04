/**
 * Internal dependencies
 */
import { URL as URLType, Scheme } from 'types';

const schemeRegex = /^\w+:\/\//;

export function addSchemeIfMissing( url: URLType, scheme: Scheme ): URLType {
	if ( false === schemeRegex.test( url ) ) {
		return scheme + '://' + url;
	}
	return url;
}

export function setUrlScheme( url: URLType, scheme: Scheme ) {
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
