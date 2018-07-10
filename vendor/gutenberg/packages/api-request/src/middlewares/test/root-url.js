/**
 * Internal dependencies
 */
import createRootUrlMiddleware from '../root-url';

describe( 'Root URL middleware', () => {
	it( 'should append the root URL', () => {
		expect.hasAssertions();

		const rootURL = 'http://wp.org/wp-admin/rest/';
		const rootURLMiddleware = createRootUrlMiddleware( rootURL );
		const requestOptions = {
			method: 'GET',
			path: '/wp/v2/posts',
		};
		const callback = ( options ) => {
			expect( options.url ).toBe( 'http://wp.org/wp-admin/rest/wp/v2/posts' );
		};

		rootURLMiddleware( requestOptions, callback );
	} );
} );
