import Notice from '../../../components/notice';
import { hasAmountAvailableToRefund } from '../../../utils/purchase';
import { getRefundNoticeCopy } from './get-confirmation-copy';
import RefundAmountString from './refund-amount-string';
import type { Purchase } from '@automattic/api-core';

interface RefundEligibilityNoticeProps {
	purchase: Purchase;
}

export default function RefundEligibilityNotice( { purchase }: RefundEligibilityNoticeProps ) {
	if ( ! hasAmountAvailableToRefund( purchase ) ) {
		return null;
	}

	const refundAmount = RefundAmountString( { purchase, cancelBundledDomain: false } );
	if ( ! refundAmount ) {
		return null;
	}

	return <Notice variant="info">{ getRefundNoticeCopy( { purchase, refundAmount } ) }</Notice>;
}
