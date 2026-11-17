import { type LocalizeProps } from 'i18n-calypso';

/**
 * The sentence that tells someone what to do on a two-step screen. The account template
 * shows it as the heading's subtitle; Gravatar-powered logins, which have no such heading,
 * show it in the form.
 *
 * The security key screen has none: its text depends on the state of the browser prompt.
 * @param twoFactorAuthType Two factor authentication method (authenticator, backup, sms ...)
 * @param hasEmailNonce     Whether the code was emailed, whatever the route says
 * @param translate         Localized translate function
 * @returns The sentence, or null when the screen has none
 */
export function getTwoFactorHelpText(
	twoFactorAuthType: string,
	hasEmailNonce: boolean,
	translate: LocalizeProps[ 'translate' ]
) {
	switch ( twoFactorAuthType ) {
		case 'backup':
			return translate(
				'Enter a backup code to continue. Use one of the 10 codes you received during setup.'
			);
		case 'sms':
			return translate( 'Enter the code from the text message we sent you.' );
		case 'push':
			return translate( 'Check your device. Approve your login with the Jetpack mobile app.' );
		case 'authenticator':
		case 'email':
			return hasEmailNonce
				? translate( 'Enter the code from the email we sent you.' )
				: translate( 'Enter the code from your authenticator app.' );
		default:
			return null;
	}
}
