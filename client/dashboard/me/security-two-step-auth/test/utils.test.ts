/**
 * @jest-environment jsdom
 */
import { getSecurityKeyHostname } from '../utils';

/**
 * Regression guard for the WebAuthn passkey rp-id fix (#112611).
 *
 * A security key registered on the WordPress.com hosting dashboard
 * (my.wordpress.com) must be scoped to the canonical `wordpress.com`
 * relying-party id, or it is invisible at login: the login security-key
 * step always requests a challenge for `wordpress.com`, and a key only
 * works at the rp id it was created for. getSecurityKeyHostname() returns
 * `undefined` for wordpress.com and its subdomains, so the registration
 * mutation falls back to its canonical `wordpress.com` default. Other hosts
 * (local development, previews, the Woo variant) register against their own
 * hostname, because `wordpress.com` is not a registrable suffix there and
 * WebAuthn would reject the registration. Tracked in TESTOPS-227.
 */

const originalLocation = window.location;

function setHostname( hostname: string ) {
	Object.defineProperty( window, 'location', {
		configurable: true,
		writable: true,
		value: { hostname },
	} );
}

describe( 'getSecurityKeyHostname', () => {
	afterEach( () => {
		Object.defineProperty( window, 'location', {
			configurable: true,
			writable: true,
			value: originalLocation,
		} );
	} );

	it.each( [ 'wordpress.com', 'my.wordpress.com', 'wpcalypso.wordpress.com' ] )(
		'returns undefined on %s so registration uses the canonical wordpress.com rp id',
		( hostname ) => {
			setHostname( hostname );
			expect( getSecurityKeyHostname() ).toBeUndefined();
		}
	);

	it.each( [ 'example.com', 'mystore.woo.com', 'calypso.localhost' ] )(
		'returns the host itself on %s, where wordpress.com is not a registrable suffix',
		( hostname ) => {
			setHostname( hostname );
			expect( getSecurityKeyHostname() ).toBe( hostname );
		}
	);
} );
