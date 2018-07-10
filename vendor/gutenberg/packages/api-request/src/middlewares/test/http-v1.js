/**
 * Internal dependencies
 */
import httpV1Middleware from '../http-v1';

describe( 'HTTP v1 Middleware', () => {
	it( 'should use a POST for a PUT requests', () => {
		expect.hasAssertions();

		const callback = ( options ) => {
			expect( options.method ).toBe( 'POST' );
			expect( options.headers[ 'X-HTTP-Method-Override' ] ).toBe( 'PUT' );
		};

		httpV1Middleware( { method: 'PUT', data: {} }, callback );
	} );

	it( 'shouldn\'t touch the options for GET requests', () => {
		expect.hasAssertions();

		const requestOptions = { method: 'GET', path: '/wp/v2/posts' };
		const callback = ( options ) => {
			expect( options ).toEqual( requestOptions );
		};

		httpV1Middleware( requestOptions, callback );
	} );
} );
