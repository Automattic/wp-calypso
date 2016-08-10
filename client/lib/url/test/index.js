/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { withoutHttp } from '../';

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

	it( "should return provided URL if it doesn't include http(s)", () => {
		const urlWithoutHttp = 'example.com';

		expect( withoutHttp( urlWithoutHttp ) ).to.equal( urlWithoutHttp );
	} );
} );
