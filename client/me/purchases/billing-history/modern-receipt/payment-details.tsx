import { useTranslate } from 'i18n-calypso';
import { hasValidPaymentDetails } from '../utils';
import type { BillingTransaction } from 'calypso/state/billing-transactions/types';

interface PaymentDetailsProps {
	transaction: BillingTransaction;
}

export function PaymentDetails( { transaction }: PaymentDetailsProps ) {
	const translate = useTranslate();

	if ( ! hasValidPaymentDetails( transaction ) ) {
		return null;
	}

	return (
		<div className="receipt__payment-details">
			<div className="receipt__label">{ translate( 'Payment method' ) }</div>
			<div className="receipt__payment-details-content">
				{ transaction.cc_display_brand !== 'Not Stored' && transaction.cc_num !== 'XXXX' && (
					<div className="receipt__payment-brand">
						{ translate( '%(cardType)s ending in %(cardNum)s', {
							args: {
								cardType: transaction.cc_display_brand ?? transaction.cc_type,
								cardNum: transaction.cc_num,
							},
						} ) }
					</div>
				) }
				{ transaction.cc_name !== 'Not Stored' && (
					<div className="receipt__payment-name">{ transaction.cc_name }</div>
				) }
			</div>
		</div>
	);
}
