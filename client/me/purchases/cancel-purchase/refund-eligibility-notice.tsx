import { useTranslate } from 'i18n-calypso';
import Notice from 'calypso/components/notice';
import CancelPurchaseButton from './button';
import type { CancelPurchaseButtonProps } from './button';
import type moment from 'moment';

interface RefundEligibilityNoticeProps {
	refundAmount: string;
	cancelButtonProps: CancelPurchaseButtonProps & { moment: typeof moment };
	onRefundCancelInitiated: () => void;
}

const RefundEligibilityNotice = ( {
	refundAmount,
	cancelButtonProps,
	onRefundCancelInitiated,
}: RefundEligibilityNoticeProps ) => {
	const translate = useTranslate();

	return (
		<Notice className="cancel-purchase__refund-eligibility-notice" showDismiss={ false }>
			<p className="cancel-purchase__refund-eligibility-text">
				{ translate(
					"You're eligible for a %(refundText)s refund if you remove your plan now. Your features will be unavailable right away.",
					{
						args: { refundText: refundAmount },
						context: 'refundText is a monetary amount in the form "[currency-symbol][amount]"',
					}
				) }{ ' ' }
				<CancelPurchaseButton
					{ ...cancelButtonProps }
					textVariant="remove-plan-and-claim-refund"
					isLinkStyle
					isInline
					onCancelInitiated={ onRefundCancelInitiated }
				/>
			</p>
		</Notice>
	);
};

export default RefundEligibilityNotice;
