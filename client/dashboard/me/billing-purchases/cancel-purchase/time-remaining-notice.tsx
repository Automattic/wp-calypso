import { isToday, isBefore } from 'date-fns';
import Notice from '../../../components/notice';
import { isPartnerPurchase, DisplayVariant, CancelIntent } from '../../../utils/purchase';
import { getTopNoticeCopy } from './get-confirmation-copy';
import type { PurchaseForCopy } from './get-confirmation-copy';
import type { Purchase } from '@automattic/api-core';

interface TimeRemainingNoticeProps {
	purchase: Purchase;
	displayVariant: DisplayVariant;
	intent: CancelIntent | null;
	additionalPurchases?: PurchaseForCopy[];
}

export default function TimeRemainingNotice( {
	purchase,
	displayVariant,
	intent,
	additionalPurchases,
}: TimeRemainingNoticeProps ) {
	// Remove screen: the product is going away immediately — no "active until"
	// statement applies. A separate RefundEligibilityNotice handles the refund case.
	if ( displayVariant === 'remove' ) {
		return null;
	}

	// For multi-purchase, skip the partner/expiry early-returns — additional
	// purchases may have their own valid expiry dates.
	if ( ! additionalPurchases?.length ) {
		// Partner-managed purchases don't really expire from the user's perspective.
		// No notice to render.
		if ( isPartnerPurchase( purchase ) || ! purchase.expiry_date ) {
			return null;
		}

		// Don't show for a purchase that's already expired or expires today.
		const purchaseExpiryDate = new Date( purchase.expiry_date );
		const now = new Date();
		if ( isToday( purchaseExpiryDate ) || isBefore( purchaseExpiryDate, now ) ) {
			return null;
		}
	}

	const copy = getTopNoticeCopy( { purchase, intent: intent ?? 'cancel', additionalPurchases } );
	if ( ! copy ) {
		return null;
	}

	return <Notice>{ copy }</Notice>;
}
