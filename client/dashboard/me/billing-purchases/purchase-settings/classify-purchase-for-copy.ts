import { isDomainTransfer, isGoogleWorkspace, isTitanMail } from '../../../utils/purchase';
import type { CancelRemoveCategory, Purchase } from '@automattic/api-core';

export function classifyPurchaseForCopy( purchase: Purchase ): CancelRemoveCategory {
	if ( purchase.is_plan ) {
		return 'plan';
	}
	if ( purchase.is_domain_registration || isDomainTransfer( purchase ) ) {
		return 'domain';
	}
	if ( isTitanMail( purchase ) || isGoogleWorkspace( purchase ) ) {
		return 'email';
	}
	return 'other';
}
