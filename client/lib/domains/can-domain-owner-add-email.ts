import { getCurrentUserCannotAddEmailReason } from 'calypso/lib/domains';
import { EMAIL_WARNING_CODE_OTHER_USER_OWNS_EMAIL } from 'calypso/lib/emails/email-provider-constants';
import type { ResponseDomain } from 'calypso/lib/domains/types';

/**
 * Determines if the domain owner can add email (i.e. if the owner of the domain subscription is also the owner of the email subscription).
 */
export function canDomainOwnerAddEmail( domain: ResponseDomain | undefined ) {
	const cannotAddEmailWarningReason = getCurrentUserCannotAddEmailReason( domain );
	const cannotAddEmailWarningCode = cannotAddEmailWarningReason?.code ?? null;
	const isDomainOwnerNotEmailOwner =
		domain.currentUserCanManage &&
		EMAIL_WARNING_CODE_OTHER_USER_OWNS_EMAIL === cannotAddEmailWarningCode;
	const isEmailOwnerNotDomainOwner =
		! domain.currentUserCanManage &&
		EMAIL_WARNING_CODE_OTHER_USER_OWNS_EMAIL !== cannotAddEmailWarningCode;

	return ! isDomainOwnerNotEmailOwner && ! isEmailOwnerNotDomainOwner;
}
