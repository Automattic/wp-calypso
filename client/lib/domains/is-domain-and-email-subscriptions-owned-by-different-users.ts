import { getCurrentUserCannotAddEmailReason } from 'calypso/lib/domains';
import { EMAIL_WARNING_CODE_OTHER_USER_OWNS_EMAIL } from 'calypso/lib/emails/email-provider-constants';
import type { ResponseDomain } from 'calypso/lib/domains/types';

/**
 * Determines if the domain owner can add email (i.e. if the owner of the domain subscription is also the owner of the email subscription).
 */
export function isDomainAndEmailSubscriptionsOwnedByDifferentUsers(
	domain: ResponseDomain | undefined
): boolean {
	//Early exit returns the result of evaluating: ! undefined && ! true
	if ( ! domain ) {
		return false;
	}

	const currentUserCannotAddEmailReason = getCurrentUserCannotAddEmailReason( domain );
	const cannotAddEmailWarningCode = currentUserCannotAddEmailReason?.code ?? null;
	const isDomainOwnerNotEmailOwner =
		domain.currentUserCanManage &&
		EMAIL_WARNING_CODE_OTHER_USER_OWNS_EMAIL === cannotAddEmailWarningCode;
	const isEmailOwnerNotDomainOwner =
		! domain.currentUserCanManage &&
		EMAIL_WARNING_CODE_OTHER_USER_OWNS_EMAIL !== cannotAddEmailWarningCode;

	return ! isDomainOwnerNotEmailOwner && ! isEmailOwnerNotDomainOwner;
}
