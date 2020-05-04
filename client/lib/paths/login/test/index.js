/**
 * Internal dependencies
 */
import { login } from '../';

jest.mock( 'config', () => ( {
	__esModule: true,
	default: jest.fn( ( key ) => {
		if ( 'login_url' === key ) {
			return 'https://wordpress.com/wp-login.php';
		}
	} ),
	isEnabled: jest.fn( ( key ) => {
		if ( 'login/wp-login' === key ) {
			return true;
		}
	} ),
} ) );

describe( 'index', () => {
	describe( '#login()', () => {
		test( 'should return the legacy login url', () => {
			const url = login();

			expect( url ).toEqual( 'https://wordpress.com/wp-login.php' );
		} );

		test( 'should return the legacy login url with encoded redirect url param', () => {
			const url = login( { redirectTo: 'https://wordpress.com/?search=test&foo=bar' } );

			expect( url ).toEqual(
				'https://wordpress.com/wp-login.php?redirect_to=https%3A%2F%2Fwordpress.com%2F%3Fsearch%3Dtest%26foo%3Dbar'
			);
		} );

		test( 'should return the login url', () => {
			const url = login( { isNative: true } );

			expect( url ).toEqual( '/log-in' );
		} );

		test( 'should return the login url when the two factor auth page is supplied', () => {
			const url = login( { isNative: true, twoFactorAuthType: 'code' } );

			expect( url ).toEqual( '/log-in/code' );
		} );

		test( 'should return the login url with encoded redirect url param', () => {
			const url = login( {
				isNative: true,
				redirectTo: 'https://wordpress.com/?search=test&foo=bar',
			} );

			expect( url ).toEqual(
				'/log-in?redirect_to=https%3A%2F%2Fwordpress.com%2F%3Fsearch%3Dtest%26foo%3Dbar'
			);
		} );

		test( 'should return the login url with encoded email_address param', () => {
			const url = login( { isNative: true, emailAddress: 'foo@bar.com' } );

			expect( url ).toEqual( '/log-in?email_address=foo%40bar.com' );
		} );

		test( 'should return the login url with encoded OAuth2 client ID param', () => {
			const url = login( { isNative: true, oauth2ClientId: 12345 } );

			expect( url ).toEqual( '/log-in?client_id=12345' );
		} );

		test( 'should return the login url for Jetpack specific login', () => {
			const url = login( { isNative: true, isJetpack: true } );

			expect( url ).toEqual( '/log-in/jetpack' );
		} );

		test( 'should return the login url preserving the "form" parameter', () => {
			const url = login( { isNative: true, isJetpack: true, from: 'potato' } );
			expect( url ).toEqual( '/log-in/jetpack?from=potato' );
		} );

		test( 'should return the login url for Gutenboarding specific login', () => {
			const url = login( { isNative: true, isGutenboarding: true } );
			expect( url ).toMatchSnapshot();
		} );

		test( 'should return the login url with WooCommerce.com handler', () => {
			const url = login( { isNative: true, oauth2ClientId: 12345, wccomFrom: 'testing' } );

			expect( url ).toEqual( '/log-in?client_id=12345&wccom-from=testing' );
		} );

		test( 'should return the login url for requesting a magic login link', () => {
			const url = login( { isNative: true, useMagicLink: true } );

			expect( url ).toEqual( '/log-in/link' );
		} );

		test( 'should return the login url for requesting a magic login link with encoded email_address param', () => {
			const url = login( { isNative: true, useMagicLink: true, emailAddress: 'foo@bar.com' } );

			expect( url ).toEqual( '/log-in/link?email_address=foo%40bar.com' );
		} );

		test( 'should return the login url for Jetpack, ignoring useMagicLink parameter', () => {
			const url = login( { isNative: true, isJetpack: true, useMagicLink: true } );

			expect( url ).toEqual( '/log-in/jetpack' );
		} );
	} );
} );
