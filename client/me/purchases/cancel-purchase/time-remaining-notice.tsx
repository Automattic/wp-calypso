import moment from 'moment';
import Notice from 'calypso/components/notice';
import {
	getTopNoticeCopy,
	type PurchaseForCopy,
} from 'calypso/dashboard/me/billing-purchases/cancel-purchase/get-confirmation-copy';
import { isPartnerPurchase } from 'calypso/lib/purchases';
import { toPurchaseForCopy } from './to-purchase-for-copy';
import type { Purchases } from '@automattic/data-stores';
import type { CancelIntent, DisplayVariant } from 'calypso/lib/purchases/utils';

interface TimeRemainingNoticeProps {
	purchase: Purchases.Purchase;
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
	if ( displayVariant === 'remove' ) {
		return null;
	}
	if ( isPartnerPurchase( purchase ) || ! purchase.expiryDate ) {
		return null;
	}
	if ( moment( purchase.expiryDate ).isSameOrBefore( moment(), 'day' ) ) {
		return null;
	}

	const copy = getTopNoticeCopy( {
		purchase: toPurchaseForCopy( purchase ),
		intent: intent ?? 'cancel',
		additionalPurchases,
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
