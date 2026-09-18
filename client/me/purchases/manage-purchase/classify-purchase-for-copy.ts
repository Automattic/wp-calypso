import {
	isDomainRegistration,
	isDomainTransfer,
	isGSuiteOrGoogleWorkspace,
	isPlan,
	isTitanMail,
} from '@automattic/calypso-products';
import type { Purchase } from '@automattic/api-core';
import type { Purchases } from '@automattic/data-stores';
import type { CancelRemoveCategory } from 'calypso/dashboard/me/billing-purchases/purchase-settings/classify-purchase-for-copy';

export type { CancelRemoveCategory };

/**
 * Accepts either the raw api-core `Purchase` (migrated pages) or the legacy
 * camelCase `Purchases.Purchase` (pages not yet migrated off the assembler)
 * during the SHILL-2256 transition. The calypso-products predicates already
 * accept both slug shapes; only `product_type` is read directly here.
 */
export function classifyPurchaseForCopy(
	purchase: Purchase | Purchases.Purchase
): CancelRemoveCategory {
	if ( isPlan( purchase ) ) {
		return 'plan';
	}
	if ( isDomainRegistration( purchase ) || isDomainTransfer( purchase ) ) {
		return 'domain';
	}
	if ( isTitanMail( purchase ) || isGSuiteOrGoogleWorkspace( purchase ) ) {
		return 'email';
	}
	const productType = 'product_type' in purchase ? purchase.product_type : purchase.productType;
	if ( productType === 'marketplace_theme' ) {
		return 'marketplace_theme';
	}
	if (
		productType === 'marketplace_plugin' ||
		productType === 'saas_plugin' ||
		productType?.startsWith( 'marketplace' )
	) {
		return 'marketplace_plugin';
	}
	return 'other';
}
