/**
 * Internal dependencies
 */
import { accountHasWarningWithSlug } from './account-has-warning-with-slug';
import { EMAIL_WARNING_SLUG_UNUSED_MAILBOXES } from './email-provider-constants';

export function hasUnusedMailboxWarning( emailAccount ) {
	return accountHasWarningWithSlug( EMAIL_WARNING_SLUG_UNUSED_MAILBOXES, emailAccount );
}
