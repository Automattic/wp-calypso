/**
 * @jest-environment jsdom
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
		const site = { URL: 'https://example.org' };
		const expectedRedirectURLMatch =
			/^https:\/\/example.org\/wp-admin\/\?(.*)&action=authorize_redirect&dest_url=/i;

		const needsRedirect = shouldRedirectToJetpackAuthorize( context, site );
		expect( needsRedirect ).toBe( true );

		const initiateRedirect = getJetpackAuthorizeURL( context, site );
		expect( initiateRedirect ).toMatch( expectedRedirectURLMatch );
	} );

	test( 'redirect not needed', () => {
		const context = { query: { 'something-else': '1' } };
		const response = { site: { URL: 'https://example.org' } };

		const needsRedirect = shouldRedirectToJetpackAuthorize( context, response );
		expect( needsRedirect ).toBe( false );
	} );

	test.each( [
		'https://example.org/wordpress/wp-admin/',
		'https://example.org/wordpress/wp-admin',
		'https://example.org/wp-admin/',
		'https://admin.example.org/wordpress/wp-admin/',
	] )( 'uses the site admin URL %s for authorization', ( adminUrl ) => {
		const context = { path: '/checkout/example.org/jetpack_videopress?unlinked=1' };
		const site = {
			URL: 'https://example.org',
			options: { admin_url: adminUrl },
			meta: { links: { xmlrpc: 'https://example.org/xmlrpc.php' } },
		};

		const redirectUrl = new URL( getJetpackAuthorizeURL( context, site ) );

		expect( redirectUrl.origin + redirectUrl.pathname ).toBe( adminUrl.replace( /\/?$/, '/' ) );
		expect( redirectUrl.searchParams.get( 'page' ) ).toBe( 'jetpack' );
		expect( redirectUrl.searchParams.get( 'action' ) ).toBe( 'authorize_redirect' );
	} );

	test.each( [
		[ 'https://example.org/wordpress/xmlrpc.php', 'https://example.org/wordpress/wp-admin/' ],
		[
			'https://example.org/blog/wordpress/xmlrpc.php',
			'https://example.org/blog/wordpress/wp-admin/',
		],
		[ 'https://example.org/xmlrpc.php', 'https://example.org/wp-admin/' ],
	] )(
		'uses the WordPress directory from %s when the admin URL is unavailable',
		( xmlrpc, adminUrl ) => {
			const context = { path: '/checkout/example.org/jetpack_videopress?unlinked=1' };
			const site = { URL: 'https://example.org', meta: { links: { xmlrpc } } };

			const redirectUrl = new URL( getJetpackAuthorizeURL( context, site ) );

			expect( redirectUrl.origin + redirectUrl.pathname ).toBe( adminUrl );
			expect( redirectUrl.searchParams.get( 'action' ) ).toBe( 'authorize_redirect' );
		}
	);

	test.each( [ undefined, {}, { admin_url: null }, { admin_url: '' } ] )(
		'falls back to the public site URL when the admin URL is unavailable: %j',
		( options ) => {
			const context = { path: '/checkout/example.org/jetpack_videopress?unlinked=1' };
			const site = { URL: 'https://example.org/blog/', options };

			const redirectUrl = new URL( getJetpackAuthorizeURL( context, site ) );

			expect( redirectUrl.origin + redirectUrl.pathname ).toBe(
				'https://example.org/blog/wp-admin/'
			);
		}
	);

	test( 'preserves the checkout destination and removes only the unlinked query parameter', () => {
		window.origin = 'https://example.com';
		const context = {
			path: '/checkout/example.org/jetpack_videopress?unlinked=1&source=jetpack-videopress&redirect_to=admin.php%3Fpage%3Djetpack-videopress',
		};
		const site = {
			URL: 'https://example.org',
			options: { admin_url: 'https://example.org/wordpress/wp-admin/' },
		};

		const redirectUrl = new URL( getJetpackAuthorizeURL( context, site ) );

		expect( redirectUrl.searchParams.get( 'dest_url' ) ).toBe(
			'https://example.com/checkout/example.org/jetpack_videopress?source=jetpack-videopress&redirect_to=admin.php%3Fpage%3Djetpack-videopress'
		);
	} );
} );
