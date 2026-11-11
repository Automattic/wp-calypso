import { recordOrder } from 'calypso/lib/analytics/ad-tracking';
import { costToUSD } from 'calypso/lib/analytics/utils';
import { gaRecordEvent } from './ga';
import { getReceiptTotal } from './utils/receipt-item-details';
import type { Receipt } from '@automattic/api-core';

export async function recordPurchase( receipt: Receipt ) {
	const total = getReceiptTotal( receipt );
	if ( total >= 0.01 ) {
		const usdValue = costToUSD( total, receipt.currency );

		// Google Analytics
		gaRecordEvent(
			'Purchase',
			'calypso_checkout_payment_success',
			'',
			usdValue ? usdValue : undefined
		);

		// Marketing
		await recordOrder( receipt );
	}
}
