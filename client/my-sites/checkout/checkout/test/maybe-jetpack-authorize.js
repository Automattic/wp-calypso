/**
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import {
	shouldRedirectToJetpackAuthorize,
	getJetpackAuthorizeURL,
} from 'calypso/my-sites/controller';

describe( 'redirectToJetpack', () => {
	let origin;
	beforeEach( () => {
		origin = window.origin;
		window.origin = '';
	} );

	afterEach( () => {
		window.origin = origin;
	} );

	test( 'redirect needed', () => {
		const context = { query: { unlinked: '1' } };
		const response = { site: { URL: 'https://example.org' } };
		const expectedRedirectURLMatch = /^https:\/\/example.org\/wp-admin\/\?(.*)&action=authorize_redirect&dest_url=/i;

		const needsRedirect = shouldRedirectToJetpackAuthorize( context, response );
		expect( needsRedirect ).toBe( true );

		const initiateRedirect = getJetpackAuthorizeURL( context, response );
		expect( initiateRedirect ).toMatch( expectedRedirectURLMatch );
	} );

	test( 'redirect not needed', () => {
		const context = { query: { 'something-else': '1' } };
		const response = { site: { URL: 'https://example.org' } };

		const needsRedirect = shouldRedirectToJetpackAuthorize( context, response );
		expect( needsRedirect ).toBe( false );
	} );
} );
