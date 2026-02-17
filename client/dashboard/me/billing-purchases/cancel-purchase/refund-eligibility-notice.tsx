import { Button } from '@wordpress/components';
import { sprintf, __ } from '@wordpress/i18n';
import Notice from '../../../components/notice';
import { hasAmountAvailableToRefund, isDotcomPlan } from '../../../utils/purchase';
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
	// Only show for refundable WordPress.com plans
	if (
		! hasAmountAvailableToRefund( purchase ) ||
		! isDotcomPlan( purchase ) ||
		! purchase.is_plan
	) {
		return null;
	}

	const refundAmount = RefundAmountString( {
		purchase,
		cancelBundledDomain: false,
		includedDomainPurchase: undefined,
	} );

	if ( ! refundAmount ) {
		return null;
	}

	return (
		<Notice variant="info">
			{ sprintf(
				/* translators: %(refundAmount)s is a monetary amount in the form "[currency-symbol][amount]" */
				__(
					"You're eligible for a %(refundAmount)s refund if you remove your plan now. Your features will be unavailable right away."
				),
				{
					refundAmount,
				}
			) }{ ' ' }
			<Button variant="link" isDestructive onClick={ onClaimRefund }>
				{ __( 'Remove plan and claim refund' ) }
			</Button>
		</Notice>
	);
}
