/**
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import omitUrlParams from '../omit-url-params';

describe( 'omitUrlParams()', () => {
	describe( 'when no URL is supplied', () => {
		test( 'should return null if the string is not a URL', () => {
			const actual = omitUrlParams();
			expect( actual ).toBeNull();
		} );
	} );

	describe( 'when a URL is supplied', () => {
		describe( 'when no omitting params are supplied', () => {
			test( 'should return the URL without modification', () => {
				const url = 'http://example.com/path?query=banana&query2=pineapple&query3=avocado';
				const actual = omitUrlParams( url );
				const expected = 'http://example.com/path?query=banana&query2=pineapple&query3=avocado';
				expect( actual ).toBe( expected );
			} );
		} );

		describe( 'when a single omitting param is supplied as a string', () => {
			test( 'should return the URL with that param removed', () => {
				const url = 'http://example.com/path?query=banana&query2=pineapple&query3=avocado';
				const param = 'query2';
				const actual = omitUrlParams( url, param );
				const expected = 'http://example.com/path?query=banana&query3=avocado';
				expect( actual ).toBe( expected );
			} );
		} );

		describe( 'when an array of omitting params is supplied', () => {
			test( 'should return the URL with each of those params removed', () => {
				const url = 'http://example.com/path?query=banana&query2=pineapple&query3=avocado';
				const params = [ 'query', 'query2' ];
				const actual = omitUrlParams( url, params );
				const expected = 'http://example.com/path?query3=avocado';
				expect( actual ).toBe( expected );
			} );
		} );
	} );
} );
