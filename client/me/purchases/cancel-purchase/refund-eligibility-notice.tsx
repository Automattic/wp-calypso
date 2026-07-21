import page from '@automattic/calypso-router';
import { Button } from '@wordpress/components';
import Notice from 'calypso/components/notice';
import {
	getRefundEligibilityPromoCopy,
	getRefundNoticeCopy,
} from 'calypso/dashboard/me/billing-purchases/cancel-purchase/get-confirmation-copy';
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

	const { prompt, linkLabel } = getRefundEligibilityPromoCopy( {
		refundAmount: props.refundAmount,
	} );

	return (
		<Notice className="cancel-purchase__refund-eligibility-notice" showDismiss={ false }>
			<p className="cancel-purchase__refund-eligibility-text">
				{ prompt }{ ' ' }
				<Button
					variant="link"
					className="cancel-purchase__refund-eligibility-link"
					onClick={ onRemoveClick }
				>
					{ linkLabel }
				</Button>
			</p>
		</Notice>
	);
};

export default RefundEligibilityNotice;
