/**
 * Internal dependencies
 */
import { addCardDetails, editCardDetails, addPaymentMethod, editPaymentMethod } from './paths';
import {
	isExpired,
	isIncludedWithPlan,
	isOneTimePurchase,
	isPaidWithCreditCard,
} from 'calypso/lib/purchases';
import { isDomainTransfer } from 'calypso/lib/products-values';
import { isEnabled } from 'calypso/config';

function isDataLoading( props ) {
	return ! props.hasLoadedSites || ! props.hasLoadedUserPurchasesFromServer;
}

function canEditPaymentDetails( purchase ) {
	return (
		! isExpired( purchase ) &&
		! isOneTimePurchase( purchase ) &&
		! isIncludedWithPlan( purchase ) &&
		! isDomainTransfer( purchase )
	);
}

function getEditCardDetailsPath( siteSlug, purchase ) {
	if ( isPaidWithCreditCard( purchase ) ) {
		const {
			payment: { creditCard },
		} = purchase;

		if ( isEnabled( 'purchases/new-payment-methods' ) ) {
			return editPaymentMethod( siteSlug, purchase.id, creditCard.id );
		}

		return editCardDetails( siteSlug, purchase.id, creditCard.id );
	}

	if ( isEnabled( 'purchases/new-payment-methods' ) ) {
		return addPaymentMethod( siteSlug, purchase.id );
	}

	return addCardDetails( siteSlug, purchase.id );
}

export { canEditPaymentDetails, getEditCardDetailsPath, isDataLoading };
