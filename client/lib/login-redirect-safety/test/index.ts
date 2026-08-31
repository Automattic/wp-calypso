/**
 * @jest-environment jsdom
 */
import {
	isSafeLoginRedirect,
	pointsAtLoginPage,
	resolvePostLoginRedirect,
} from 'calypso/lib/login-redirect-safety';

const originalLocation = window.location;

describe( 'login redirect safety', () => {
	beforeEach( () => {
		Object.defineProperty( window, 'location', {
			value: { href: '', origin: 'https://wordpress.com' },
			writable: true,
		} );
	} );

	afterEach( () => {
		Object.defineProperty( window, 'location', originalLocation );
	} );

	describe( 'resolvePostLoginRedirect', () => {
		test( 'returns null when there is no redirect', () => {
			expect( resolvePostLoginRedirect( null ) ).toBeNull();
			expect( resolvePostLoginRedirect( undefined ) ).toBeNull();
			expect( resolvePostLoginRedirect( '' ) ).toBeNull();
		} );

		test( 'leaves an ordinary relative destination alone', () => {
			expect( resolvePostLoginRedirect( '/home' ) ).toBe( '/home' );
			expect( resolvePostLoginRedirect( '/sites' ) ).toBe( '/sites' );
		} );

		test( 'leaves a destination on another host alone', () => {
			// The OAuth2 authorize hand-off is not on the allowlist and must
			// still pass through untouched.
			const authorize =
				'https://public-api.wordpress.com/oauth2/authorize?client_id=1&response_type=code';

			expect( resolvePostLoginRedirect( authorize ) ).toBe( authorize );
		} );

		test( 'leaves an Atomic site destination alone', () => {
			const site = 'https://example.com/wp-login.php?action=jetpack-sso';

			expect( resolvePostLoginRedirect( site ) ).toBe( site );
		} );

		test( 'unwraps the destination nested in a login page URL', () => {
			expect( resolvePostLoginRedirect( 'https://wordpress.com/log-in?redirect_to=%2Fhome' ) ).toBe(
				'/home'
			);
		} );

		test( 'unwraps a relative login page URL', () => {
			expect( resolvePostLoginRedirect( '/log-in/link/use?redirect_to=%2Fsites' ) ).toBe(
				'/sites'
			);
		} );

		test( 'unwraps more than one layer of login page', () => {
			const doubled =
				'/log-in?redirect_to=' +
				encodeURIComponent( '/log-in?redirect_to=' + encodeURIComponent( '/home' ) );

			expect( resolvePostLoginRedirect( doubled ) ).toBe( '/home' );
		} );

		test( 'gives up on a login page with nothing nested inside', () => {
			expect( resolvePostLoginRedirect( 'https://wordpress.com/log-in' ) ).toBeNull();
			expect( resolvePostLoginRedirect( '/log-in?client_id=1' ) ).toBeNull();
		} );

		test( 'gives up rather than following a nested destination off-site', () => {
			expect(
				resolvePostLoginRedirect(
					'https://wordpress.com/log-in?redirect_to=' +
						encodeURIComponent( 'https://evil.example/' )
				)
			).toBeNull();
		} );

		test( 'gives up rather than following a nested protocol-relative URL', () => {
			expect(
				resolvePostLoginRedirect(
					'https://wordpress.com/log-in?redirect_to=' + encodeURIComponent( '//evil.example/' )
				)
			).toBeNull();
		} );

		test( 'gives up on a login page that only ever points at itself', () => {
			const selfReferencing =
				'https://wordpress.com/log-in?redirect_to=%2Flog-in%3Fredirect_to%3D%252Flog-in';

			expect( resolvePostLoginRedirect( selfReferencing ) ).toBeNull();
		} );

		test( 'does not treat an unrelated path that starts with log-in as the login page', () => {
			// Guards against a prefix match swallowing something else later.
			expect( resolvePostLoginRedirect( '/home?from=/log-in' ) ).toBe( '/home?from=/log-in' );
		} );
	} );

	describe( 'pointsAtLoginPage', () => {
		test( 'is true for our own login page', () => {
			expect( pointsAtLoginPage( '/log-in' ) ).toBe( true );
			expect( pointsAtLoginPage( 'https://wordpress.com/log-in/link/use' ) ).toBe( true );
		} );

		test( 'is false for anything else', () => {
			expect( pointsAtLoginPage( null ) ).toBe( false );
			expect( pointsAtLoginPage( '/home' ) ).toBe( false );
			expect( pointsAtLoginPage( 'https://example.com/log-in' ) ).toBe( false );
		} );
	} );

	describe( 'isSafeLoginRedirect', () => {
		test( 'accepts relative paths and allowlisted hosts', () => {
			expect( isSafeLoginRedirect( '/home' ) ).toBe( true );
			expect( isSafeLoginRedirect( 'https://wordpress.com/home' ) ).toBe( true );
			expect( isSafeLoginRedirect( 'https://subscribe.wordpress.com/' ) ).toBe( true );
		} );

		test( 'rejects other hosts, other schemes and empty values', () => {
			expect( isSafeLoginRedirect( 'https://evil.example/' ) ).toBe( false );
			expect( isSafeLoginRedirect( 'http://wordpress.com/home' ) ).toBe( false );
			expect( isSafeLoginRedirect( '//evil.example/' ) ).toBe( false );
			expect( isSafeLoginRedirect( null ) ).toBe( false );
		} );

		test( 'rejects a WordPress.com subdomain that is not on the allowlist', () => {
			// Subdomains are user-controlled, so widening this is a security
			// decision rather than a bug fix.
			expect( isSafeLoginRedirect( 'https://mysite.wordpress.com/wp-admin/' ) ).toBe( false );
		} );
	} );
} );
