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
	const date = new Date( transaction.date );

	return (
		<Card className="content">
			<div className="header">
				<div className="branding">
					<img src={ transaction.icon } alt={ transaction.service } className="logo" />
					<div className="company">
						<h2>{ transaction.service }</h2>
						<span className="org">{ transaction.org }</span>
						<address className="address">{ transaction.address }</address>
					</div>
				</div>
				<div className="meta">
					<time className="date" dateTime={ date.toISOString() }>
						{ formatDisplayDate( date ) }
					</time>
				</div>
			</div>

			<div className="body">
				<div className="details-section">
					<div className="label">{ translate( 'Receipt id' ) }</div>
					<div className="receipt-id-value">{ transaction.id }</div>

					<PaymentDetails transaction={ transaction } />

					<div className="billing-details" data-is-empty={ isEmpty }>
						<label className="label" htmlFor="billing-details">
							{ translate( 'Billing details' ) }
						</label>
						<textarea
							id="billing-details"
							className="billing-details-input"
							value={ billingDetails }
							onChange={ ( e ) => setBillingDetails( e.target.value ) }
							placeholder={ translate(
								'Use this field to add your billing information (e.g. business address) before printing.'
							) }
						/>
					</div>
				</div>

				<table className="items">
					<thead>
						<tr>
							<th>{ translate( 'Description' ) }</th>
							<th className="amount">{ translate( 'Amount' ) }</th>
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
