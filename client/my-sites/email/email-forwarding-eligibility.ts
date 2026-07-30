import { canCurrentUserAddEmail, getCurrentUserCannotAddEmailReason } from 'calypso/lib/domains';
import {
	EMAIL_WARNING_CODE_DOMAIN_STATE_RESTRICTED,
	EMAIL_WARNING_CODE_GRAVATAR_DOMAIN,
	EMAIL_WARNING_CODE_OTHER_USER_OWNS_DOMAIN_SUBSCRIPTION,
} from 'calypso/lib/emails/email-provider-constants';
import type { ResponseDomain } from 'calypso/lib/domains/types';

/**
 * The restriction that blocks email forwarding itself, or null when forwarding is available.
 * The add-forwarding page refuses to render its form for these, so anything linking to it must
 * apply the same check or the link leads to a dead end. Callers that explain the restriction can
 * switch on the returned code.
 */
export function getEmailForwardingRestrictionCode( domain: ResponseDomain | undefined ) {
	const cannotAddEmailWarningCode = getCurrentUserCannotAddEmailReason( domain )?.code ?? null;

	switch ( cannotAddEmailWarningCode ) {
		case EMAIL_WARNING_CODE_DOMAIN_STATE_RESTRICTED:
		case EMAIL_WARNING_CODE_GRAVATAR_DOMAIN:
			return cannotAddEmailWarningCode;

		default:
			return null;
	}
}

/**
 * Whether a paid email flow should still offer free forwarding. Site admins who don't own the
 * domain subscription can't buy paid email but can forward, so they keep the promo. Every other
 * reason for being unable to add email leaves forwarding unavailable too, including reasons this
 * code doesn't recognize.
 */
export function canPromoteEmailForwarding( domain: ResponseDomain | undefined ) {
	if ( canCurrentUserAddEmail( domain ) ) {
		return true;
	}

	return (
		getCurrentUserCannotAddEmailReason( domain )?.code ===
		EMAIL_WARNING_CODE_OTHER_USER_OWNS_DOMAIN_SUBSCRIPTION
	);
}
