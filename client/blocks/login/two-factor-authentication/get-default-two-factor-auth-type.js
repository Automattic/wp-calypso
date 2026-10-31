const AUTH_TYPES_WITHOUT_NOTIFICATION = [ 'authenticator', 'backup' ];

/**
 * Picks the two-step method to show after the password step. The server only
 * issues nonces for the methods it advertises, so a form for any other method
 * fails with "two_step_nonce required." whatever code the user enters.
 * SMS and email are only the default once that notification was actually sent.
 * @param {Object}    options
 * @param {?string[]} options.supportedAuthTypes Methods the server advertised for this login
 * @param {?string}   options.notificationSent   Notification the server sent (push, sms, email or none)
 * @param {boolean}   options.isBrowserSupported Whether this browser supports WebAuthn
 * @returns {string} The two-step auth type to show
 */
export function getDefaultTwoFactorAuthType( {
	supportedAuthTypes,
	notificationSent,
	isBrowserSupported,
} ) {
	const authTypes = supportedAuthTypes ?? [];
	const isSecurityKeySupported = authTypes.includes( 'webauthn' );

	if ( isBrowserSupported && isSecurityKeySupported && notificationSent !== 'push' ) {
		return 'webauthn';
	}

	if ( notificationSent && notificationSent !== 'none' ) {
		return notificationSent;
	}

	const authTypeWithoutNotification = AUTH_TYPES_WITHOUT_NOTIFICATION.find( ( authType ) =>
		authTypes.includes( authType )
	);
	if ( authTypeWithoutNotification ) {
		return authTypeWithoutNotification;
	}

	// The security key step tells the user this browser can't continue.
	if ( isSecurityKeySupported ) {
		return 'webauthn';
	}

	return 'authenticator';
}
