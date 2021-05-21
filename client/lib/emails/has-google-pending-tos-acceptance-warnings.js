/**
 * Internal dependencies
 */
import { EMAIL_WARNING_SLUG_GOOGLE_PENDING_TOS_ACCEPTANCE } from './email-provider-constants';
import { hasWarningsWithSlug } from './helpers';

export function hasGooglePendingTosAcceptanceWarnings( emailAccount ) {
	return hasWarningsWithSlug( EMAIL_WARNING_SLUG_GOOGLE_PENDING_TOS_ACCEPTANCE, emailAccount );
}
