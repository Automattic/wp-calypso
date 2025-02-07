import { persistQueryParams } from '../persist-query-params';

describe( 'persistQueryParams', () => {
	it( 'should append query parameters to a URL part without existing query parameters', () => {
		const url = '/test-url';
		const urlQueryParams = new URLSearchParams( { param1: 'value1', param2: 'value2' } );

		const result = persistQueryParams( url, urlQueryParams );

		expect( result ).toBe( `${ url }?param1=value1&param2=value2` );
	} );

	it( 'should append query parameters to a URL with existing query parameters', () => {
		const url = '/test-url/path?existingParam=existingValue';
		const urlQueryParams = new URLSearchParams( { param1: 'value1', param2: 'value2' } );

		const result = persistQueryParams( url, urlQueryParams );

		expect( result ).toBe( `${ url }&param1=value1&param2=value2` );
	} );

	it( 'should handle empty URL query parameters', () => {
		const url = '/test/path';
		const urlQueryParams = new URLSearchParams();

		const result = persistQueryParams( url, urlQueryParams );

		expect( result ).toBe( url );
	} );

	it( 'should properly format the query parameters if there are special characters', () => {
		const url = '/test/path';
		const urlQueryParams = new URLSearchParams( { param1: 'value&with=special?chars' } );

		const result = persistQueryParams( url, urlQueryParams );

		expect( result ).toBe( `${ url }?param1=value%26with%3Dspecial%3Fchars` );
	} );
} );
