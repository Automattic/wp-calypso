/**
 * Run with:
 * yarn test-client client/blocks/login/utils/test/should-show-continue-as-user.ts
 */
import shouldShowContinueAsUser from '../should-show-continue-as-user';

describe( 'shouldShowContinueAsUser', () => {
	test( 'shows the screen to a logged-in user on the plain login route', () => {
		expect( shouldShowContinueAsUser( { isLoggedIn: true } ) ).toBe( true );
	} );

	test( 'never shows it to a logged-out user', () => {
		expect( shouldShowContinueAsUser( { isLoggedIn: false } ) ).toBe( false );
	} );

	test.each( [
		[ 'a 2FA nonce', { twoStepNonce: 'abc' } ],
		[ 'a social connect', { socialConnect: true } ],
		[ 'a generic OAuth2 client', { oauth2Client: { id: 1 } } ],
		[ 'a Jetpack login', { isJetpack: true } ],
		[ 'a site to return to', { fromSite: 'example.com' } ],
		[ '2FA enabled on the account', { twoFactorEnabled: true } ],
		[ 'an email address in the query', { loginEmailAddress: 'a@b.c' } ],
	] )( 'hides it for %s', ( _label, props ) => {
		expect( shouldShowContinueAsUser( { isLoggedIn: true, ...props } ) ).toBe( false );
	} );

	test.each( [
		[ 'WooCommerce', { isWCCOM: true } ],
		[ 'Blaze Pro', { isBlazePro: true } ],
	] )( 'keeps it for the %s OAuth2 client', ( _label, props ) => {
		expect(
			shouldShowContinueAsUser( { isLoggedIn: true, oauth2Client: { id: 1 }, ...props } )
		).toBe( true );
	} );
} );
