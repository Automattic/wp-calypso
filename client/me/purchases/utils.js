/**
 * Internal dependencies
 */
import {
	addCardDetails,
	editCardDetails,
	addCreditCard,
	addPaymentMethod,
	changePaymentMethod,
	addNewPaymentMethod,
} from './paths';
import {
	isExpired,
	isIncludedWithPlan,
	isOneTimePurchase,
	isPaidWithCreditCard,
} from 'calypso/lib/purchases';
import { isDomainTransfer } from '@automattic/calypso-products';
import { isEnabled } from '@automattic/calypso-config';

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

function getChangePaymentMethodPath( siteSlug, purchase ) {
	if ( isPaidWithCreditCard( purchase ) ) {
		const {
			payment: { creditCard },
		} = purchase;

		if ( isEnabled( 'purchases/new-payment-methods' ) ) {
			return changePaymentMethod( siteSlug, purchase.id, creditCard.id );
		}

		return editCardDetails( siteSlug, purchase.id, creditCard.id );
	}

	if ( isEnabled( 'purchases/new-payment-methods' ) ) {
		return addPaymentMethod( siteSlug, purchase.id );
	}

	return addCardDetails( siteSlug, purchase.id );
}

function getAddNewPaymentMethodPath() {
	return isEnabled( 'purchases/new-payment-methods' ) ? addNewPaymentMethod : addCreditCard;
}

export {
	canEditPaymentDetails,
	getChangePaymentMethodPath,
	getAddNewPaymentMethodPath,
	isDataLoading,
};
