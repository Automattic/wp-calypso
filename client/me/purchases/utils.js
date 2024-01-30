import { isDomainTransfer, is100Year } from '@automattic/calypso-products';
import {
	isCloseToExpiration,
	isExpired,
	isIncludedWithPlan,
	isOneTimePurchase,
	isPaidWithCreditCard,
} from 'calypso/lib/purchases';
import { addPaymentMethod, changePaymentMethod, addNewPaymentMethod } from './paths';

function isDataLoading( props ) {
	return ! props.hasLoadedSites || ! props.hasLoadedUserPurchasesFromServer;
}

function canEditPaymentDetails( purchase ) {
	return (
		! isExpired( purchase ) &&
		! isOneTimePurchase( purchase ) &&
		! isIncludedWithPlan( purchase ) &&
		! isDomainTransfer( purchase ) &&
		( ! is100Year( purchase ) || isCloseToExpiration( purchase ) )
	);
}

function getChangePaymentMethodPath( siteSlug, purchase ) {
	if ( isPaidWithCreditCard( purchase ) ) {
		const {
			payment: { creditCard },
		} = purchase;

		return changePaymentMethod( siteSlug, purchase.id, creditCard.id );
	}

	return addPaymentMethod( siteSlug, purchase.id );
}

function getAddNewPaymentMethodPath() {
	return addNewPaymentMethod;
}

function isTemporarySitePurchase( purchase ) {
	const { domain } = purchase;
	// Currently only Jeypack, Akismet and some Marketplace products allow siteless/userless(license-based) purchases which require a temporary
	// site(s) to work. This function may need to be updated in the future as additional products types
	// incorporate siteless/userless(licensebased) product based purchases..
	return /^siteless.(jetpack|akismet|marketplace.wp).com$/.test( domain );
}

function getTemporarySiteType( purchase ) {
	const { productType } = purchase;
	return isTemporarySitePurchase( purchase ) ? productType : null;
}

function isAkismetTemporarySitePurchase( purchase ) {
	const { productType } = purchase;
	return isTemporarySitePurchase( purchase ) && productType === 'akismet';
}

function isMarketplaceTemporarySitePurchase( purchase ) {
	const { productType } = purchase;
	return isTemporarySitePurchase( purchase ) && productType === 'saas_plugin';
}

function isJetpackTemporarySitePurchase( purchase ) {
	const { productType } = purchase;
	return isTemporarySitePurchase( purchase ) && productType === 'jetpack';
}

export {
	canEditPaymentDetails,
	getChangePaymentMethodPath,
	getAddNewPaymentMethodPath,
	isDataLoading,
	isTemporarySitePurchase,
	getTemporarySiteType,
	isJetpackTemporarySitePurchase,
	isAkismetTemporarySitePurchase,
	isMarketplaceTemporarySitePurchase,
};
