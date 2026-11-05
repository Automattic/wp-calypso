import { getDefaultTwoFactorAuthType } from '../get-default-two-factor-auth-type';

describe( 'getDefaultTwoFactorAuthType', () => {
	describe( 'when the browser supports WebAuthn', () => {
		const isWebAuthnSupportedByBrowser = true;

		test.each( [ 'none', 'sms', 'email' ] )(
			'uses the security key when advertised and %s was sent',
			( notificationSent ) => {
				expect(
					getDefaultTwoFactorAuthType( {
						supportedAuthTypes: [ 'webauthn', 'authenticator', 'backup', 'sms' ],
						notificationSent,
						isWebAuthnSupportedByBrowser,
					} )
				).toBe( 'webauthn' );
			}
		);

		test( 'waits for the push notification when one was sent', () => {
			expect(
				getDefaultTwoFactorAuthType( {
					supportedAuthTypes: [ 'webauthn', 'push', 'backup' ],
					notificationSent: 'push',
					isWebAuthnSupportedByBrowser,
				} )
			).toBe( 'push' );
		} );

		test( 'uses a backup code when neither security keys nor an authenticator are advertised', () => {
			expect(
				getDefaultTwoFactorAuthType( {
					supportedAuthTypes: [ 'backup', 'sms' ],
					notificationSent: 'none',
					isWebAuthnSupportedByBrowser,
				} )
			).toBe( 'backup' );
		} );
	} );

	describe( 'when the browser does not support WebAuthn', () => {
		const isWebAuthnSupportedByBrowser = false;

		test.each( [
			[ 'the security key step', [ 'webauthn' ], 'webauthn' ],
			[ 'a backup code', [ 'webauthn', 'backup' ], 'backup' ],
			[ 'the authenticator', [ 'webauthn', 'authenticator', 'backup' ], 'authenticator' ],
			[ 'the authenticator', [ 'authenticator', 'backup' ], 'authenticator' ],
			[ 'a backup code', [ 'backup', 'sms' ], 'backup' ],
		] )(
			'uses %s when nothing was sent and %j are advertised',
			( _, supportedAuthTypes, expected ) => {
				expect(
					getDefaultTwoFactorAuthType( {
						supportedAuthTypes,
						notificationSent: 'none',
						isWebAuthnSupportedByBrowser,
					} )
				).toBe( expected );
			}
		);

		test.each( [ 'push', 'sms', 'email' ] )(
			'uses the %s method when that notification was sent',
			( notificationSent ) => {
				expect(
					getDefaultTwoFactorAuthType( {
						supportedAuthTypes: [ 'webauthn', 'push', 'sms', 'email', 'backup' ],
						notificationSent,
						isWebAuthnSupportedByBrowser,
					} )
				).toBe( notificationSent );
			}
		);
	} );

	test.each( [ null, [], [ 'something-new' ] ] )(
		'falls back to the authenticator when the advertised types are %j',
		( supportedAuthTypes ) => {
			expect(
				getDefaultTwoFactorAuthType( {
					supportedAuthTypes,
					notificationSent: 'none',
					isWebAuthnSupportedByBrowser: true,
				} )
			).toBe( 'authenticator' );
		}
	);
} );
