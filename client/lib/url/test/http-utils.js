/**
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import { withoutHttp, urlToSlug, urlToDomainAndPath } from '../http-utils';

describe( 'withoutHttp', () => {
	test( 'should return null if URL is not provided', () => {
		expect( withoutHttp() ).toBeNull();
	} );

	test( 'should return URL without initial http', () => {
		const urlWithHttp = 'http://example.com';
		const urlWithoutHttp = withoutHttp( urlWithHttp );

		expect( urlWithoutHttp ).toEqual( 'example.com' );
	} );

	test( 'should return URL without initial https', () => {
		const urlWithHttps = 'https://example.com';
		const urlWithoutHttps = withoutHttp( urlWithHttps );

		expect( urlWithoutHttps ).toEqual( 'example.com' );
	} );

	test( 'should return URL without initial http and query string if has any', () => {
		const urlWithHttpAndQueryString = 'http://example.com?foo=bar#anchor';
		const urlWithoutHttpAndQueryString = withoutHttp( urlWithHttpAndQueryString );

		expect( urlWithoutHttpAndQueryString ).toEqual( 'example.com?foo=bar#anchor' );
	} );

	test( "should return provided URL if it doesn't include http(s)", () => {
		const urlWithoutHttp = 'example.com';

		expect( withoutHttp( urlWithoutHttp ) ).toEqual( urlWithoutHttp );
	} );

	test( 'should return empty string if URL is empty string', () => {
		const urlEmptyString = '';

		expect( withoutHttp( urlEmptyString ) ).toEqual( '' );
	} );
} );

describe( 'urlToSlug()', () => {
	test( 'should return null if URL is not provided', () => {
		expect( urlToSlug() ).toBeNull();
	} );

	test( 'should return null if URL is empty string', () => {
		const urlEmptyString = '';

		expect( urlToSlug( urlEmptyString ) ).toBeNull();
	} );

	test( 'should return URL without initial http', () => {
		const urlWithHttp = 'http://example.com';
		const urlWithoutHttp = urlToSlug( urlWithHttp );

		expect( urlWithoutHttp ).toEqual( 'example.com' );
	} );

	test( 'should return URL without initial https', () => {
		const urlWithHttps = 'https://example.com';
		const urlWithoutHttps = urlToSlug( urlWithHttps );

		expect( urlWithoutHttps ).toEqual( 'example.com' );
	} );

	test( 'should return URL without initial http and query string if has any', () => {
		const urlWithHttpAndQueryString = 'http://example.com?foo=bar#anchor';
		const urlWithoutHttpAndQueryString = urlToSlug( urlWithHttpAndQueryString );

		expect( urlWithoutHttpAndQueryString ).toEqual( 'example.com?foo=bar#anchor' );
	} );

	test( "should return provided URL if it doesn't include http(s)", () => {
		const urlWithoutHttp = 'example.com';

		expect( urlToSlug( urlWithoutHttp ) ).toEqual( urlWithoutHttp );
	} );

	test( 'should return a slug with forward slashes converted to double colons', () => {
		const urlWithHttp = 'http://example.com/example/test123';
		const urlWithoutHttp = urlToSlug( urlWithHttp );

		expect( urlWithoutHttp ).toEqual( 'example.com::example::test123' );
	} );
} );

describe( 'urlToDomainAndPath', () => {
	test( 'should return null if URL is not provided', () => {
		expect( withoutHttp() ).toBeNull();
	} );

	test( 'should return URL without initial http', () => {
		const urlWithHttp = 'http://example.com/';
		const urlWithoutHttp = urlToDomainAndPath( urlWithHttp );

		expect( urlWithoutHttp ).toEqual( 'example.com' );
	} );

	test( 'should return URL without initial https', () => {
		const urlWithHttps = 'https://example.com/';
		const urlWithoutHttps = urlToDomainAndPath( urlWithHttps );

		expect( urlWithoutHttps ).toEqual( 'example.com' );
	} );

	test( "should return provided URL if it doesn't include http(s)", () => {
		const urlWithoutHttp = 'example.com/';

		expect( urlToDomainAndPath( urlWithoutHttp ) ).toEqual( 'example.com' );
	} );

	test( 'should return empty string if URL is empty string', () => {
		const urlEmptyString = '';

		expect( urlToDomainAndPath( urlEmptyString ) ).toEqual( '' );
	} );
} );
