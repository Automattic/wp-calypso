import moment from 'moment';
import Notice from 'calypso/components/notice';
import { isPartnerPurchase } from 'calypso/lib/purchases';
import { getTopNoticeCopy } from './get-confirmation-copy';
import type { Purchases } from '@automattic/data-stores';
import type { CancelIntent, DisplayVariant } from 'calypso/lib/purchases/utils';

interface TimeRemainingNoticeProps {
	purchase: Purchases.Purchase;
	displayVariant: DisplayVariant;
	intent: CancelIntent | null;
}

export default function TimeRemainingNotice( {
	purchase,
	displayVariant,
	intent,
}: TimeRemainingNoticeProps ) {
	// Suppress on Remove variant — the product is going away immediately.
	if ( displayVariant === 'remove' ) {
		return null;
	}

	// Partner-managed or no expiry date → nothing meaningful to say.
	if ( isPartnerPurchase( purchase ) || ! purchase.expiryDate ) {
		return null;
	}

	// Suppress if already expired or expiring today.
	const expiry = moment( purchase.expiryDate );
	if ( expiry.isSameOrBefore( moment(), 'day' ) ) {
		return null;
	}

	const copy = getTopNoticeCopy( {
		purchase,
		intent: intent ?? 'cancel',
		expiryDateFormatted: expiry.format( 'LL' ),
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
