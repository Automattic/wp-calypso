import { isWpComPlan } from '@automattic/calypso-products';
import { ReceiptPurchase } from 'calypso/state/receipts/types';
import { CheckoutThankYouCombinedProps, getFailedPurchases, getPurchases } from '..';
import { isBulkDomainTransfer } from '../utils';

/**
 * Determines whether the current checkout flow is for a redesign V2 purchase.
 * Used for gradually rolling out the redesign.
 *
 * @returns {boolean} True if the checkout flow is for a redesign V2 purchase, false otherwise.
 */
export const isRedesignV2 = ( props: CheckoutThankYouCombinedProps ) => {
	// Fallback to old design when there is a failed purchase.
	const failedPurchases = getFailedPurchases( props );
	if ( failedPurchases.length > 0 ) {
		return false;
	}

	const purchases = getPurchases( props );

	// We are in the bulk domain transfer flow.
	if ( isBulkDomainTransfer( purchases ) ) {
		return true;
	}

	// ThankYou page for only purchasing a plan.
	if ( purchases.length === 1 ) {
		return isWpComPlan( purchases[ 0 ].productSlug );
	}
	return false;
};

export function shouldShowConfettiExplosion( purchases: ReceiptPurchase[] ) {
	if ( isBulkDomainTransfer( purchases ) ) {
		return true;
	}

	return true;
}
