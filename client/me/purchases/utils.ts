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

export function isTemporarySitePurchase( purchase: Purchase ): boolean {
	const { domain } = purchase;
	// Currently only Jetpack, Akismet, A4A, and some Marketplace products allow siteless/userless(license-based) purchases which require a temporary
	// site(s) to work. This function may need to be updated in the future as additional products types
	// incorporate siteless/userless(licensebased) product based purchases..
	return /^siteless\.(jetpack|akismet|marketplace\.wp|agencies\.automattic|a4a)\.com$/.test(
		domain
	);
}

export function getTemporarySiteType( purchase: Purchase ): string | null {
	const { productType } = purchase;
	return isTemporarySitePurchase( purchase ) ? productType : null;
}

/**
 * Checks if a domain string is a siteless domain for billing/receipts
 * Matches: siteless.marketplace.wp.com, siteless.agencies.automattic.com, siteless.a4a.com
 * (with or without paths)
 */
export function isSitelessDomainForBillingAndReceipts(
	domain: string | undefined | null
): boolean {
	if ( ! domain ) {
		return false;
	}
	return /^siteless\.(marketplace\.wp|agencies\.automattic|a4a)\.com/.test( domain );
}

export function isAkismetTemporarySitePurchase( purchase: Purchase ): boolean {
	const { productType } = purchase;
	return isTemporarySitePurchase( purchase ) && productType === 'akismet';
}

export function isMarketplaceTemporarySitePurchase( purchase: Purchase ): boolean {
	const { productType } = purchase;
	return isTemporarySitePurchase( purchase ) && productType === 'saas_plugin';
}

export function isJetpackTemporarySitePurchase( purchase: Purchase ): boolean {
	const { productType } = purchase;
	return isTemporarySitePurchase( purchase ) && productType === 'jetpack';
}

export function isA4ATemporarySitePurchase( purchase: Purchase ): boolean {
	const { meta } = purchase;
	return isTemporarySitePurchase( purchase ) && meta === 'is-a4a';
}

export function getCancelPurchaseSurveyCompletedPreferenceKey(
	purchaseId: string | number
): string {
	return `cancel-purchase-survey-completed-${ purchaseId }`;
}

/**
 * Checks if a domain is for an internal A4A agency site.
 * @param domain The domain to check
 * @returns True if the domain is an internal A4A agency domain
 */
export function isInternalA4AAgencyDomain( domain: string ): boolean {
	return domain?.endsWith( '.agencies.automattic.com' );
}
