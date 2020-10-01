/**
 * Internal dependencies
 */
import { getAddPaymentMethodUrlFor, editPaymentMethod } from './paths';
import { isPaidWithCreditCard } from 'lib/purchases';

function getEditPaymentMethodUrlFor( siteSlug, purchase ) {
	if ( isPaidWithCreditCard( purchase ) ) {
		const {
			payment: { creditCard },
		} = purchase;

		return editPaymentMethod( siteSlug, purchase.id, creditCard.id );
	}
	return getAddPaymentMethodUrlFor( siteSlug, purchase.id );
}

export { getEditPaymentMethodUrlFor };
