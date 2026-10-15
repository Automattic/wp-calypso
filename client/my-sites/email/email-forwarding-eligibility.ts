import { getCurrentUserCannotAddEmailReason } from 'calypso/lib/domains';
import {
	EMAIL_WARNING_CODE_DOMAIN_STATE_RESTRICTED,
	EMAIL_WARNING_CODE_GRAVATAR_DOMAIN,
} from 'calypso/lib/emails/email-provider-constants';
import type { ResponseDomain } from 'calypso/lib/domains/types';

/**
 * The restriction that blocks email forwarding itself, or null when forwarding is available.
 * The add-forwarding page refuses to render its form for these, so anything linking to it must
 * apply the same check or the link leads to a dead end. Callers that explain the restriction can
 * switch on the returned code.
 *
 * Every other reason the current user can't add email — not owning the domain subscription, for
 * instance — leaves forwarding itself available, so it isn't a restriction here.
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
