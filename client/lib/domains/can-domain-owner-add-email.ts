import { getCurrentUserCannotAddEmailReason } from 'calypso/lib/domains';
import { EMAIL_WARNING_CODE_OTHER_USER_OWNS_EMAIL } from 'calypso/lib/emails/email-provider-constants';
import type { ResponseDomain } from 'calypso/lib/domains/types';

/**
 * Determines if domain owner can add email (i.e. domain owner is also the email owner).
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
