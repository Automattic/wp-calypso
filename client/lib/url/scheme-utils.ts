import { URL as URLString, Scheme } from 'calypso/types';

const schemeRegex = /^\w+:\/\//;

export function addSchemeIfMissing( url: URLString, scheme: Scheme ): URLString {
	if ( false === schemeRegex.test( url ) ) {
		return scheme + '://' + url;
	}
	return url;
}
