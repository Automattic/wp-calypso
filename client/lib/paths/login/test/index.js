/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { login } from '../';
import config from 'config';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'index', () => {
	describe( '#login()', () => {
		useSandbox( sandbox => {
			sandbox
				.stub( config, 'isEnabled' )
				.withArgs( 'login/wp-login' )
				.returns( true );
		} );

		test( 'should return the legacy login url', () => {
			const url = login();

			expect( url ).to.equal( 'https://wordpress.com/wp-login.php' );
		} );

		test( 'should return the legacy login url with encoded redirect url param', () => {
			const url = login( { redirectTo: 'https://wordpress.com/?search=test&foo=bar' } );

			expect( url ).to.equal(
				'https://wordpress.com/wp-login.php?redirect_to=https%3A%2F%2Fwordpress.com%2F%3Fsearch%3Dtest%26foo%3Dbar'
			);
		} );

		test( 'should return the login url', () => {
			const url = login( { isNative: true } );

			expect( url ).to.equal( '/log-in' );
		} );

		test( 'should return the login url when the two factor auth page is supplied', () => {
			const url = login( { isNative: true, twoFactorAuthType: 'code' } );

			expect( url ).to.equal( '/log-in/code' );
		} );

		test( 'should return the login url with encoded redirect url param', () => {
			const url = login( {
				isNative: true,
				redirectTo: 'https://wordpress.com/?search=test&foo=bar',
			} );

			expect( url ).to.equal(
				'/log-in?redirect_to=https%3A%2F%2Fwordpress.com%2F%3Fsearch%3Dtest%26foo%3Dbar'
			);
		} );

		test( 'should return the login url with encoded email_address param', () => {
			const url = login( { isNative: true, emailAddress: 'foo@bar.com' } );

			expect( url ).to.equal( '/log-in?email_address=foo%40bar.com' );
		} );

		test( 'should return the login url with encoded OAuth2 client ID param', () => {
			const url = login( { isNative: true, oauth2ClientId: 12345 } );

			expect( url ).to.equal( '/log-in?client_id=12345' );
		} );

		test( 'should return the login url for Jetpck specific login', () => {
			const url = login( { isNative: true, isJetpack: true } );

			expect( url ).to.equal( '/log-in/jetpack' );
		} );
	} );
} );
