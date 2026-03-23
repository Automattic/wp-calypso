import { getScreenPath } from '../navigator-route-sync';

describe( 'getScreenPath', () => {
	it( 'returns "/" for the root path', () => {
		expect( getScreenPath( '/' ) ).toBe( '/' );
	} );

	it( 'returns "/" for "/sites/" with no site slug', () => {
		expect( getScreenPath( '/sites/' ) ).toBe( '/' );
	} );

	it( 'returns the site screen for a site slug', () => {
		expect( getScreenPath( '/sites/example.wordpress.com' ) ).toBe(
			'/sites/example.wordpress.com'
		);
	} );

	it( 'returns the site screen and strips sub-paths', () => {
		expect( getScreenPath( '/sites/example.wordpress.com/settings/general' ) ).toBe(
			'/sites/example.wordpress.com'
		);
	} );

	it( 'returns "/" for "/domains/" with no domain', () => {
		expect( getScreenPath( '/domains/' ) ).toBe( '/' );
	} );

	it( 'returns the domain screen for a domain slug', () => {
		expect( getScreenPath( '/domains/example.com' ) ).toBe( '/domains/example.com' );
	} );

	it( 'returns the domain screen and strips sub-paths', () => {
		expect( getScreenPath( '/domains/example.com/manage' ) ).toBe( '/domains/example.com' );
	} );

	it( 'returns "/me" for "/me"', () => {
		expect( getScreenPath( '/me' ) ).toBe( '/me' );
	} );

	it( 'returns "/me" for "/me/" sub-paths', () => {
		expect( getScreenPath( '/me/billing' ) ).toBe( '/me' );
	} );

	it( 'returns "/" for unknown paths', () => {
		expect( getScreenPath( '/unknown/path' ) ).toBe( '/' );
	} );

	describe( 'with error context', () => {
		it( 'returns "/" for a site path when hasError is true', () => {
			expect( getScreenPath( '/sites/example.wordpress.com', true ) ).toBe( '/' );
		} );

		it( 'returns "/" for a site sub-path when hasError is true', () => {
			expect( getScreenPath( '/sites/example.wordpress.com/settings', true ) ).toBe( '/' );
		} );

		it( 'returns "/" for a domain path when hasError is true', () => {
			expect( getScreenPath( '/domains/example.com', true ) ).toBe( '/' );
		} );

		it( 'returns "/" for "/me" when hasError is true', () => {
			expect( getScreenPath( '/me', true ) ).toBe( '/' );
		} );

		it( 'returns "/" for root path when hasError is true', () => {
			expect( getScreenPath( '/', true ) ).toBe( '/' );
		} );
	} );
} );
