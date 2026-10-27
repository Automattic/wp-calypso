/**
 * The two-step endpoint returns the same "not a valid verification code"
 * message for every auth type, which is misleading on the backup-code form.
 * @param {Object} requestError      Error from the two-step login request
 * @param {string} twoFactorAuthType Two factor authentication method (authenticator, backup, sms ...)
 * @param {Function} translate       Localized translate function
 * @returns {string|undefined} The message to show under the code input
 */
export function getVerificationCodeErrorMessage( requestError, twoFactorAuthType, translate ) {
	if ( twoFactorAuthType === 'backup' && requestError?.code === 'invalid_two_step_code' ) {
		return translate(
			'Hmm, that’s not a valid backup code. Please double-check your codes and try again.'
		);
	}

	return requestError?.message;
}
