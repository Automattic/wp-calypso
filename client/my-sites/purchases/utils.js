import { isPaidWithCreditCard } from 'calypso/lib/purchases';
import { getAddPaymentMethodUrlFor, getChangePaymentMethodUrlFor } from './paths';

export function getChangeOrAddPaymentMethodUrlFor( siteSlug, purchase ) {
	if ( isPaidWithCreditCard( purchase ) ) {
		const {
			payment: { creditCard },
		} = purchase;

		return getChangePaymentMethodUrlFor( siteSlug, purchase.id, creditCard.id );
	}
	return getAddPaymentMethodUrlFor( siteSlug, purchase.id );
}
