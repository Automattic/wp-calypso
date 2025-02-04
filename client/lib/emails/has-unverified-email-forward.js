import { EMAIL_WARNING_SLUG_UNVERIFIED_FORWARDS } from './email-provider-constants';

/**
 * Indicates whether the supplied email account has an unverified email forward warning
 * for any of its mailboxes.
 * @param {Object} emailAccount - Email account object returned from the server.
 * @returns {boolean} - Returns whether an email for the email account has an unverified email warning.
 */
export function hasUnverifiedEmailForward( emailAccount ) {
	if ( ! emailAccount?.emails?.length ) {
		return false;
	}

	return emailAccount.emails.some( ( email ) => {
		if ( ! email?.warnings?.length ) {
			return false;
		}

		return email.warnings.some(
			( warning ) => warning?.warning_slug === EMAIL_WARNING_SLUG_UNVERIFIED_FORWARDS
		);
	} );
}
