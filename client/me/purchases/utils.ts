import { isDomainTransfer, is100Year } from '@automattic/calypso-products';
import {
	isCloseToExpiration,
	isExpired,
	isIncludedWithPlan,
	isOneTimePurchase,
	isPaidWithCreditCard,
} from 'calypso/lib/purchases';
import { addPaymentMethod, changePaymentMethod, addNewPaymentMethod } from './paths';
import type { Purchase } from 'calypso/lib/purchases/types';

export function isDataLoading( props: {
	hasLoadedSites: boolean;
	hasLoadedUserPurchasesFromServer: boolean;
} ): boolean {
	return ! props.hasLoadedSites || ! props.hasLoadedUserPurchasesFromServer;
}

export function canEditPaymentDetails( purchase: Purchase ): boolean {
	return (
		! isExpired( purchase ) &&
		! isOneTimePurchase( purchase ) &&
		! isIncludedWithPlan( purchase ) &&
		! isDomainTransfer( purchase ) &&
		( ! is100Year( purchase ) || isCloseToExpiration( purchase ) )
	);
}

export function getChangePaymentMethodPath( siteSlug: string, purchase: Purchase ): string {
	if ( isPaidWithCreditCard( purchase ) && purchase.payment.creditCard ) {
		return changePaymentMethod( siteSlug, purchase.id, purchase.payment.creditCard.id );
	}

	return addPaymentMethod( siteSlug, purchase.id );
}

export function getAddNewPaymentMethodPath(): string {
	return addNewPaymentMethod;
}

export function getTemporarySiteType( purchase: Purchase ): string | null {
	const { productType } = purchase;
	return purchase.isAttachedToHoldingSite ? productType : null;
}

export function isAkismetTemporarySitePurchase( purchase: Purchase ): boolean {
	const { productType } = purchase;
	return purchase.isAttachedToHoldingSite && productType === 'akismet';
}

export function isMarketplaceTemporarySitePurchase( purchase: Purchase ): boolean {
	const { productType } = purchase;
	return purchase.isAttachedToHoldingSite && productType === 'saas_plugin';
}

export function isJetpackTemporarySitePurchase( purchase: Purchase ): boolean {
	const { productType } = purchase;
	return purchase.isAttachedToHoldingSite && productType === 'jetpack';
}

export function isA4ATemporarySitePurchase( purchase: Purchase ): boolean {
	return purchase.isAttachedToHoldingSite && isA4ABillingDragonPurchase( purchase );
}

export function isA4ABillingDragonPurchase( purchase: Purchase ): boolean {
	return purchase.meta === 'is-a4a';
}

export function getCancelPurchaseSurveyCompletedPreferenceKey(
	purchaseId: string | number
): string {
	return `cancel-purchase-survey-completed-${ purchaseId }`;
}
