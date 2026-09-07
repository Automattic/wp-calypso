import emailValidator from 'email-validator';
import { TLDS } from './tlds';

export type EmailAddressError = 'invalid_format' | 'unknown_tld';

/**
 * Returns why an email address is unusable, or null when it looks deliverable.
 *
 * `email-validator` only checks the shape of the address, so a typo like
 * `user@gmail.comOh` passes it. The extra TLD check catches that class of error.
 */
export function getEmailAddressError( email: string ): EmailAddressError | null {
	if ( ! email || ! emailValidator.validate( email ) ) {
		return 'invalid_format';
	}

	const tld = email.slice( email.lastIndexOf( '.' ) + 1 ).toLowerCase();
	if ( ! TLDS.has( tld ) ) {
		return 'unknown_tld';
	}

	return null;
}

export function isValidEmailAddress( email: string ): boolean {
	return getEmailAddressError( email ) === null;
}
