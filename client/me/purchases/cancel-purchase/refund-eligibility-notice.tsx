import { useTranslate } from 'i18n-calypso';
import Notice from 'calypso/components/notice';
import CancelPurchaseButton from './button';
import { getRefundNoticeCopy } from './get-confirmation-copy';
import type { CancelPurchaseButtonProps } from './button';
import type { Purchases } from '@automattic/data-stores';
import type moment from 'moment';

interface RefundEligibilityNoticePromoProps {
	refundAmount: string;
	mode?: 'promo';
	cancelButtonProps: CancelPurchaseButtonProps & { moment: typeof moment };
}

interface RefundEligibilityNoticeConfirmedProps {
	refundAmount: string;
	mode: 'confirmed';
	purchase: Purchases.Purchase;
	cancelButtonProps?: never;
}

type RefundEligibilityNoticeProps =
	| RefundEligibilityNoticePromoProps
	| RefundEligibilityNoticeConfirmedProps;

const RefundEligibilityNotice = ( props: RefundEligibilityNoticeProps ) => {
	const translate = useTranslate();

	if ( props.mode === 'confirmed' ) {
		return (
			<Notice className="cancel-purchase__refund-eligibility-notice" showDismiss={ false }>
				<p className="cancel-purchase__refund-eligibility-text">
					{ getRefundNoticeCopy( {
						purchase: props.purchase,
						refundAmount: props.refundAmount,
					} ) }
				</p>
			</Notice>
		);
	}

	return (
		<Notice className="cancel-purchase__refund-eligibility-notice" showDismiss={ false }>
			<p className="cancel-purchase__refund-eligibility-text">
				{ translate(
					"You're eligible for a %(refundText)s refund if you remove your plan now. Your features will be unavailable right away.",
					{
						args: { refundText: props.refundAmount },
						context: 'refundText is a monetary amount in the form "[currency-symbol][amount]"',
					}
				) }{ ' ' }
				<CancelPurchaseButton
					{ ...props.cancelButtonProps }
					textVariant="remove-plan-and-claim-refund"
					isLinkStyle
					isInline
					cancelIntentOverride="refund"
				/>
			</p>
		</Notice>
	);
};

export default RefundEligibilityNotice;
