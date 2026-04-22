import {
	isDomainRegistration,
	isDomainTransfer,
	isGSuiteOrGoogleWorkspace,
	isPlan,
	isTitanMail,
} from '@automattic/calypso-products';
import type { Purchase } from 'calypso/lib/purchases/types';

export type CancelRemoveCategory =
	| 'plan'
	| 'domain'
	| 'email'
	| 'marketplace_plugin'
	| 'marketplace_theme'
	| 'other';

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
