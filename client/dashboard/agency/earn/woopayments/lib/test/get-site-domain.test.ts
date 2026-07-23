/**
 * @jest-environment node
 */
import { getSiteDomain } from '../get-site-domain';

describe( 'getSiteDomain', () => {
	it( 'returns the hostname of a site URL', () => {
		expect( getSiteDomain( 'https://example.com' ) ).toBe( 'example.com' );
	} );

	it( 'drops the path and keeps the host for subdirectory installs', () => {
		expect( getSiteDomain( 'https://example.com/shop' ) ).toBe( 'example.com' );
	} );

	it( 'falls back to the raw value when the URL cannot be parsed', () => {
		expect( getSiteDomain( 'not a url' ) ).toBe( 'not a url' );
	} );
} );
