import { CANCEL_FLOW_TYPE } from 'calypso/components/marketing-survey/cancel-purchase-form/constants';
import { hasAmountAvailableToRefund, isRefundable } from 'calypso/lib/purchases';
import type { Purchase } from './types';

/**
 * Finds a purchase by the slug of its associated product.
 * @param {Purchase[]} purchases List of purchases to search in
 * @param {string} slug Product slug
 * @returns {Purchase} Found purchase, if any
 */
export function getPurchaseByProductSlug(
	purchases: Purchase[],
	slug: string
): Purchase | undefined {
	return purchases.find( ( purchase ) => purchase.productSlug === slug );
}

/**
 * Returns the purchase cancellation flow.
 * @param {Purchase} purchase The purchase object
 */
export function getPurchaseCancellationFlowType( purchase: Purchase ): string {
	const isPlanRefundable = isRefundable( purchase );
	const isPlanAutoRenewing = purchase?.isAutoRenewEnabled ?? false;

	if ( isPlanRefundable && hasAmountAvailableToRefund( purchase ) ) {
		// If the subscription is refundable the subscription should be removed immediately.
		return CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND;
	} else if ( ! isPlanRefundable && isPlanAutoRenewing ) {
		// If the subscription is not refundable and auto-renew is on turn off auto-renew.
		return CANCEL_FLOW_TYPE.CANCEL_AUTORENEW;
	}

	// If the subscription is not refundable and auto-renew is off subscription should be removed immediately.
	return CANCEL_FLOW_TYPE.REMOVE;
}
