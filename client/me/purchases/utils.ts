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

export function canEditPaymentDetails( purchase: Purchase ) {
	return (
		! isExpired( purchase ) &&
		! isOneTimePurchase( purchase ) &&
		! isIncludedWithPlan( purchase ) &&
		! isDomainTransfer( purchase ) &&
		( ! is100Year( purchase ) || isCloseToExpiration( purchase ) )
	);
}

export function getChangePaymentMethodPath( siteSlug: string, purchase: Purchase ) {
	if ( isPaidWithCreditCard( purchase ) && purchase.payment.creditCard ) {
		return changePaymentMethod( siteSlug, purchase.id, purchase.payment.creditCard.id );
	}

	return addPaymentMethod( siteSlug, purchase.id );
}

export function getAddNewPaymentMethodPath() {
	return addNewPaymentMethod;
}

export function isTemporarySitePurchase( purchase: Purchase ) {
	const { domain } = purchase;
	// Currently only Jeypack, Akismet and some Marketplace products allow siteless/userless(license-based) purchases which require a temporary
	// site(s) to work. This function may need to be updated in the future as additional products types
	// incorporate siteless/userless(licensebased) product based purchases..
	return /^siteless.(jetpack|akismet|marketplace.wp).com$/.test( domain );
}

export function getTemporarySiteType( purchase: Purchase ) {
	const { productType } = purchase;
	return isTemporarySitePurchase( purchase ) ? productType : null;
}

export function isAkismetTemporarySitePurchase( purchase: Purchase ) {
	const { productType } = purchase;
	return isTemporarySitePurchase( purchase ) && productType === 'akismet';
}

export function isMarketplaceTemporarySitePurchase( purchase: Purchase ) {
	const { productType } = purchase;
	return isTemporarySitePurchase( purchase ) && productType === 'saas_plugin';
}

export function isJetpackTemporarySitePurchase( purchase: Purchase ) {
	const { productType } = purchase;
	return isTemporarySitePurchase( purchase ) && productType === 'jetpack';
}

export function getCancelPurchaseSurveyCompletedPreferenceKey( purchaseId: string | number ) {
	return `cancel-purchase-survey-completed-${ purchaseId }`;
}
