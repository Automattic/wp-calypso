import { hasAmountAvailableToRefund, isRefundable } from 'calypso/lib/purchases';
import { cancelPurchaseAsync, cancelAndRefundPurchaseAsync } from 'calypso/lib/purchases/actions';
import type { Purchase } from 'calypso/lib/purchases/types';

export interface CancellationResponse {
	status: boolean;
	message: string;
}

export default async function cancelSubscriptionAsync(
	purchase: Purchase /*,
	// purchaseListUrl: string */
): Promise< CancellationResponse > {
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
			const res = await cancelAndRefundPurchaseAsync( purchase.id, data );
			if ( res.status === 'completed' ) {
				return {
					status: true,
					message: 'cancel-and-refund',
				};
			}
		} catch ( err ) {
			return {
				status: true,
				message: 'cancel-and-refund',
			};
		}
	}

	return {
		status: false,
		message: '',
	};
}
