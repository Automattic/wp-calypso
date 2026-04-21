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
	if ( purchase.product_type === 'marketplace_theme' ) {
		return 'marketplace_theme';
	}
	if (
		purchase.product_type === 'marketplace_plugin' ||
		purchase.product_type === 'saas_plugin' ||
		purchase.product_type?.startsWith( 'marketplace' )
	) {
		return 'marketplace_plugin';
	}
	return 'other';
}
