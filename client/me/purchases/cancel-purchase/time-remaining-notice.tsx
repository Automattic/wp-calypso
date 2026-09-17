import moment from 'moment';
import Notice from 'calypso/components/notice';
import { getTopNoticeCopy } from 'calypso/dashboard/me/billing-purchases/cancel-purchase/get-confirmation-copy';
import { isPartnerPurchase } from 'calypso/dashboard/utils/purchase';
import type { Purchase } from '@automattic/api-core';
import type { CancelIntent, DisplayVariant } from 'calypso/dashboard/utils/purchase';

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
	if ( displayVariant === 'remove' ) {
		return null;
	}
	if ( isPartnerPurchase( purchase ) || ! purchase.expiry_date ) {
		return null;
	}
	if ( moment( purchase.expiry_date ).isSameOrBefore( moment(), 'day' ) ) {
		return null;
	}

	const copy = getTopNoticeCopy( {
		purchase,
		intent: intent ?? 'cancel',
	} );
	if ( ! copy ) {
		return null;
	}

	return (
		<Notice
			className="cancel-purchase__time-remaining-notice"
			showDismiss={ false }
			status="is-info"
		>
			{ copy }
		</Notice>
	);
}
