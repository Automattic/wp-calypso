import { ResponseDomain } from './types';

export function isDomainRenewable( domain: ResponseDomain ) {
	return ! (
		! domain.subscriptionId ||
		domain.isPendingRenewal ||
		domain.pendingRegistrationAtRegistry ||
		domain.pendingRegistration ||
		! domain.currentUserCanManage ||
		( domain.expired && ! domain.isRenewable && ! domain.isRedeemable ) ||
		domain.aftermarketAuction
	);
}
