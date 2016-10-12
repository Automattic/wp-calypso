/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isExternal, withoutHttp } from '../';

describe( 'withoutHttp', () => {
	it( 'should return null if URL is not provided', () => {
		expect( withoutHttp() ).to.be.null;
	} );

	it( 'should return URL without initial http', () => {
		const urlWithHttp = 'http://example.com';
		const urlWithoutHttp = withoutHttp( urlWithHttp );

		expect( urlWithoutHttp ).to.equal( 'example.com' );
	} );

	it( 'should return URL without initial https', () => {
		const urlWithHttps = 'https://example.com';
		const urlWithoutHttps = withoutHttp( urlWithHttps );

		expect( urlWithoutHttps ).to.equal( 'example.com' );
	} );

	it( 'should return URL without initial http and query string if has any', () => {
		const urlWithHttpAndQueryString = 'http://example.com?foo=bar#anchor';
		const urlWithoutHttpAndQueryString = withoutHttp( urlWithHttpAndQueryString );

		expect( urlWithoutHttpAndQueryString ).to.equal( 'example.com?foo=bar#anchor' );
	} );

	it( "should return provided URL if it doesn't include http(s)", () => {
		const urlWithoutHttp = 'example.com';

		expect( withoutHttp( urlWithoutHttp ) ).to.equal( urlWithoutHttp );
	} );

	it( 'should return empty string if URL is empty string', () => {
		const urlEmptyString = '';

		expect( withoutHttp( urlEmptyString ) ).to.equal( '' );
	} );
} );

describe( 'isExternal', () => {
	it( 'should return false for url without hostname', () => {
		const source = '/relative';

		const actual = isExternal( source );

		expect( actual ).to.be.false;
	} );

	it( 'should return true when matching an external url with no protocol', () => {
		const source = '//some-other-site.com';

		const actual = isExternal( source );

		expect( actual ).to.be.true;
	} );

	describe( 'without global.window', () => {
		it( 'should return true when not matching config hostname', () => {
			const source = 'https://not.localhost/me';

			const actual = isExternal( source );

			expect( actual ).to.be.true;
		} );

		it( 'should return false when matching config hostname', () => {
			const source = 'https://calypso.localhost/me';

			const actual = isExternal( source );

			expect( actual ).to.be.false;
		} );
	} );
} );
