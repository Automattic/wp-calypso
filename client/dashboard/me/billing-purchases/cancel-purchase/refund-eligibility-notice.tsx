import { Link } from '@tanstack/react-router';
import { cancelPurchaseRoute } from '../../../app/router/me';
import Notice from '../../../components/notice';
import { hasAmountAvailableToRefund } from '../../../utils/purchase';
import { getRefundEligibilityPromoCopy, getRefundNoticeCopy } from './get-confirmation-copy';
import RefundAmountString from './refund-amount-string';
import type { Purchase } from '@automattic/api-core';

type RefundEligibilityNoticeProps =
	| { mode?: 'confirmed'; purchase: Purchase }
	| { mode: 'refund-eligibility'; purchase: Purchase };

export default function RefundEligibilityNotice( props: RefundEligibilityNoticeProps ) {
	const { purchase } = props;

	if ( ! hasAmountAvailableToRefund( purchase ) ) {
		return null;
	}

	const refundAmount = RefundAmountString( { purchase, cancelBundledDomain: false } );
	if ( ! refundAmount ) {
		return null;
	}

	if ( props.mode === 'refund-eligibility' ) {
		const { prompt, linkLabel } = getRefundEligibilityPromoCopy( { refundAmount } );
		return (
			<Notice
				variant="info"
				actions={
					<Link
						to={ cancelPurchaseRoute.fullPath }
						params={ { purchaseId: String( purchase.ID ) } }
						search={ { intent: 'remove' as const } }
					>
						{ linkLabel }
					</Link>
				}
			>
				{ prompt }
			</Notice>
		);
	}

	return <Notice variant="info">{ getRefundNoticeCopy( { purchase, refundAmount } ) }</Notice>;
}
