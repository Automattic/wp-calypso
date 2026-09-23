import {
	isDomainRegistration,
	isDomainTransfer,
	isGSuiteOrGoogleWorkspace,
	isPlan,
	isTitanMail,
} from '@automattic/calypso-products';
import type { Purchase } from '@automattic/api-core';
import type { CancelRemoveCategory } from 'calypso/dashboard/me/billing-purchases/purchase-settings/classify-purchase-for-copy';

export type { CancelRemoveCategory };

export function classifyPurchaseForCopy( purchase: Purchase ): CancelRemoveCategory {
	if ( isPlan( purchase ) ) {
		return 'plan';
	}
	if ( isDomainRegistration( purchase ) || isDomainTransfer( purchase ) ) {
		return 'domain';
	}
	if ( isTitanMail( purchase ) || isGSuiteOrGoogleWorkspace( purchase ) ) {
		return 'email';
	}
	const productType = purchase.product_type;
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
