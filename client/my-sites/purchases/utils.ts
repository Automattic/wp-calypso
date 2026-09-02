import { getPurchasePayment, type Purchase } from '@automattic/api-core';
import { isPaidWithCreditCard } from 'calypso/me/purchases/lib/raw-purchase-helpers';
import { getAddPaymentMethodUrlFor, getChangePaymentMethodUrlFor } from './paths';

export function getChangeOrAddPaymentMethodUrlFor( siteSlug: string, purchase: Purchase ): string {
	const payment = getPurchasePayment( purchase );
	if ( isPaidWithCreditCard( purchase ) && payment.creditCard ) {
		return getChangePaymentMethodUrlFor( siteSlug, purchase.ID, payment.creditCard.id );
	}
	return getAddPaymentMethodUrlFor( siteSlug, purchase.ID );
}
