import page from '@automattic/calypso-router';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import Notice from 'calypso/components/notice';
import { getRefundNoticeCopy } from 'calypso/dashboard/me/billing-purchases/cancel-purchase/get-confirmation-copy';
import { toPurchaseForCopy } from './to-purchase-for-copy';
import type { Purchases } from '@automattic/data-stores';

interface RefundEligibilityNoticeBaseProps {
	refundAmount: string;
	purchase: Purchases.Purchase;
}

interface RefundEligibilityNoticeRefundEligibilityProps extends RefundEligibilityNoticeBaseProps {
	mode?: 'refund-eligibility';
}

interface RefundEligibilityNoticeConfirmedProps extends RefundEligibilityNoticeBaseProps {
	mode: 'confirmed';
}

type RefundEligibilityNoticeProps =
	| RefundEligibilityNoticeRefundEligibilityProps
	| RefundEligibilityNoticeConfirmedProps;

const RefundEligibilityNotice = ( props: RefundEligibilityNoticeProps ) => {
	const translate = useTranslate();

	if ( props.mode === 'confirmed' ) {
		return (
			<Notice className="cancel-purchase__refund-eligibility-notice" showDismiss={ false }>
				<p className="cancel-purchase__refund-eligibility-text">
					{ getRefundNoticeCopy( {
						purchase: toPurchaseForCopy( props.purchase ),
						refundAmount: props.refundAmount,
					} ) }
				</p>
			</Notice>
		);
	}

	const onRemoveClick = () => {
		page( `${ window.location.pathname }?intent=remove` );
	};

	return (
		<Notice className="cancel-purchase__refund-eligibility-notice" showDismiss={ false }>
			<p className="cancel-purchase__refund-eligibility-text">
				{ translate(
					"You're eligible for a %(refundText)s refund if you remove it now. Your access will end right away.",
					{
						args: { refundText: props.refundAmount },
						context: 'refundText is a monetary amount in the form "[currency-symbol][amount]"',
					}
				) }{ ' ' }
				<Button
					variant="link"
					className="cancel-purchase__refund-eligibility-link"
					onClick={ onRemoveClick }
				>
					{ translate( 'Remove and claim refund.' ) }
				</Button>
			</p>
		</Notice>
	);
};

export default RefundEligibilityNotice;
