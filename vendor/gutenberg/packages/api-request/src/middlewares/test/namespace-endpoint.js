/**
 * Internal dependencies
 */
import namespaceEndpointMiddleware from '../namespace-endpoint';

describe( 'Namespace & Endpoint middleware', () => {
	it( 'should concat the endpoint and namespace into a path property', () => {
		expect.hasAssertions();

		const requestOptions = {
			method: 'GET',
			namespace: '/wp/v2',
			endpoint: '/posts',
		};
		const callback = ( options ) => {
			expect( options.path ).toBe( 'wp/v2/posts' );
			expect( options.namespace ).toBeUndefined();
			expect( options.endpoint ).toBeUndefined();
		};

		namespaceEndpointMiddleware( requestOptions, callback );
	} );
} );
