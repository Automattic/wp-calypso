/**
 * @jest-environment jsdom
 */
import { getSecurityKeyHostname } from '../utils';

describe( 'getSecurityKeyHostname', () => {
	const originalLocation = Object.getOwnPropertyDescriptor( window, 'location' );

	const setHostname = ( hostname: string ) => {
		Object.defineProperty( window, 'location', {
			configurable: true,
			value: { hostname },
		} );
	};

	afterEach( () => {
		Object.defineProperty( window, 'location', originalLocation! );
	} );

	// undefined lets registerTwoStepAuthSecurityKeyMutation fall back to its
	// `wordpress.com` default, matching the rp id the login step is hardcoded to.
	test.each( [ 'wordpress.com', 'my.wordpress.com' ] )(
		'returns undefined on %s so registration keeps the canonical wordpress.com rp id',
		( hostname ) => {
			setHostname( hostname );
			expect( getSecurityKeyHostname() ).toBeUndefined();
		}
	);

	// wordpress.com is not a registrable suffix off-platform, so these register
	// against their own hostname. `notwordpress.com` is the near-miss guard: it
	// ends in `wordpress.com` but not `.wordpress.com`.
	test.each( [ 'my.localhost', 'woo.com', 'notwordpress.com' ] )(
		'returns the hostname on %s',
		( hostname ) => {
			setHostname( hostname );
			expect( getSecurityKeyHostname() ).toBe( hostname );
		}
	);

	// An empty hostname (about:blank-type contexts) passes through unchanged:
	// the downstream default only fires on undefined, so '' would be used as
	// the rp id. Documents current behavior, not necessarily desired.
	test( 'returns the empty string on an empty hostname', () => {
		setHostname( '' );
		expect( getSecurityKeyHostname() ).toBe( '' );
	} );
} );
