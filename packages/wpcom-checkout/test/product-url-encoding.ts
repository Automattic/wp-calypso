/**
 * Internal dependencies
 */
import { encodeProductForUrl, decodeProductFromUrl } from '../src/product-url-encoding';

describe( 'encodeProductForUrl', () => {
	it( 'removes slashes from the string', () => {
		expect( encodeProductForUrl( 'foo/bar/baz' ) ).not.toMatch( /\// );
	} );
} );

describe( 'decodeProductFromUrl', () => {
	it( 'restores slashes to a URL-decoded string encoded by encodeProductForUrl', () => {
		expect(
			decodeProductFromUrl( decodeURIComponent( encodeProductForUrl( 'foo/bar/baz' ) ) )
		).toBe( 'foo/bar/baz' );
	} );
} );
