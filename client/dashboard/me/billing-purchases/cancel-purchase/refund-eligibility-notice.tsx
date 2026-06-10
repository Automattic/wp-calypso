import { Link } from '@tanstack/react-router';
import { __, sprintf } from '@wordpress/i18n';
import { cancelPurchaseRoute } from '../../../app/router/me';
import Notice from '../../../components/notice';
import { hasAmountAvailableToRefund } from '../../../utils/purchase';
import { getRefundNoticeCopy } from './get-confirmation-copy';
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
		return (
			<Notice
				variant="info"
				actions={
					<Link
						to={ cancelPurchaseRoute.fullPath }
						params={ { purchaseId: String( purchase.ID ) } }
						search={ { intent: 'remove' as const } }
					>
						{ __( 'Remove plan and claim refund.' ) }
					</Link>
				}
			>
				{ sprintf(
					/* translators: %(refundAmount)s is a monetary amount, e.g. "$96.00" */
					__(
						'You’re eligible for a %(refundAmount)s refund if you remove your plan now. Your features will be unavailable right away.'
					),
					{ refundAmount }
				) }
			</Notice>
		);
	}

	return <Notice variant="info">{ getRefundNoticeCopy( { purchase, refundAmount } ) }</Notice>;
}
