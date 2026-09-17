import { addNewPaymentMethod } from './paths';
import type { Purchase } from 'calypso/lib/purchases/types';

export function isDataLoading( props: {
	hasLoadedSites: boolean;
	hasLoadedUserPurchasesFromServer: boolean;
} ): boolean {
	return ! props.hasLoadedSites || ! props.hasLoadedUserPurchasesFromServer;
}

export function getAddNewPaymentMethodPath(): string {
	return addNewPaymentMethod;
}

export function isAkismetHoldingSitePurchase( purchase: Purchase ): boolean {
	const { productType } = purchase;
	return purchase.isAttachedToHoldingSite && productType === 'akismet';
}

export function isMarketplaceHoldingSitePurchase( purchase: Purchase ): boolean {
	const { productType } = purchase;
	return purchase.isAttachedToHoldingSite && productType === 'saas_plugin';
}

export function isA4AHoldingSitePurchase( purchase: Purchase ): boolean {
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
