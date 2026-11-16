import { normalizeAmplifyUrl } from '../url';

describe( 'normalizeAmplifyUrl', () => {
	test( 'adds HTTPS to a bare hostname', () => {
		expect( normalizeAmplifyUrl( ' example.com ' ) ).toBe( 'https://example.com/' );
	} );

	test( 'preserves a valid HTTP URL and its path', () => {
		expect( normalizeAmplifyUrl( 'http://example.com/shop' ) ).toBe( 'http://example.com/shop' );
	} );

	test.each( [ '', 'localhost', 'ftp://example.com', 'https://', 'not a URL' ] )(
		'rejects an invalid or unsupported URL: %s',
		( input ) => {
			expect( normalizeAmplifyUrl( input ) ).toBeNull();
		}
	);
} );
