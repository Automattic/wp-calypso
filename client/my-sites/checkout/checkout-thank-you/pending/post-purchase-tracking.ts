import {
	isPostPurchaseWpcomGoogleAdsEnabled,
	recordPostPurchaseTracking,
} from 'calypso/lib/analytics/ad-tracking/record-post-purchase';
import type { Receipt } from '@automattic/api-core';
import type { ResponseCart } from '@automattic/shopping-cart';
import type { RedirectInstructions } from 'calypso/my-sites/checkout/src/lib/pending-page';

export function recordCheckoutPendingPostPurchaseTracking( {
	redirectInstructions,
	receiptId,
	receipt,
	cart,
}: {
	redirectInstructions: RedirectInstructions;
	receiptId: number | undefined;
	receipt?: Receipt;
	cart?: ResponseCart;
} ): void {
	try {
		if (
			! receiptId ||
			redirectInstructions.isError ||
			redirectInstructions.isUnknown ||
			! isPostPurchaseWpcomGoogleAdsEnabled()
		) {
			return;
		}

		recordPostPurchaseTracking( {
			receiptId,
			receipt,
			cart,
			source: 'checkout-pending',
		} );
	} catch {
		// Tracking must not prevent the pending page from redirecting.
	}
}
