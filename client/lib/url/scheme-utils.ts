/**
 * Internal dependencies
 */
import { URL as TypedURL, Scheme } from 'types';

const schemeRegex = /^\w+:\/\//;

export function addSchemeIfMissing( url: TypedURL, scheme: Scheme ): TypedURL {
	if ( false === schemeRegex.test( url ) ) {
		return scheme + '://' + url;
	}
	return url;
}

export function setUrlScheme( url: TypedURL, scheme: Scheme ) {
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
