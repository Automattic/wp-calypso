/**
 * Internal dependencies
 */
import { EMAIL_WARNING_SLUG_UNUSED_MAILBOXES } from './email-provider-constants';
import { hasWarningsWithSlug } from './helpers';

export function hasUnusedMailboxWarnings( emailAccount ) {
	return hasWarningsWithSlug( EMAIL_WARNING_SLUG_UNUSED_MAILBOXES, emailAccount );
}
