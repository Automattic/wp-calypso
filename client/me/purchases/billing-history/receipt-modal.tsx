import { FormLabel } from '@automattic/components';
import { formatCurrency } from '@automattic/format-currency';
import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState, useCallback } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import TextareaAutosize from 'calypso/components/textarea-autosize';
import { useTaxName } from 'calypso/my-sites/checkout/src/hooks/use-country-list';
import { useDispatch } from 'calypso/state';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { getTransactionTermLabel, transactionIncludesTax } from './utils';
import type { BillingTransaction } from 'calypso/state/billing-transactions/types';

import './style-modal.scss';

interface ReceiptModalProps {
	item: BillingTransaction;
	closeModal: () => void;
}

function ReceiptLabels( { hideDetailsLabelOnPrint }: { hideDetailsLabelOnPrint?: boolean } ) {
	const translate = useTranslate();

	const labelContent = translate(
		'Use this field to add your billing information (eg. business address) before printing.'
	);

	return (
		<div>
			<FormLabel
				htmlFor="billing-history__billing-details-textarea"
				className={ clsx( { 'receipt__no-print': hideDetailsLabelOnPrint } ) }
			>
				{ translate( 'Billing Details' ) }
			</FormLabel>
			<div
				className="billing-history__billing-details-description"
				id="billing-history__billing-details-description"
			>
				{ labelContent }
			</div>
		</div>
	);
}

function BillingDetails( { transaction }: { transaction: BillingTransaction } ) {
	const [ hideDetailsLabelOnPrint, setHideDetailsLabelOnPrint ] = useState( true );
	const onChange = useCallback(
		( e: React.ChangeEvent< HTMLTextAreaElement > ) => {
			const value = e.target.value.trim();
			if ( hideDetailsLabelOnPrint && value.length > 0 ) {
				setHideDetailsLabelOnPrint( false );
			} else if ( ! hideDetailsLabelOnPrint && value.length === 0 ) {
				setHideDetailsLabelOnPrint( true );
			}
		},
		[ hideDetailsLabelOnPrint, setHideDetailsLabelOnPrint ]
	);

	const defaultValue =
		transaction.cc_name === 'Not Stored' && transaction.cc_email === 'Not Stored'
			? ''
			: `${ transaction.cc_name !== 'Not Stored' ? transaction.cc_name || '' : '' }\n${
					transaction.cc_email !== 'Not Stored' ? transaction.cc_email || '' : ''
			  }`.trim();

	return (
		<li className="billing-history__billing-details">
			<ReceiptLabels hideDetailsLabelOnPrint={ hideDetailsLabelOnPrint } />
			<TextareaAutosize
				className="billing-history__billing-details-editable"
				aria-labelledby="billing-history__billing-details-description"
				id="billing-history__billing-details-textarea"
				rows={ 1 }
				defaultValue={ defaultValue }
				onChange={ onChange }
			/>
		</li>
	);
}

export default function ReceiptModal( { item }: ReceiptModalProps ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const taxName = useTaxName( item.tax_country_code );
	const reduxDispatch = useDispatch();

	const handlePrintClick = () => {
		reduxDispatch(
			recordGoogleEvent( 'Me', 'Clicked on Print Receipt Button in Billing History Receipt' )
		);
		window.print();
	};

	return (
		<div className="billing-history-receipt-modal">
			<div className="billing-history__app-overview">
				<img src={ item.icon } title={ item.service } alt={ item.service } />
				<h2>
					{ item.service }
					<small>
						{ translate( 'by %(organization)s', {
							args: { organization: item.org },
						} ) }
					</small>
					<small className="billing-history__organization-address">{ item.address }</small>
				</h2>
				<span className="billing-history__transaction-date">
					{ moment( item.date ).format( 'll' ) }
				</span>
			</div>

			<div className="billing-history__receipt-details">
				<div className="billing-history__receipt-detail">
					<strong>{ translate( 'Receipt ID' ) }</strong>
					<span>{ item.id }</span>
				</div>
				{ item.pay_ref && (
					<div className="billing-history__receipt-detail">
						<strong>{ translate( 'Transaction ID' ) }</strong>
						<span>{ item.pay_ref }</span>
					</div>
				) }
				<div className="billing-history__receipt-detail">
					<strong>{ translate( 'Payment Method' ) }</strong>
					<span>
						{ item.cc_type } { item.cc_num }
					</span>
				</div>
				<BillingDetails transaction={ item } />
			</div>

			<div className="billing-history__receipt">
				<h4>{ translate( 'Order summary' ) }</h4>
				<table className="billing-history__receipt-line-items">
					<thead>
						<tr>
							<th className="billing-history__receipt-desc">{ translate( 'Description' ) }</th>
							<th className="billing-history__receipt-amount">{ translate( 'Amount' ) }</th>
						</tr>
					</thead>
					<tbody>
						{ item.items.map( ( receiptItem ) => {
							const termLabel = getTransactionTermLabel( receiptItem, translate );
							return (
								<tr key={ receiptItem.id }>
									<td className="billing-history__receipt-item-name">
										<span>{ receiptItem.variation }</span>
										<small>({ receiptItem.type_localized })</small>
										{ termLabel && <em>{ termLabel }</em> }
										{ receiptItem.domain && <em>{ receiptItem.domain }</em> }
									</td>
									<td className="billing-history__receipt-amount">
										{ formatCurrency( receiptItem.amount_integer, item.currency, {
											isSmallestUnit: true,
											stripZeros: true,
										} ) }
									</td>
								</tr>
							);
						} ) }
						{ transactionIncludesTax( item ) && (
							<tr>
								<td colSpan={ 2 }>
									<div className="billing-history__transaction-tax-amount">
										<span>{ taxName ?? translate( 'Tax' ) }</span>
										<span>
											{ formatCurrency( item.tax_integer, item.currency, {
												isSmallestUnit: true,
												stripZeros: true,
											} ) }
										</span>
									</div>
								</td>
							</tr>
						) }
					</tbody>
					<tfoot>
						<tr>
							<td className="billing-history__receipt-desc">
								<strong>{ translate( 'Total paid:' ) }</strong>
							</td>
							<td className="billing-history__receipt-amount billing-history__total-amount">
								{ formatCurrency( item.amount_integer, item.currency, {
									isSmallestUnit: true,
									stripZeros: true,
								} ) }
							</td>
						</tr>
					</tfoot>
				</table>
			</div>

			<div className="billing-history__receipt-links">
				<Button variant="primary" onClick={ handlePrintClick }>
					{ translate( 'Print Receipt' ) }
				</Button>
			</div>
		</div>
	);
}
