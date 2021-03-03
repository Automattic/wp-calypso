/**
 * A stub that makes safe-image-url deterministic
 *
 */
/**
 * Internal dependencies
 */
import { getUrlParts, getUrlFromParts } from 'calypso/lib/url/url-parts';

let returnValue;

function makeSafe( url ) {
	const parts = getUrlParts( url );
	if ( parts.searchParams.get( 'ad' ) ) {
		return null;
	}
	if ( ! parts.protocol ) {
		parts.protocol = 'fake';
	}
	parts.pathname += '-SAFE';
	let newUrl = getUrlFromParts( parts ).toString();
	if ( 'fake' === parts.protocol ) {
		newUrl = newUrl.substring( 5 );
	}
	return returnValue !== undefined ? returnValue : newUrl;
}

makeSafe.setReturns = function ( val ) {
	returnValue = val;
};

makeSafe.undoReturns = function () {
	returnValue = undefined;
};

export default makeSafe;
