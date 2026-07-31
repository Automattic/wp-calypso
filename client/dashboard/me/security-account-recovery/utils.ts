/**
 * Whether a recovery email is the same mailbox as the account's primary email.
 *
 * A recovery email that matches the account email provides no additional
 * verification value: if the user loses access to their account email, they lose
 * access to the recovery email too. Older accounts may have set this up before the
 * backend started rejecting it, so the UI must not treat such an email as a valid
 * recovery method.
 */
export function recoveryEmailMatchesAccountEmail(
	recoveryEmail: string | undefined,
	accountEmail: string | undefined
): boolean {
	if ( ! recoveryEmail || ! accountEmail ) {
		return false;
	}

	return recoveryEmail.trim().toLowerCase() === accountEmail.trim().toLowerCase();
}
