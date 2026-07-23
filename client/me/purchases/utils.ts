import { isDomainTransfer, is100Year } from '@automattic/calypso-products';
import {
	isCloseToExpiration,
	isExpiredAndInGracePeriod,
	isExpiredOrRemoved,
	isIncludedWithPlan,
	isOneTimePurchase,
	isPaidWithCreditCard,
	isExpiredWithNoAutoRenewAttemptsLeft,
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
		// Normally a purchase past its expiry date can't have its payment details
		// edited. We make an exception while it's still in its grace period and its
		// auto-renewal-attempt window hasn't closed: adding/updating the stored card
		// lets it recover on a remaining attempt before it lapses. We gate on that
		// window rather than on auto-renew being enabled — mirroring how a
		// manual-renew purchase can still edit its card before expiry, since adding a
		// card is a valid step toward recovery (often the precursor to re-enabling
		// auto-renew). So auto-renew being off must NOT disqualify it.
		( ! isExpiredOrRemoved( purchase ) ||
			( isExpiredAndInGracePeriod( purchase ) &&
				! isExpiredWithNoAutoRenewAttemptsLeft( purchase ) ) ) &&
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

export function isAkismetHoldingSitePurchase( purchase: Purchase ): boolean {
	const { productType } = purchase;
	return purchase.isAttachedToHoldingSite && productType === 'akismet';
}

export function isMarketplaceHoldingSitePurchase( purchase: Purchase ): boolean {
	const { productType } = purchase;
	return purchase.isAttachedToHoldingSite && productType === 'saas_plugin';
}

export function isJetpackHoldingSitePurchase( purchase: Purchase ): boolean {
	const { productType } = purchase;
	return purchase.isAttachedToHoldingSite && productType === 'jetpack';
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
