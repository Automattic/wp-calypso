import isStaticRequest from '..';

describe( 'isStaticRequest', () => {
	it( "returns false if original URL doesn't exist", () => {
		expect( isStaticRequest( {} ) ).toBe( false );
		expect( isStaticRequest( null ) ).toBe( false );
	} );

	it( 'returns true if original URL is static', () => {
		expect( isStaticRequest( { originalUrl: '/calypso/hello' } ) ).toBe( true );
		expect( isStaticRequest( { originalUrl: '/__webpack_hmr' } ) ).toBe( true );
	} );

	it( 'returns false if original URL is not static', () => {
		expect( isStaticRequest( { originalUrl: '/home' } ) ).toBe( false );
		expect( isStaticRequest( { originalUrl: '/post/xyz.wordpress.com' } ) ).toBe( false );
	} );
} );
