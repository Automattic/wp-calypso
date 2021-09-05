import { isEnabled } from '@automattic/calypso-config';
import { isDomainTransfer } from '@automattic/calypso-products';
import {
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
		! isDomainTransfer( purchase )
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

function isJetpackTemporarySitePurchase( domain ) {
	return 'siteless.jetpack.com' === domain && isEnabled( 'jetpack/siteless-checkout' );
}

export {
	canEditPaymentDetails,
	getChangePaymentMethodPath,
	getAddNewPaymentMethodPath,
	isDataLoading,
	isJetpackTemporarySitePurchase,
};
