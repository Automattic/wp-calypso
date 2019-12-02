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

	describe( 'when an invalid URL is supplied', () => {
		test( 'should return null if the string is an invalid URL', () => {
			const actual = omitUrlParams( '///' );
			expect( actual ).toBeNull();
		} );
	} );

	describe( 'when an absolute URL is supplied', () => {
		describe( 'when no omitting params are supplied', () => {
			test( 'should return the URL without modification', () => {
				const url =
					'http://example.com/path?query=%E3%83%90%E3%83%8A%E3%83%8A&query2=pineapple&query3=avocado';
				const actual = omitUrlParams( url );
				const expected =
					'http://example.com/path?query=%E3%83%90%E3%83%8A%E3%83%8A&query2=pineapple&query3=avocado';
				expect( actual ).toBe( expected );
			} );
		} );

		describe( 'when a single omitting param is supplied as a string', () => {
			test( 'should return the URL with that param removed', () => {
				const url =
					'http://example.com/path?query=%E3%83%90%E3%83%8A%E3%83%8A&query2=pineapple&query3=avocado';
				const param = 'query2';
				const actual = omitUrlParams( url, param );
				const expected = 'http://example.com/path?query=%E3%83%90%E3%83%8A%E3%83%8A&query3=avocado';
				expect( actual ).toBe( expected );
			} );
		} );

		describe( 'when an array of omitting params is supplied', () => {
			test( 'should return the URL with each of those params removed', () => {
				const url =
					'http://example.com/path?query=%E3%83%90%E3%83%8A%E3%83%8A&query2=pineapple&query3=avocado';
				const params = [ 'query', 'query2' ];
				const actual = omitUrlParams( url, params );
				const expected = 'http://example.com/path?query3=avocado';
				expect( actual ).toBe( expected );
			} );
		} );
	} );

	describe( 'when a scheme-relative URL is supplied', () => {
		describe( 'when no omitting params are supplied', () => {
			test( 'should return the URL without modification', () => {
				const url =
					'//example.com/path?query=%E3%83%90%E3%83%8A%E3%83%8A&query2=pineapple&query3=avocado';
				const actual = omitUrlParams( url );
				const expected =
					'//example.com/path?query=%E3%83%90%E3%83%8A%E3%83%8A&query2=pineapple&query3=avocado';
				expect( actual ).toBe( expected );
			} );
		} );

		describe( 'when a single omitting param is supplied as a string', () => {
			test( 'should return the URL with that param removed', () => {
				const url =
					'//example.com/path?query=%E3%83%90%E3%83%8A%E3%83%8A&query2=pineapple&query3=avocado';
				const param = 'query2';
				const actual = omitUrlParams( url, param );
				const expected = '//example.com/path?query=%E3%83%90%E3%83%8A%E3%83%8A&query3=avocado';
				expect( actual ).toBe( expected );
			} );
		} );

		describe( 'when an array of omitting params is supplied', () => {
			test( 'should return the URL with each of those params removed', () => {
				const url =
					'//example.com/path?query=%E3%83%90%E3%83%8A%E3%83%8A&query2=pineapple&query3=avocado';
				const params = [ 'query', 'query2' ];
				const actual = omitUrlParams( url, params );
				const expected = '//example.com/path?query3=avocado';
				expect( actual ).toBe( expected );
			} );
		} );
	} );

	describe( 'when a path-absolute URL is supplied', () => {
		describe( 'when no omitting params are supplied', () => {
			test( 'should return the URL without modification', () => {
				const url = '/path?query=%E3%83%90%E3%83%8A%E3%83%8A&query2=pineapple&query3=avocado';
				const actual = omitUrlParams( url );
				const expected = '/path?query=%E3%83%90%E3%83%8A%E3%83%8A&query2=pineapple&query3=avocado';
				expect( actual ).toBe( expected );
			} );
		} );

		describe( 'when a single omitting param is supplied as a string', () => {
			test( 'should return the URL with that param removed', () => {
				const url = '/path?query=%E3%83%90%E3%83%8A%E3%83%8A&query2=pineapple&query3=avocado';
				const param = 'query2';
				const actual = omitUrlParams( url, param );
				const expected = '/path?query=%E3%83%90%E3%83%8A%E3%83%8A&query3=avocado';
				expect( actual ).toBe( expected );
			} );
		} );

		describe( 'when an array of omitting params is supplied', () => {
			test( 'should return the URL with each of those params removed', () => {
				const url = '/path?query=%E3%83%90%E3%83%8A%E3%83%8A&query2=pineapple&query3=avocado';
				const params = [ 'query', 'query2' ];
				const actual = omitUrlParams( url, params );
				const expected = '/path?query3=avocado';
				expect( actual ).toBe( expected );
			} );
		} );
	} );

	describe( 'when a path-relative URL is supplied', () => {
		describe( 'when no omitting params are supplied', () => {
			test( 'should return the URL without modification', () => {
				const url = 'path?query=%E3%83%90%E3%83%8A%E3%83%8A&query2=pineapple&query3=avocado';
				const actual = omitUrlParams( url );
				const expected = 'path?query=%E3%83%90%E3%83%8A%E3%83%8A&query2=pineapple&query3=avocado';
				expect( actual ).toBe( expected );
			} );
		} );

		describe( 'when a single omitting param is supplied as a string', () => {
			test( 'should return the URL with that param removed', () => {
				const url = 'path?query=%E3%83%90%E3%83%8A%E3%83%8A&query2=pineapple&query3=avocado';
				const param = 'query2';
				const actual = omitUrlParams( url, param );
				const expected = 'path?query=%E3%83%90%E3%83%8A%E3%83%8A&query3=avocado';
				expect( actual ).toBe( expected );
			} );
		} );

		describe( 'when an array of omitting params is supplied', () => {
			test( 'should return the URL with each of those params removed', () => {
				const url = 'path?query=%E3%83%90%E3%83%8A%E3%83%8A&query2=pineapple&query3=avocado';
				const params = [ 'query', 'query2' ];
				const actual = omitUrlParams( url, params );
				const expected = 'path?query3=avocado';
				expect( actual ).toBe( expected );
			} );
		} );
	} );

	describe( 'when a path-relative URL with nothing but params is supplied', () => {
		describe( 'when no omitting params are supplied', () => {
			test( 'should return the URL without modification', () => {
				const url = '?query=%E3%83%90%E3%83%8A%E3%83%8A&query2=pineapple&query3=avocado';
				const actual = omitUrlParams( url );
				const expected = '?query=%E3%83%90%E3%83%8A%E3%83%8A&query2=pineapple&query3=avocado';
				expect( actual ).toBe( expected );
			} );
		} );

		describe( 'when a single omitting param is supplied as a string', () => {
			test( 'should return the URL with that param removed', () => {
				const url = '?query=%E3%83%90%E3%83%8A%E3%83%8A&query2=pineapple&query3=avocado';
				const param = 'query2';
				const actual = omitUrlParams( url, param );
				const expected = '?query=%E3%83%90%E3%83%8A%E3%83%8A&query3=avocado';
				expect( actual ).toBe( expected );
			} );
		} );

		describe( 'when an array of omitting params is supplied', () => {
			test( 'should return the URL with each of those params removed', () => {
				const url = '?query=%E3%83%90%E3%83%8A%E3%83%8A&query2=pineapple&query3=avocado';
				const params = [ 'query', 'query2' ];
				const actual = omitUrlParams( url, params );
				const expected = '?query3=avocado';
				expect( actual ).toBe( expected );
			} );
		} );
	} );

	describe( 'when an absolute URL with no params is supplied', () => {
		describe( 'when no omitting params are supplied', () => {
			test( 'should return the URL without modification', () => {
				const url = 'http://example.com/path';
				const actual = omitUrlParams( url );
				expect( actual ).toBe( url );
			} );
		} );

		describe( 'when a single omitting param is supplied as a string', () => {
			test( 'should return the URL without modification', () => {
				const url = 'http://example.com/path';
				const param = 'query2';
				const actual = omitUrlParams( url, param );
				expect( actual ).toBe( url );
			} );
		} );

		describe( 'when an array of omitting params is supplied', () => {
			test( 'should return the URL without modification', () => {
				const url = 'http://example.com/path';
				const params = [ 'query', 'query2' ];
				const actual = omitUrlParams( url, params );
				expect( actual ).toBe( url );
			} );
		} );
	} );

	describe( 'when a path-relative URL with no params is supplied', () => {
		describe( 'when no omitting params are supplied', () => {
			test( 'should return the URL without modification', () => {
				const url = 'path';
				const actual = omitUrlParams( url );
				expect( actual ).toBe( url );
			} );
		} );

		describe( 'when a single omitting param is supplied as a string', () => {
			test( 'should return the URL without modification', () => {
				const url = 'path';
				const param = 'query2';
				const actual = omitUrlParams( url, param );
				expect( actual ).toBe( url );
			} );
		} );

		describe( 'when an array of omitting params is supplied', () => {
			test( 'should return the URL without modification', () => {
				const url = 'path';
				const params = [ 'query', 'query2' ];
				const actual = omitUrlParams( url, params );
				expect( actual ).toBe( url );
			} );
		} );
	} );
} );
