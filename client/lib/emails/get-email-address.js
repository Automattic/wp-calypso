/**
 * Construct an email address from the mailbox object.
 * @param {Object} Mailbox The mailbox object.
 * @param {string} Mailbox.mailbox The mailbox name/username for the mailbox.
 * @param {string} Mailbox.domain The domain for the mailbox.
 * @returns {string} Returns the email address formed from the mailbox object.
 */
export function getEmailAddress( { mailbox, domain } ) {
	if ( mailbox && domain ) {
		return `${ mailbox }@${ domain }`;
	}

	return '';
}
