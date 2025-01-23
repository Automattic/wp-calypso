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
			<div className="receipt__payment-details-label">{ translate( 'PAYMENT METHOD' ) }</div>
			<div className="receipt__payment-details-content">
				{ transaction.cc_display_brand !== 'Not Stored' && (
					<div className="receipt__payment-brand">{ transaction.cc_display_brand }</div>
				) }
				{ transaction.cc_name !== 'Not Stored' && (
					<div className="receipt__payment-name">{ transaction.cc_name }</div>
				) }
				{ transaction.cc_num !== 'XXXX' && (
					<div className="receipt__payment-number">
						{ translate( 'Card ending in %s', { args: [ transaction.cc_num ] } ) }
					</div>
				) }
			</div>
		</div>
	);
}
