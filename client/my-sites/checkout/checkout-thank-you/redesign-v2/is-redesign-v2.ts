import { isWpComPlan } from '@automattic/calypso-products';
import { CheckoutThankYouCombinedProps, getFailedPurchases, getPurchases } from '..';

/**
 * Determines whether the current checkout flow is for a redesign V2 purchase.
 * Used for gradually rolling out the redesign.
 *
 * @returns {boolean} True if the checkout flow is for a redesign V2 purchase, false otherwise.
 */
const isRedesignV2 = ( props: CheckoutThankYouCombinedProps ) => {
	// Fallback to old design when there is a failed purchase.
	const failedPurchases = getFailedPurchases( props );
	if ( failedPurchases.length > 0 ) {
		return false;
	}

	// ThankYou page for only purchasing a plan.
	const purchases = getPurchases( props );
	if ( purchases.length === 1 ) {
		return isWpComPlan( purchases[ 0 ].productSlug );
	}
	return false;
};
export default isRedesignV2;
