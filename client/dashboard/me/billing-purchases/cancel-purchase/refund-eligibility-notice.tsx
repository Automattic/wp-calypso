import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import Notice from '../../../components/notice';
import {
	hasAmountAvailableToRefund,
	shouldShowRefundEligibilityNotice,
} from '../../../utils/purchase';
import RefundAmountString from './refund-amount-string';
import type { Purchase } from '@automattic/api-core';

interface RefundEligibilityNoticeProps {
	purchase: Purchase;
	onClaimRefund: () => void;
}

export default function RefundEligibilityNotice( {
	purchase,
	onClaimRefund,
}: RefundEligibilityNoticeProps ) {
	if (
		! shouldShowRefundEligibilityNotice( purchase ) ||
		! hasAmountAvailableToRefund( purchase )
	) {
		return null;
	}

	return (
		<Notice variant="info">
			{ createInterpolateElement(
				/* translators: <refundAmount /> is a monetary amount in the form "[currency-symbol][amount]" */
				__(
					"You're eligible for a <refundAmount /> refund if you remove your plan now. Your features will be unavailable right away."
				),
				{
					refundAmount: <RefundAmountString purchase={ purchase } cancelBundledDomain={ false } />,
				}
			) }{ ' ' }
			<Button variant="link" isDestructive onClick={ onClaimRefund }>
				{ __( 'Remove plan and claim refund' ) }
			</Button>
		</Notice>
	);
}
