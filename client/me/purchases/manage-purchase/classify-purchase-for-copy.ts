import {
	isDomainRegistration,
	isDomainTransfer,
	isGSuiteOrGoogleWorkspace,
	isPlan,
	isTitanMail,
} from '@automattic/calypso-products';
import type { CancelRemoveCategory } from '@automattic/api-core';
import type { Purchase } from 'calypso/lib/purchases/types';

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
	if ( purchase.productType === 'marketplace_theme' ) {
		return 'marketplace_theme';
	}
	if (
		purchase.productType === 'marketplace_plugin' ||
		purchase.productType === 'saas_plugin' ||
		purchase.productType?.startsWith( 'marketplace' )
	) {
		return 'marketplace_plugin';
	}
	return 'other';
}
