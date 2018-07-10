/**
 * Internal dependencies
 */
import { filterURLForDisplay } from '../url';

describe( 'filterURLForDisplay', () => {
	it( 'should remove protocol', () => {
		let url = filterURLForDisplay( 'http://wordpress.org' );
		expect( url ).toBe( 'wordpress.org' );
		url = filterURLForDisplay( 'https://wordpress.org' );
		expect( url ).toBe( 'wordpress.org' );
	} );
	it( 'should remove www subdomain', () => {
		const url = filterURLForDisplay( 'http://www.wordpress.org' );
		expect( url ).toBe( 'wordpress.org' );
	} );
	it( 'should remove single trailing slash', () => {
		const url = filterURLForDisplay( 'http://www.wordpress.org/' );
		expect( url ).toBe( 'wordpress.org' );
	} );
	it( 'should preserve slashes where the url has multiple in the path', () => {
		const url = filterURLForDisplay( 'http://www.wordpress.org/something/' );
		expect( url ).toBe( 'wordpress.org/something/' );
	} );
	it( 'should preserve slash where the url has path after the initial slash', () => {
		const url = filterURLForDisplay( 'http://www.wordpress.org/something' );
		expect( url ).toBe( 'wordpress.org/something' );
	} );
} );
