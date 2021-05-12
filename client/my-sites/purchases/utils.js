/**
 * Internal dependencies
 */
import { getAddPaymentMethodUrlFor, getChangePaymentMethodUrlFor } from './paths';
import { isPaidWithCreditCard } from 'calypso/lib/purchases';

export function getChangeOrAddPaymentMethodUrlFor( siteSlug, purchase ) {
	if ( isPaidWithCreditCard( purchase ) ) {
		const {
			payment: { creditCard },
		} = purchase;

		return getChangePaymentMethodUrlFor( siteSlug, purchase.id, creditCard.id );
	}
	return getAddPaymentMethodUrlFor( siteSlug, purchase.id );
}
