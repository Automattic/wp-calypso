/**
 * Internal dependencies
 */
import { accountHasWarningWithSlug } from './account-has-warning-with-slug';
import { EMAIL_WARNING_SLUG_GOOGLE_ACCOUNT_TOS } from './email-provider-constants';

export function hasGoogleAccountTOSWarning( emailAccount ) {
	return accountHasWarningWithSlug( EMAIL_WARNING_SLUG_GOOGLE_ACCOUNT_TOS, emailAccount );
}
