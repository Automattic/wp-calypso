/**
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import format from '../format';

describe( 'getUrlType', () => {
	test( 'should format absolute URLs as absolute URLs', () => {
		expect( format( 'http://example.com/', 'ABSOLUTE' ) ).toBe( 'http://example.com/' );
		expect( format( 'http://example.com:8080/', 'ABSOLUTE' ) ).toBe( 'http://example.com:8080/' );
		expect( format( 'http://www.example.com', 'ABSOLUTE' ) ).toBe( 'http://www.example.com/' );
		expect( format( 'http://example.com/foo?b=a#z', 'ABSOLUTE' ) ).toBe(
			'http://example.com/foo?b=a#z'
		);
		expect( format( 'http://example.com/foo/bar/../baz', 'ABSOLUTE' ) ).toBe(
			'http://example.com/foo/baz'
		);
		// Normalization examples from https://url.spec.whatwg.org/#urls
		expect( format( 'https:example.org', 'ABSOLUTE' ) ).toBe( 'https://example.org/' );
		expect( format( 'https://////example.com///', 'ABSOLUTE' ) ).toBe( 'https://example.com///' );
		expect( format( 'https://example.com/././foo', 'ABSOLUTE' ) ).toBe( 'https://example.com/foo' );
		expect( format( 'file:///C|/demo', 'ABSOLUTE' ) ).toBe( 'file:///C:/demo' );
		expect( format( 'file://loc%61lhost/', 'ABSOLUTE' ) ).toBe( 'file:///' );
		expect( format( 'https://user:password@example.org/', 'ABSOLUTE' ) ).toBe(
			'https://user:password@example.org/'
		);
		expect( format( 'https://example.org/foo bar', 'ABSOLUTE' ) ).toBe(
			'https://example.org/foo%20bar'
		);
		expect( format( 'https://EXAMPLE.com/../x', 'ABSOLUTE' ) ).toBe( 'https://example.com/x' );
	} );

	test( 'should format absolute URLs as scheme-relative URLs', () => {
		expect( format( 'http://example.com/', 'SCHEME_RELATIVE' ) ).toBe( '//example.com/' );
		expect( format( 'http://example.com:8080/', 'SCHEME_RELATIVE' ) ).toBe( '//example.com:8080/' );
		expect( format( 'http://www.example.com', 'SCHEME_RELATIVE' ) ).toBe( '//www.example.com/' );
		expect( format( 'http://example.com/foo?b=a#z', 'SCHEME_RELATIVE' ) ).toBe(
			'//example.com/foo?b=a#z'
		);
		expect( format( 'http://example.com/foo/bar/../baz', 'SCHEME_RELATIVE' ) ).toBe(
			'//example.com/foo/baz'
		);
	} );

	test( 'should format scheme-relative URLs as scheme-relative URLs', () => {
		expect( format( '//example.com/', 'SCHEME_RELATIVE' ) ).toBe( '//example.com/' );
		expect( format( '//example.com:8080/', 'SCHEME_RELATIVE' ) ).toBe( '//example.com:8080/' );
		expect( format( '//www.example.com', 'SCHEME_RELATIVE' ) ).toBe( '//www.example.com/' );
		expect( format( '//example.com/foo?b=a#z', 'SCHEME_RELATIVE' ) ).toBe(
			'//example.com/foo?b=a#z'
		);
		expect( format( '//example.com/foo/bar/../baz', 'SCHEME_RELATIVE' ) ).toBe(
			'//example.com/foo/baz'
		);
	} );

	test( 'should format absolute URLs as path-absolute URLs', () => {
		expect( format( 'http://example.com/', 'PATH_ABSOLUTE' ) ).toBe( '/' );
		expect( format( 'http://example.com:8080/', 'PATH_ABSOLUTE' ) ).toBe( '/' );
		expect( format( 'http://www.example.com', 'PATH_ABSOLUTE' ) ).toBe( '/' );
		expect( format( 'http://example.com/foo?b=a#z', 'PATH_ABSOLUTE' ) ).toBe( '/foo?b=a#z' );
	} );

	test( 'should format scheme-relative URLs as path-absolute URLs', () => {
		expect( format( '//example.com/', 'PATH_ABSOLUTE' ) ).toBe( '/' );
		expect( format( '//example.com:8080/', 'PATH_ABSOLUTE' ) ).toBe( '/' );
		expect( format( '//www.example.com', 'PATH_ABSOLUTE' ) ).toBe( '/' );
		expect( format( '//example.com/foo?b=a#z', 'PATH_ABSOLUTE' ) ).toBe( '/foo?b=a#z' );
		expect( format( '//example.com/foo/bar/../baz', 'PATH_ABSOLUTE' ) ).toBe( '/foo/baz' );
	} );

	test( 'should format path-absolute URLs as path-absolute URLs', () => {
		expect( format( '/', 'PATH_ABSOLUTE' ) ).toBe( '/' );
		expect( format( '/foo?b=a#z', 'PATH_ABSOLUTE' ) ).toBe( '/foo?b=a#z' );
		expect( format( '/foo/bar/../baz', 'PATH_ABSOLUTE' ) ).toBe( '/foo/baz' );
	} );

	test( 'should format a URL into its own type when a format is not specified', () => {
		expect( format( 'http://example.com/foo' ) ).toBe( 'http://example.com/foo' );
		expect( format( '//example.com/foo' ) ).toBe( '//example.com/foo' );
		expect( format( '/foo' ) ).toBe( '/foo' );
	} );

	test( 'should throw if passed an invalid URL', () => {
		expect( () => format( null, 'PATH_ABSOLUTE' ) ).toThrow();
		expect( () => format( '///', 'PATH_ABSOLUTE' ) ).toThrow();
	} );

	test( 'should throw if passed an invalid url type into which to format', () => {
		expect( () => format( 'http://example.com/', 'INVALID' ) ).toThrow();
		expect( () => format( 'http://example.com/', 'NONEXISTENT' ) ).toThrow();
	} );

	test( 'should throw if attempting to format a URL as a path-relative URL', () => {
		expect( () => format( 'http://example.com/', 'PATH_RELATIVE' ) ).toThrow();
		expect( () => format( 'foo', 'PATH_RELATIVE' ) ).toThrow();
	} );

	test( 'should throw if passed a path-absolute URL to format as scheme-relative', () => {
		expect( () => format( '/', 'SCHEME_RELATIVE' ) ).toThrow();
	} );

	test( 'should throw if passed a path-relative URL to format as scheme-relative', () => {
		expect( () => format( 'foo', 'SCHEME_RELATIVE' ) ).toThrow();
	} );

	test( 'should throw if passed a path-absolute URL to format as absolute', () => {
		expect( () => format( '/', 'ABSOLUTE' ) ).toThrow();
	} );

	test( 'should throw if passed a pathrelative URL to format as absolute', () => {
		expect( () => format( 'foo', 'ABSOLUTE' ) ).toThrow();
	} );

	test( 'should throw if passed a scheme-relative URL to format as absolute', () => {
		expect( () => format( '//example.com/', 'ABSOLUTE' ) ).toThrow();
	} );
} );
