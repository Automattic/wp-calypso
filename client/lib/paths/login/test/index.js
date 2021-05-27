/**
 * Internal dependencies
 */
import { login } from '..';

describe( 'login', () => {
	test( 'should return the login url', () => {
		const url = login();
		expect( url ).toBe( '/log-in' );
	} );

	test( 'should return the login url when the two factor auth page is supplied', () => {
		const url = login( { twoFactorAuthType: 'code' } );
		expect( url ).toBe( '/log-in/code' );
	} );

	test( 'should return the login url with encoded redirect url param', () => {
		const url = login( { redirectTo: 'https://wordpress.com/?search=test&foo=bar' } );
		expect( url ).toBe(
			'/log-in?redirect_to=https%3A%2F%2Fwordpress.com%2F%3Fsearch%3Dtest%26foo%3Dbar'
		);
	} );

	test( 'should return the login url with encoded email_address param', () => {
		const url = login( { emailAddress: 'foo@bar.com' } );
		expect( url ).toBe( '/log-in?email_address=foo%40bar.com' );
	} );

	test( 'should return the login url with encoded OAuth2 client ID param', () => {
		const url = login( { oauth2ClientId: 12345 } );
		expect( url ).toBe( '/log-in?client_id=12345' );
	} );

	test( 'should return the login url for Jetpack specific login', () => {
		const url = login( { isJetpack: true } );
		expect( url ).toBe( '/log-in/jetpack' );
	} );

	test( 'should return the login url preserving the "form" parameter', () => {
		const url = login( { isJetpack: true, from: 'potato' } );
		expect( url ).toBe( '/log-in/jetpack?from=potato' );
	} );

	test( 'should return the login url for Gutenboarding specific login', () => {
		const url = login( { isGutenboarding: true } );
		expect( url ).toBe( '/log-in/new' );
	} );

	test( 'should return the login url with WooCommerce.com handler', () => {
		const url = login( { oauth2ClientId: 12345, wccomFrom: 'testing' } );
		expect( url ).toBe( '/log-in?client_id=12345&wccom-from=testing' );
	} );

	test( 'should return the login url for requesting a magic login link', () => {
		const url = login( { useMagicLink: true } );
		expect( url ).toBe( '/log-in/link' );
	} );

	test( 'should return the login url for requesting a magic login link with encoded email_address param', () => {
		const url = login( { useMagicLink: true, emailAddress: 'foo@bar.com' } );
		expect( url ).toBe( '/log-in/link?email_address=foo%40bar.com' );
	} );

	test( 'should return the login url for Jetpack, ignoring useMagicLink parameter', () => {
		const url = login( { isJetpack: true, useMagicLink: true } );
		expect( url ).toBe( '/log-in/jetpack' );
	} );
} );
