import { formatCurrency } from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import type { BillingTransaction } from 'calypso/state/billing-transactions/types';

interface ReceiptTotalProps {
	transaction: BillingTransaction;
}

export function ReceiptTotal( { transaction }: ReceiptTotalProps ) {
	const translate = useTranslate();

	return (
		<tr className="receipt__total">
			<td>{ translate( 'Total' ) }</td>
			<td className="receipt__amount">
				{ formatCurrency( transaction.amount_integer, transaction.currency, {
					isSmallestUnit: true,
					stripZeros: true,
				} ) }
			</td>
		</tr>
	);
}
