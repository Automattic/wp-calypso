/**
 * External dependencies
 */
import { startsWith } from 'lodash';

const schemeRegex = /^\w+:\/\//;

export const addSchemeIfMissing = ( url, scheme ) => {
	if ( false === schemeRegex.test( url ) ) {
		return scheme + '://' + url;
	}
	return url;
};

export const setUrlScheme = ( url, scheme ) => {
	const schemeWithSlashes = scheme + '://';
	if ( startsWith( url, schemeWithSlashes ) ) {
		return url;
	}

	const newUrl = addSchemeIfMissing( url, scheme );
	if ( newUrl !== url ) {
		return newUrl;
	}

	return url.replace( schemeRegex, schemeWithSlashes );
};
