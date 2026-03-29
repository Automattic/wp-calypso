import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { intlFormat, isToday, isBefore } from 'date-fns';
import Notice from '../../../components/notice';
import {
	isPartnerPurchase,
	getPurchaseCancellationFlowType,
	CANCEL_FLOW_TYPE,
} from '../../../utils/purchase';
import type { Purchase } from '@automattic/api-core';

interface TimeRemainingNoticeProps {
	purchase: Purchase;
}

export default function TimeRemainingNotice( { purchase }: TimeRemainingNoticeProps ) {
	// returns early if there's no product or accounting for the edge case that the plan expires today (or somehow already expired)
	// in this case, do not show the time remaining for the plan
	const purchaseExpiryDate = new Date( purchase.expiry_date );
	const now = new Date();
	if ( isToday( purchaseExpiryDate ) || isBefore( purchaseExpiryDate, now ) ) {
		return null;
	}

	// If the plan is being immediately removed (refund or explicit removal), don't show
	// "available until [date]" — the plan won't be available, it's being removed now.
	const flowType = getPurchaseCancellationFlowType( purchase );
	if ( flowType === CANCEL_FLOW_TYPE.CANCEL_WITH_REFUND || flowType === CANCEL_FLOW_TYPE.REMOVE ) {
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
				/* translators: %(expire)s is the date the product will expire */
				__( 'Your plan features will be available until %(expiry)s.' ),
				{
					expiry: intlFormat( purchase.expiry_date, { dateStyle: 'medium' }, { locale: 'en-US' } ),
					productName: purchase.product_name,
				}
			) }
		</Notice>
	);
}
