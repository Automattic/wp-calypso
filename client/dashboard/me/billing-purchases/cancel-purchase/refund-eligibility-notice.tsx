import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import Notice from '../../../components/notice';
import { hasAmountAvailableToRefund } from '../../../utils/purchase';
import { getRefundNoticeCopy } from './get-confirmation-copy';
import RefundAmountString from './refund-amount-string';
import { useShowRefundEligibilityNotice } from './use-show-refund-eligibility-notice';
import type { Purchase } from '@automattic/api-core';

interface RefundEligibilityNoticePromoProps {
	purchase: Purchase;
	mode?: 'promo';
	onClaimRefund: () => void;
}

interface RefundEligibilityNoticeConfirmedProps {
	purchase: Purchase;
	mode: 'confirmed';
	onClaimRefund?: never;
}

type RefundEligibilityNoticeProps =
	| RefundEligibilityNoticePromoProps
	| RefundEligibilityNoticeConfirmedProps;

export default function RefundEligibilityNotice( props: RefundEligibilityNoticeProps ) {
	const { purchase, mode = 'promo' } = props;
	const showRefundEligibilityNotice = useShowRefundEligibilityNotice( purchase );

	if ( ! hasAmountAvailableToRefund( purchase ) ) {
		return null;
	}

	if ( mode === 'confirmed' ) {
		// Shown on the Remove confirmation screen when a refund is available.
		// The user has already expressed remove intent at the button click — no CTA.
		const refundAmount = RefundAmountString( { purchase, cancelBundledDomain: false } );
		if ( ! refundAmount ) {
			return null;
		}
		return <Notice variant="info">{ getRefundNoticeCopy( { purchase, refundAmount } ) }</Notice>;
	}

	// Promo mode is gated by the ExPlat experiment — only shown to treatment arm
	// users on the flag-off single-button UI.
	if ( ! showRefundEligibilityNotice ) {
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
			<Button variant="link" onClick={ props.onClaimRefund }>
				{ __( 'Remove plan and claim refund' ) }
			</Button>
		</Notice>
	);
}
