import { canCurrentUserAddEmail, getCurrentUserCannotAddEmailReason } from 'calypso/lib/domains';
import {
	EMAIL_WARNING_CODE_DOMAIN_STATE_RESTRICTED,
	EMAIL_WARNING_CODE_GRAVATAR_DOMAIN,
	EMAIL_WARNING_CODE_OTHER_USER_OWNS_DOMAIN_SUBSCRIPTION,
} from 'calypso/lib/emails/email-provider-constants';
import type { ResponseDomain } from 'calypso/lib/domains/types';

/**
 * Restrictions that block email forwarding itself, rather than blocking paid email. The
 * add-forwarding page refuses to render its form for these, so anything linking to it must
 * apply the same check or the link leads to a dead end.
 */
export function isEmailForwardingRestricted( domain: ResponseDomain | undefined ) {
	const cannotAddEmailWarningCode = getCurrentUserCannotAddEmailReason( domain )?.code ?? null;

	return (
		cannotAddEmailWarningCode === EMAIL_WARNING_CODE_DOMAIN_STATE_RESTRICTED ||
		cannotAddEmailWarningCode === EMAIL_WARNING_CODE_GRAVATAR_DOMAIN
	);
}

/**
 * Whether a paid email flow should still offer free forwarding. Site admins who don't own the
 * domain subscription can't buy paid email but can forward, so they keep the promo. Every other
 * reason for being unable to add email leaves forwarding unavailable too, including reasons this
 * code doesn't recognize.
 */
export function canPromoteEmailForwarding( domain: ResponseDomain | undefined ) {
	const cannotAddEmailWarningCode = getCurrentUserCannotAddEmailReason( domain )?.code ?? null;

	return (
		canCurrentUserAddEmail( domain ) ||
		cannotAddEmailWarningCode === EMAIL_WARNING_CODE_OTHER_USER_OWNS_DOMAIN_SUBSCRIPTION
	);
}
