import { Card } from '@automattic/components';
import { formatCurrency } from '@automattic/format-currency';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryBillingTransaction from 'calypso/components/data/query-billing-transaction';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { billingHistory } from 'calypso/me/purchases/paths';
import { useDispatch } from 'calypso/state';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { sendBillingReceiptEmail } from 'calypso/state/billing-transactions/actions';
import getPastBillingTransaction from 'calypso/state/selectors/get-past-billing-transaction';
import isPastBillingTransactionError from 'calypso/state/selectors/is-past-billing-transaction-error';
import {
	getTransactionTermLabel,
	groupDomainProducts,
	renderTransactionQuantitySummary,
	renderDomainTransactionVolumeSummary,
	transactionIncludesTax,
	formatDisplayDate,
} from './utils';
import type {
	BillingTransaction,
	BillingTransactionItem,
} from 'calypso/state/billing-transactions/types';
import type { IAppState } from 'calypso/state/types';

import './style.scss';
import './modern-receipt.scss';

interface ModernReceiptProps {
	transactionId: number;
}

export default function ModernReceipt( { transactionId }: ModernReceiptProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const transaction = useSelector( ( state: IAppState ) =>
		getPastBillingTransaction( state, transactionId )
	) as BillingTransaction | undefined;

	const transactionError = useSelector( ( state: IAppState ) =>
		isPastBillingTransactionError( state, transactionId )
	);

	const isLoading = ! transaction && ! transactionError;

	const handlePrint = useCallback( () => {
		dispatch(
			recordGoogleEvent( 'Me', 'Clicked on Print Receipt Button in Billing History Receipt' )
		);
		window.print();
	}, [ dispatch ] );

	const handleEmailReceipt = useCallback( () => {
		dispatch( recordGoogleEvent( 'Me', 'Clicked on Email Receipt Button' ) );
		dispatch( sendBillingReceiptEmail( transactionId.toString() ) );
	}, [ dispatch, transactionId ] );

	if ( isLoading ) {
		return <ReceiptPlaceholder />;
	}

	if ( transactionError ) {
		return (
			<Card className="modern-receipt__error">
				<p>{ translate( "Sorry, we couldn't load this receipt. Please try again later." ) }</p>
				<Button href={ billingHistory } variant="primary">
					{ translate( 'Return to Billing History' ) }
				</Button>
			</Card>
		);
	}

	if ( ! transaction ) {
		return null;
	}

	return (
		<Main wideLayout className="modern-receipt">
			<DocumentHead title={ translate( 'Billing History' ) } />
			<PageViewTracker
				path="/me/purchases/billing/:receipt"
				title="Me > Billing History > Receipt"
			/>
			<QueryBillingTransaction transactionId={ transactionId } />

			<div className="modern-receipt__page-header">
				<div className="modern-receipt__breadcrumbs">
					<a href={ billingHistory } className="modern-receipt__back-link">
						{ translate( 'Receipts' ) }
					</a>
				</div>
				<div className="modern-receipt__title-bar">
					<h1 className="modern-receipt__title">
						{ translate( 'Receipt %(id)s', { args: { id: transactionId } } ) }
					</h1>
					{ ! isLoading && (
						<div className="modern-receipt__actions">
							<Button onClick={ handlePrint }>{ translate( 'Print Receipt' ) }</Button>
							<Button onClick={ handleEmailReceipt }>{ translate( 'Email Receipt' ) }</Button>
						</div>
					) }
				</div>
			</div>

			<ReceiptContent transaction={ transaction } />
		</Main>
	);
}

interface ReceiptContentProps {
	transaction: BillingTransaction;
}

