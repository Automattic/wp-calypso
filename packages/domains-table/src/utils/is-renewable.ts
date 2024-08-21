import { type } from './constants';
import { ResponseDomain } from './types';

export function isDomainRenewable( domain: ResponseDomain ) {
	// Only registered domains can be manually renewed
	if ( domain.type !== type.REGISTERED ) {
		return false;
	}
	const shouldNotAllowManualRenew =
		! domain.subscriptionId ||
		domain.isPendingRenewal ||
		domain.pendingRegistrationAtRegistry ||
		domain.pendingRegistration ||
		! domain.currentUserCanManage ||
		( domain.expired && ! domain.isRenewable && ! domain.isRedeemable ) ||
		domain.aftermarketAuction;
	return ! shouldNotAllowManualRenew;
}
