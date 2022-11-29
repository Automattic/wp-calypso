import { hasAmountAvailableToRefund, isRefundable } from 'calypso/lib/purchases';
import { cancelPurchaseAsync, cancelAndRefundPurchaseAsync } from 'calypso/lib/purchases/actions';
import type { Purchase } from 'calypso/lib/purchases/types';

export interface PurchaseCancellationResponse {
	status: boolean;
	message: string;
}

export default async function cancelSubscriptionAsync(
	purchase: Purchase
): Promise< PurchaseCancellationResponse > {
	const isPlanRefundable = isRefundable( purchase );
	const isPlanAutoRenewing = purchase?.isAutoRenewEnabled ?? false;

	// If AutoRenew disable AutoRenew.
	if ( isPlanAutoRenewing ) {
		// If the subscription is not refundable and auto-renew is on turn off auto-renew.
		const disableAutoRenewResponse = await cancelPurchaseAsync( purchase.id );
		if ( disableAutoRenewResponse ) {
			return {
				status: true,
				message: 'auto-renew',
			};
		}

		return {
			status: false,
			message: 'auto-renew',
		};
	}

	// If refundable, cancel and refund.
	if ( isPlanRefundable && hasAmountAvailableToRefund( purchase ) ) {
		const data = {
			confirm: true,
			product_id: purchase.productId,
			blog_id: purchase.siteId,
		};

		try {
			const response = await cancelAndRefundPurchaseAsync( purchase.id, data );
			if ( response.status === 'completed' ) {
				return {
					status: true,
					message: 'cancel-and-refund',
				};
			}
		} catch ( error ) {
			return {
				status: false,
				message: 'cancel-and-refund',
			};
		}
	}

	return {
		status: false,
		message: 'remove-purchase',
	};
}
