// Some product slugs or meta contain slashes which will break the URL, so we
// encode them first. We cannot use encodeURIComponent because the calypso
// router seems to break if the trailing part of the URL contains an encoded
// slash (eg: /checkout/example.com/foo%2Fbar breaks routing). We cannot use
// the same characters for encoding as for decoding if they are UTF-8 encoded
// because they will already be decoded by the time the decoding takes place.
//
// If all of that is confusing, see the tests for these functions to understand
// how they will be used.
//
// If this is ever changed, please make sure to also change the code that
// generates renewal emails on the backend, because it uses the same encoding!

const slashForEncoding = '%25';
const slashForDecoding = '%';

export function encodeProductForUrl( slug: string ): string {
	return slug.replace( /\//g, slashForEncoding );
}

export function decodeProductFromUrl( slug: string ): string {
	// This should really use String.prototype.replaceAll but it's yet not fully supported
	return slug.split( slashForDecoding ).join( '/' );
}
