import { getSidebarState } from '../sidebar-state';

describe( 'getSidebarState', () => {
	it( 'returns root for the root path', () => {
		expect( getSidebarState( '/', false ) ).toEqual( { screen: 'root' } );
	} );

	it( 'returns root for "/sites/" with no site slug', () => {
		expect( getSidebarState( '/sites/', false ) ).toEqual( { screen: 'root' } );
	} );

	it( 'returns site screen with param for a site slug', () => {
		expect( getSidebarState( '/sites/example.wordpress.com', false ) ).toEqual( {
			screen: 'site',
			param: 'example.wordpress.com',
		} );
	} );

	it( 'returns site screen with param, stripping sub-paths', () => {
		expect( getSidebarState( '/sites/example.wordpress.com/settings/general', false ) ).toEqual( {
			screen: 'site',
			param: 'example.wordpress.com',
		} );
	} );

	it( 'returns root for "/domains/" with no domain', () => {
		expect( getSidebarState( '/domains/', false ) ).toEqual( { screen: 'root' } );
	} );

	it( 'returns domain screen with param for a domain slug', () => {
		expect( getSidebarState( '/domains/example.com', false ) ).toEqual( {
			screen: 'domain',
			param: 'example.com',
		} );
	} );

	it( 'returns domain screen with param, stripping sub-paths', () => {
		expect( getSidebarState( '/domains/example.com/manage', false ) ).toEqual( {
			screen: 'domain',
			param: 'example.com',
		} );
	} );

	it( 'returns me screen for "/me"', () => {
		expect( getSidebarState( '/me', false ) ).toEqual( { screen: 'me' } );
	} );

	it( 'returns me screen for "/me/" sub-paths', () => {
		expect( getSidebarState( '/me/billing', false ) ).toEqual( { screen: 'me' } );
	} );

	it( 'returns root for unknown paths', () => {
		expect( getSidebarState( '/unknown/path', false ) ).toEqual( { screen: 'root' } );
	} );

	describe( 'with error context', () => {
		it( 'returns root for a site path when hasError is true', () => {
			expect( getSidebarState( '/sites/example.wordpress.com', true ) ).toEqual( {
				screen: 'root',
			} );
		} );

		it( 'returns root for a domain path when hasError is true', () => {
			expect( getSidebarState( '/domains/example.com', true ) ).toEqual( { screen: 'root' } );
		} );

		it( 'returns root for "/me" when hasError is true', () => {
			expect( getSidebarState( '/me', true ) ).toEqual( { screen: 'root' } );
		} );

		it( 'returns root for root path when hasError is true', () => {
			expect( getSidebarState( '/', true ) ).toEqual( { screen: 'root' } );
		} );
	} );
} );