function ReceiptContent( { transaction }: ReceiptContentProps ) {
	const translate = useTranslate();
	const [ billingDetails, setBillingDetails ] = useState( '' );

	return (
		<Card className="modern-receipt__content">
			<div className="modern-receipt__header">
				<div className="modern-receipt__branding">
					<img
						src={ transaction.icon }
						alt={ transaction.service }
						className="modern-receipt__logo"
					/>
					<div className="modern-receipt__company">
						<h2>{ transaction.service }</h2>
						<span className="modern-receipt__org">{ transaction.org }</span>
						<span className="modern-receipt__address">{ transaction.address }</span>
					</div>
				</div>
				<div className="modern-receipt__meta">
					<div className="modern-receipt__date">
						{ formatDisplayDate( new Date( transaction.date ) ) }
					</div>
					<div className="modern-receipt__id">
						{ translate( 'Receipt ID: %s', { args: [ transaction.id ] } ) }
					</div>
				</div>
			</div>

			<div className="modern-receipt__body">
				<div className="modern-receipt__receipt-id-section">
					<div className="modern-receipt__receipt-id-label">{ translate( 'RECEIPT ID' ) }</div>
					<div className="modern-receipt__receipt-id-value">{ transaction.id }</div>
				</div>

				<div className="modern-receipt__billing-details">
					<div className="modern-receipt__billing-details-label">
						{ translate( 'BILLING DETAILS' ) }
					</div>
					<textarea
						className="modern-receipt__billing-details-input"
						placeholder={ translate(
							'Use this field to add your billing information (e.g. business address) before printing.'
						) }
						value={ billingDetails }
						onChange={ ( e ) => setBillingDetails( e.target.value ) }
						data-is-empty={ ! billingDetails }
					/>
				</div>

				<table className="modern-receipt__items">
					<thead>
						<tr>
							<th>{ translate( 'Description' ) }</th>
							<th className="modern-receipt__amount-column">{ translate( 'Amount' ) }</th>
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

function ReceiptLineItems( { transaction }: { transaction: BillingTransaction } ) {
	const translate = useTranslate();
	const items = groupDomainProducts( transaction.items, translate );

	return (
		<>
			{ items.map( ( item ) => (
				<ReceiptLineItem key={ item.id } item={ item } transaction={ transaction } />
			) ) }
			{ transactionIncludesTax( transaction ) && (
				<tr className="modern-receipt__tax">
					<td>{ translate( 'Tax' ) }</td>
					<td className="modern-receipt__amount">
						{ formatCurrency( transaction.tax_integer, transaction.currency, {
							isSmallestUnit: true,
							stripZeros: true,
						} ) }
					</td>
				</tr>
			) }
		</>
	);
}

function ReceiptLineItem( {
	item,
	transaction,
}: {
	item: BillingTransactionItem;
	transaction: BillingTransaction;
} ) {
	const translate = useTranslate();
	const termLabel = getTransactionTermLabel( item, translate );

	return (
		<tr className="modern-receipt__item">
			<td className="modern-receipt__item-details">
				<div className="modern-receipt__item-name">{ item.variation }</div>
				<div className="modern-receipt__item-type">{ item.type_localized }</div>
				{ termLabel && <div className="modern-receipt__item-term">{ termLabel }</div> }
				{ item.domain && <div className="modern-receipt__item-domain">{ item.domain }</div> }
				{ item.licensed_quantity && (
					<div className="modern-receipt__item-quantity">
						{ renderTransactionQuantitySummary( item, translate ) }
					</div>
				) }
				{ item.volume && (
					<div className="modern-receipt__item-volume">
						{ renderDomainTransactionVolumeSummary( item, translate ) }
					</div>
				) }
			</td>
			<td className="modern-receipt__amount">
				{ formatCurrency( item.amount_integer, item.currency, {
					isSmallestUnit: true,
					stripZeros: true,
				} ) }
				{ transaction.credit && (
					<span className="modern-receipt__refund-badge">{ translate( 'Refund' ) }</span>
				) }
			</td>
		</tr>
	);
}

function ReceiptTotal( { transaction }: { transaction: BillingTransaction } ) {
	const translate = useTranslate();

	return (
		<tr className="modern-receipt__total">
			<td>{ translate( 'Total' ) }</td>
			<td className="modern-receipt__amount">
				{ formatCurrency( transaction.amount_integer, transaction.currency, {
					isSmallestUnit: true,
					stripZeros: true,
				} ) }
			</td>
		</tr>
	);
}

function ReceiptPlaceholder() {
	const translate = useTranslate();

	return (
		<Main wideLayout className="modern-receipt">
			<div className="modern-receipt__page-header">
				<div className="modern-receipt__breadcrumbs is-placeholder" />
				<div className="modern-receipt__title-bar">
					<h1
						className="modern-receipt__title is-placeholder"
						aria-label={ translate( 'Loading receipt' ) }
					>
						<span className="screen-reader-text">{ translate( 'Loading receipt' ) }</span>
					</h1>
					<div className="modern-receipt__actions is-placeholder" />
				</div>
			</div>

			<Card className="modern-receipt__content is-placeholder">
				<div className="modern-receipt__header">
					<div className="modern-receipt__branding">
						<div className="modern-receipt__logo" />
						<div className="modern-receipt__company">
							<div className="modern-receipt__company-name" />
							<div className="modern-receipt__org" />
							<div className="modern-receipt__address" />
						</div>
					</div>
					<div className="modern-receipt__meta">
						<div className="modern-receipt__date" />
						<div className="modern-receipt__id" />
					</div>
				</div>

				<div className="modern-receipt__body">
					<div className="modern-receipt__receipt-id-section">
						<div className="modern-receipt__receipt-id-label" />
						<div className="modern-receipt__receipt-id-value" />
					</div>

					<table className="modern-receipt__items">
						<thead>
							<tr>
								<th className="modern-receipt__description" />
								<th className="modern-receipt__amount-column" />
							</tr>
						</thead>
						<tbody>
							<tr className="modern-receipt__item">
								<td>
									<div className="modern-receipt__item-name" />
									<div className="modern-receipt__item-type" />
								</td>
								<td className="modern-receipt__amount" />
							</tr>
						</tbody>
						<tfoot>
							<tr className="modern-receipt__total">
								<td />
								<td className="modern-receipt__amount" />
							</tr>
						</tfoot>
					</table>
				</div>
			</Card>
		</Main>
	);
}
