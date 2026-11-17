import { formatCurrency } from '@automattic/number-formatters';
import { hasAmountAvailableToRefund } from '../../../utils/purchase';
import type { Purchase } from '@automattic/api-core';

interface RefundAmountStringProps {
	purchase: Purchase;
	cancelBundledDomain: boolean;
	includedDomainPurchase?: Purchase;
}

export default function RefundAmountString( {
	purchase,
	cancelBundledDomain,
	includedDomainPurchase,
}: RefundAmountStringProps ): string | null {
	const {
		refund_integer: refundInteger,
		total_refund_integer: totalRefundInteger,
		total_refund_currency: totalRefundCurrency,
	} = purchase;

	if ( hasAmountAvailableToRefund( purchase ) ) {
		if ( cancelBundledDomain && includedDomainPurchase ) {
			return formatCurrency( totalRefundInteger, totalRefundCurrency, {
				isSmallestUnit: true,
			} );
		}
		return formatCurrency( refundInteger, totalRefundCurrency, {
			isSmallestUnit: true,
		} );
	}

	return null;
}
