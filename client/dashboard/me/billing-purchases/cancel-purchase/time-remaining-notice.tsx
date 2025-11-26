import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { formatDistanceToNow, intervalToDuration } from 'date-fns';
import Notice from '../../../components/notice';
import { isPartnerPurchase } from '../../../utils/purchase';
import type { Purchase } from '@automattic/api-core';

interface TimeRemainingNoticeProps {
	purchase: Purchase;
}

const getTimeRemainingForSubscription = ( purchase: Purchase ) => {
	const purchaseExpiryDate = new Date( purchase.expiry_date );
	return intervalToDuration( { start: new Date(), end: purchaseExpiryDate } );
};

export default function TimeRemainingNotice( { purchase }: TimeRemainingNoticeProps ) {
	// returns early if there's no product or accounting for the edge case that the plan expires today (or somehow already expired)
	// in this case, do not show the time remaining for the plan
	const timeRemaining = getTimeRemainingForSubscription( purchase );
	if ( timeRemaining && ( timeRemaining?.days ?? 0 ) <= 1 ) {
		return null;
	}

	// if this product/ plan is partner managed, it won't really "expire" from the user's perspective
	if ( isPartnerPurchase( purchase ) || ! purchase.expiry_date ) {
		return (
			<Notice>
				{ createInterpolateElement(
					sprintf(
						/* translators: %(productName)s is the name of the product */
						__( 'Your <strong> %(productName)s </strong> subscription is still active. <br/>' ),
						{ productName: purchase.product_name }
					),
					{
						strong: <strong />,
						br: <br />,
					}
				) }
			</Notice>
		);
	}

	// show how much time is left on the plan
	return (
		<Notice>
			{ sprintf(
				/* translators: 'timeRemaining' is localized string like "2 months" or "1 year". */
				__( 'Your plan features will be available for another %(timeRemaining)s.' ),
				{
					timeRemaining: formatDistanceToNow( new Date( purchase.expiry_date ) ),
					productName: purchase.product_name,
				}
			) }
		</Notice>
	);
}
