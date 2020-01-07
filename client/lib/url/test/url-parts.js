/**
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import { getUrlParts, getUrlFromParts } from '../url-parts';

describe( 'getUrlParts', () => {
	test( 'should empty parts for invalid URLs', () => {
		expect( getUrlParts( '///' ) ).toEqual( {
			hash: '',
			host: '',
			hostname: '',
			origin: '',
			password: '',
			pathname: '',
			port: '',
			protocol: '',
			search: '',
			searchParams: expect.any( URLSearchParams ),
			username: '',
		} );

		expect( getUrlParts( 'https://example.com:badport?foo=bar#baz' ) ).toEqual( {
			hash: '',
			host: '',
			hostname: '',
			origin: '',
			password: '',
			pathname: '',
			port: '',
			protocol: '',
			search: '',
			searchParams: expect.any( URLSearchParams ),
			username: '',
		} );
	} );

	test( 'should return the right parts for absolute URLs', () => {
		expect( getUrlParts( 'http://example.com' ) ).toEqual( {
			hash: '',
			host: 'example.com',
			hostname: 'example.com',
			origin: 'http://example.com',
			password: '',
			pathname: '/',
			port: '',
			protocol: 'http:',
			search: '',
			searchParams: expect.any( URLSearchParams ),
			username: '',
		} );

		expect( getUrlParts( 'http://user:pass@example.com:8080/path?foo=bar#baz' ) ).toEqual( {
			hash: '#baz',
			host: 'example.com:8080',
			hostname: 'example.com',
			origin: 'http://example.com:8080',
			password: 'pass',
			pathname: '/path',
			port: '8080',
			protocol: 'http:',
			search: '?foo=bar',
			searchParams: expect.any( URLSearchParams ),
			username: 'user',
		} );
	} );

	test( 'should return the right parts for scheme-relative URLs', () => {
		expect( getUrlParts( '//example.com' ) ).toEqual( {
			hash: '',
			host: 'example.com',
			hostname: 'example.com',
			origin: '',
			password: '',
			pathname: '/',
			port: '',
			protocol: '',
			search: '',
			searchParams: expect.any( URLSearchParams ),
			username: '',
		} );

		expect( getUrlParts( '//user:pass@example.com:8080/path?foo=bar#baz' ) ).toEqual( {
			hash: '#baz',
			host: 'example.com:8080',
			hostname: 'example.com',
			origin: '',
			password: 'pass',
			pathname: '/path',
			port: '8080',
			protocol: '',
			search: '?foo=bar',
			searchParams: expect.any( URLSearchParams ),
			username: 'user',
		} );
	} );

	test( 'should return the right parts for path-absolute URLs', () => {
		expect( getUrlParts( '/' ) ).toEqual( {
			hash: '',
			host: '',
			hostname: '',
			origin: '',
			password: '',
			pathname: '/',
			port: '',
			protocol: '',
			search: '',
			searchParams: expect.any( URLSearchParams ),
			username: '',
		} );

		expect( getUrlParts( '/path?foo=bar#baz' ) ).toEqual( {
			hash: '#baz',
			host: '',
			hostname: '',
			origin: '',
			password: '',
			pathname: '/path',
			port: '',
			protocol: '',
			search: '?foo=bar',
			searchParams: expect.any( URLSearchParams ),
			username: '',
		} );
	} );

	test( 'should return the right parts for path-relative URLs', () => {
		expect( getUrlParts( 'path' ) ).toEqual( {
			hash: '',
			host: '',
			hostname: '',
			origin: '',
			password: '',
			pathname: 'path',
			port: '',
			protocol: '',
			search: '',
			searchParams: expect.any( URLSearchParams ),
			username: '',
		} );

		expect( getUrlParts( '../path?foo=bar#baz' ) ).toEqual( {
			hash: '#baz',
			host: '',
			hostname: '',
			origin: '',
			password: '',
			pathname: '../path',
			port: '',
			protocol: '',
			search: '?foo=bar',
			searchParams: expect.any( URLSearchParams ),
			username: '',
		} );

		expect( getUrlParts( '../path#baz' ) ).toEqual( {
			hash: '#baz',
			host: '',
			hostname: '',
			origin: '',
			password: '',
			pathname: '../path',
			port: '',
			protocol: '',
			search: '',
			searchParams: expect.any( URLSearchParams ),
			username: '',
		} );
	} );
} );

describe( 'getUrlFromParts', () => {
	test( 'should throw an error if no parts object is provided', () => {
		expect( () => getUrlFromParts().toThrow() );
		expect( () => getUrlFromParts( undefined ).toThrow() );
		expect( () => getUrlFromParts( null ).toThrow() );
	} );

	test( 'should throw an error if an empty parts object is provided', () => {
		expect( () => getUrlFromParts( {} ) ).toThrow();
	} );

	test( 'should throw an error if no protocol is specified', () => {
		expect( () => getUrlFromParts( { host: 'example.com', pathname: '/path' } ) ).toThrow();
	} );

	test( 'should throw an error if no host is specified', () => {
		expect( () => getUrlFromParts( { protocol: 'http:', pathname: '/path' } ) ).toThrow();
	} );

	test( 'should throw an error if an invalid origin is specified', () => {
		expect( () => getUrlFromParts( { origin: '///' } ) ).toThrow();
		expect( () => getUrlFromParts( { origin: 'example.com' } ) ).toThrow();
		expect( () => getUrlFromParts( { origin: 'http://' } ) ).toThrow();
		expect( () => getUrlFromParts( { origin: '' } ) ).toThrow();
	} );

	test( 'should produce valid URLs from valid parts objects', () => {
		expect(
			getUrlFromParts( {
				origin: 'http://example.com',
			} ).href
		).toBe( 'http://example.com/' );

		expect(
			getUrlFromParts( {
				protocol: 'http:',
				host: 'example.com',
			} ).href
		).toBe( 'http://example.com/' );

		expect(
			getUrlFromParts( {
				protocol: 'https:',
				host: 'example.com',
				pathname: '/path',
			} ).href
		).toBe( 'https://example.com/path' );

		expect(
			getUrlFromParts( {
				protocol: 'http:',
				host: 'example.com:8080',
				pathname: '/path',
			} ).href
		).toBe( 'http://example.com:8080/path' );

		expect(
			getUrlFromParts( {
				protocol: 'http:',
				port: '8080',
				hostname: 'example.com',
				pathname: '/path',
			} ).href
		).toBe( 'http://example.com:8080/path' );

		expect(
			getUrlFromParts( {
				hash: '#baz',
				host: 'example.com:8080',
				hostname: 'example.com',
				password: 'pass',
				pathname: '/path',
				port: '8080',
				protocol: 'http:',
				search: '?foo=bar',
				username: 'user',
			} ).href
		).toBe( 'http://user:pass@example.com:8080/path?foo=bar#baz' );

		expect(
			getUrlFromParts( {
				hash: '#baz',
				host: 'example.com:8080',
				hostname: 'example.com',
				password: 'pass',
				pathname: '/path',
				port: '8080',
				protocol: 'http:',
				searchParams: new URLSearchParams( { foo: 'bar' } ),
				username: 'user',
			} ).href
		).toBe( 'http://user:pass@example.com:8080/path?foo=bar#baz' );
	} );

	test( 'should override values in origin with values from host', () => {
		expect(
			getUrlFromParts( {
				origin: 'https://override-me.invalid:8000',
				host: 'example.com:8080',
			} ).href
		).toBe( 'https://example.com:8080/' );
	} );

	test( 'should override values in origin with values from protocol, hostname, and port', () => {
		expect(
			getUrlFromParts( {
				protocol: 'http:',
				port: '8080',
				origin: 'https://override-me.invalid:8000',
				hostname: 'example.com',
			} ).href
		).toBe( 'http://example.com:8080/' );
	} );

	test( 'should override values in host with values from hostname and port', () => {
		expect(
			getUrlFromParts( {
				protocol: 'http:',
				port: '8080',
				host: 'override-me.invalid:8000',
				hostname: 'example.com',
			} ).href
		).toBe( 'http://example.com:8080/' );
	} );

	test( 'should override values in searchParams with values from search', () => {
		expect(
			getUrlFromParts( {
				origin: 'http://example.com',
				searchParams: new URLSearchParams( { foo: 'bar' } ),
				search: '?bar=baz',
			} ).href
		).toBe( 'http://example.com/?bar=baz' );
	} );

	test( 'should ignore empty values in parts', () => {
		expect(
			getUrlFromParts( {
				protocol: 'https:',
				host: '',
				hostname: 'example.com',
				origin: '',
				password: '',
				pathname: '',
				port: '',
				search: '',
				searchParams: null,
				username: '',
			} ).href
		).toBe( 'https://example.com/' );
	} );
} );
