import { intlFormat, isToday, isBefore } from 'date-fns';
import Notice from '../../../components/notice';
import { isPartnerPurchase, DisplayVariant, CancelIntent } from '../../../utils/purchase';
import { getTopNoticeCopy } from './get-confirmation-copy';
import type { Purchase } from '@automattic/api-core';

interface TimeRemainingNoticeProps {
	purchase: Purchase;
	displayVariant: DisplayVariant;
	intent: CancelIntent | null;
}

export default function TimeRemainingNotice( {
	purchase,
	displayVariant,
	intent,
}: TimeRemainingNoticeProps ) {
	// Remove screen: the product is going away immediately — no "active until"
	// statement applies. A separate RefundEligibilityNotice handles the refund case.
	if ( displayVariant === 'remove' ) {
		return null;
	}

	// Partner-managed purchases don't really expire from the user's perspective.
	// No notice to render.
	if ( isPartnerPurchase( purchase ) || ! purchase.expiry_date ) {
		return null;
	}

	// Don't show "active until" for a purchase that's already expired or expires today.
	const purchaseExpiryDate = new Date( purchase.expiry_date );
	const now = new Date();
	if ( isToday( purchaseExpiryDate ) || isBefore( purchaseExpiryDate, now ) ) {
		return null;
	}

	const expiryDateFormatted = intlFormat(
		purchase.expiry_date,
		{ dateStyle: 'medium' },
		{ locale: 'en-US' }
	);

	const copy = getTopNoticeCopy( {
		purchase,
		intent: intent ?? 'cancel',
		expiryDateFormatted,
	} );

	if ( ! copy ) {
		return null;
	}

	return <Notice>{ copy }</Notice>;
}
