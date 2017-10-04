/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import config from 'config';
import { login } from '../';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'index', () => {
	describe( '#login()', () => {
		useSandbox( sandbox => {
			sandbox
				.stub( config, 'isEnabled' )
				.withArgs( 'login/wp-login' )
				.returns( true );
		} );

		it( 'should return the legacy login url', () => {
			const url = login();

			expect( url ).to.equal( 'https://wordpress.com/wp-login.php' );
		} );

		it( 'should return the legacy login url with encoded redirect url param', () => {
			const url = login( { redirectTo: 'https://wordpress.com/?search=test&foo=bar' } );

			expect( url ).to.equal(
				'https://wordpress.com/wp-login.php?redirect_to=https%3A%2F%2Fwordpress.com%2F%3Fsearch%3Dtest%26foo%3Dbar'
			);
		} );

		it( 'should return the login url', () => {
			const url = login( { isNative: true } );

			expect( url ).to.equal( '/log-in' );
		} );

		it( 'should return the login url when the two factor auth page is supplied', () => {
			const url = login( { isNative: true, twoFactorAuthType: 'code' } );

			expect( url ).to.equal( '/log-in/code' );
		} );

		it( 'should return the login url with encoded redirect url param', () => {
			const url = login( {
				isNative: true,
				redirectTo: 'https://wordpress.com/?search=test&foo=bar',
			} );

			expect( url ).to.equal(
				'/log-in?redirect_to=https%3A%2F%2Fwordpress.com%2F%3Fsearch%3Dtest%26foo%3Dbar'
			);
		} );

		it( 'should return the login url with encoded email_address param', () => {
			const url = login( { isNative: true, emailAddress: 'foo@bar.com' } );

			expect( url ).to.equal( '/log-in?email_address=foo%40bar.com' );
		} );
	} );
} );
