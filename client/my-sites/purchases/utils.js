/**
 * Internal dependencies
 */
import { getAddPaymentMethodUrlFor, getEditPaymentMethodUrlFor } from './paths';
import { isPaidWithCreditCard } from 'calypso/lib/purchases';

export function getEditOrAddPaymentMethodUrlFor( siteSlug, purchase ) {
	if ( isPaidWithCreditCard( purchase ) ) {
		const {
			payment: { creditCard },
		} = purchase;

		return getEditPaymentMethodUrlFor( siteSlug, purchase.id, creditCard.id );
	}
	return getAddPaymentMethodUrlFor( siteSlug, purchase.id );
}
