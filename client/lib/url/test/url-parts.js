/**
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import { getUrlParts } from '../url-parts';

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
