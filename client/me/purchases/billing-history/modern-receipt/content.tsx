import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { formatDisplayDate } from '../utils';
import { ReceiptLineItems } from './line-items';
import { PaymentDetails } from './payment-details';
import { ReceiptTotal } from './total';
import type { BillingTransaction } from 'calypso/state/billing-transactions/types';

interface ReceiptContentProps {
	transaction: BillingTransaction;
}

export function ReceiptContent( { transaction }: ReceiptContentProps ) {
	const translate = useTranslate();
	const [ billingDetails, setBillingDetails ] = useState( '' );
	const isEmpty = ! billingDetails.trim();

	return (
		<Card className="receipt__content">
			<div className="receipt__header">
				<div className="receipt__branding">
					<img src={ transaction.icon } alt={ transaction.service } className="receipt__logo" />
					<div className="receipt__company">
						<h2>{ transaction.service }</h2>
						<span className="receipt__org">{ transaction.org }</span>
						<span className="receipt__address">{ transaction.address }</span>
					</div>
				</div>
				<div className="receipt__meta">
					<div className="receipt__date">{ formatDisplayDate( new Date( transaction.date ) ) }</div>
				</div>
			</div>

			<div className="receipt__body">
				<div className="receipt__receipt-id-section">
					<div className="receipt__receipt-id-label">{ translate( 'RECEIPT ID' ) }</div>
					<div className="receipt__receipt-id-value">{ transaction.id }</div>
				</div>

				<PaymentDetails transaction={ transaction } />

				<div className="receipt__billing-details" data-is-empty={ isEmpty }>
					<div className="receipt__billing-details-label">{ translate( 'BILLING DETAILS' ) }</div>
					<textarea
						className="receipt__billing-details-input"
						placeholder={ translate(
							'Use this field to add your billing information (e.g. business address) before printing.'
						) }
						value={ billingDetails }
						onChange={ ( e ) => setBillingDetails( e.target.value ) }
					/>
				</div>

				<table className="receipt__items">
					<thead>
						<tr>
							<th>{ translate( 'Description' ) }</th>
							<th className="receipt__amount-column">{ translate( 'Amount' ) }</th>
						</tr>
					</thead>
					<tbody>
						<ReceiptLineItems transaction={ transaction } />
					</tbody>
					<tfoot>
						<ReceiptTotal transaction={ transaction } />
					</tfoot>
				</table>
			</div>
		</Card>
	);
}
