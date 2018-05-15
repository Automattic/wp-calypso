/** @format */

/**
 * Internal dependencies
 */
import config from 'config';
import { addCardDetails, editCardDetails } from './paths';
import {
	isExpired,
	isIncludedWithPlan,
	isOneTimePurchase,
	isPaidWithCreditCard,
} from 'lib/purchases';
import { isDomainTransfer } from 'lib/products-values';

// TODO: Remove these property-masking functions in favor of accessing the props directly
function getPurchase( props ) {
	return props.selectedPurchase;
}

function isDataLoading( props ) {
	return ! props.hasLoadedSites || ! props.hasLoadedUserPurchasesFromServer;
}

function canEditPaymentDetails( purchase ) {
	if ( ! config.isEnabled( 'upgrades/credit-cards' ) ) {
		return false;
	}
	return (
		! isExpired( purchase ) &&
		! isOneTimePurchase( purchase ) &&
		! isIncludedWithPlan( purchase ) &&
		! isDomainTransfer( purchase )
	);
}

function getEditCardDetailsPath( siteSlug, purchase ) {
	if ( isPaidWithCreditCard( purchase ) ) {
		const { payment: { creditCard } } = purchase;

		return editCardDetails( siteSlug, purchase.id, creditCard.id );
	}
	return addCardDetails( siteSlug, purchase.id );
}

export { canEditPaymentDetails, getEditCardDetailsPath, getPurchase, isDataLoading };
