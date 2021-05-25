/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import { connect } from 'react-redux';
import { localize, useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import FormLabel from 'calypso/components/forms/form-label';
import TextareaAutosize from 'calypso/components/textarea-autosize';
import DocumentHead from 'calypso/components/data/document-head';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import { withLocalizedMoment, useLocalizedMoment } from 'calypso/components/localized-moment';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { billingHistory } from 'calypso/me/purchases/paths';
import QueryBillingTransaction from 'calypso/components/data/query-billing-transaction';
import {
	getTransactionTermLabel,
	groupDomainProducts,
	renderTransactionAmount,
	renderTransactionQuantitySummary,
} from './utils';
import getPastBillingTransaction from 'calypso/state/selectors/get-past-billing-transaction';
import isPastBillingTransactionError from 'calypso/state/selectors/is-past-billing-transaction-error';
import {
	clearBillingTransactionError,
	requestBillingTransaction,
} from 'calypso/state/billing-transactions/individual-transactions/actions';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { PARTNER_PAYPAL_EXPRESS } from 'calypso/lib/checkout/payment-methods';
import titles from 'calypso/me/purchases/titles';
import FormattedHeader from 'calypso/components/formatted-header';

class BillingReceipt extends React.Component {
	componentDidMount() {
		this.redirectIfInvalidTransaction();
	}

	componentDidUpdate() {
		this.redirectIfInvalidTransaction();
	}

	recordClickEvent = ( action ) => {
		this.props.recordGoogleEvent( 'Me', 'Clicked on ' + action );
	};

	handlePrintLinkClick = () => {
		this.recordClickEvent( 'Print Receipt Button in Billing History Receipt' );
		window.print();
	};

	redirectIfInvalidTransaction() {
		const { transactionFetchError, transactionId } = this.props;

		if ( ! transactionFetchError ) {
			return;
		}

		this.props.clearBillingTransactionError( transactionId );
		page.redirect( billingHistory );
	}

	render() {
		const { transaction, transactionId, translate } = this.props;

		return (
			<Main wideLayout className="receipt">
				<DocumentHead title={ translate( 'Billing History' ) } />
				<PageViewTracker
					path="/me/purchases/billing/:receipt"
					title="Me > Billing History > Receipt"
				/>

				<FormattedHeader brandFont headerText={ titles.sectionTitle } align="left" />
				<QueryBillingTransaction transactionId={ transactionId } />

				<ReceiptTitle backHref={ billingHistory } />

				{ transaction ? (
					<ReceiptBody
						transaction={ transaction }
						handlePrintLinkClick={ this.handlePrintLinkClick }
					/>
				) : (
					<ReceiptPlaceholder />
				) }
			</Main>
		);
	}
}

export function ReceiptBody( { transaction, handlePrintLinkClick } ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const title = translate( 'Visit %(url)s', { args: { url: transaction.url } } );
	const serviceLink = <a href={ transaction.url } title={ title } />;

	return (
		<div>
			<Card compact className="billing-history__receipt-card">
				<div className="billing-history__app-overview">
					<img src={ transaction.icon } title={ transaction.service } alt={ transaction.service } />
					<h2>
						{ translate( '{{link}}%(service)s{{/link}} {{small}}by %(organization)s{{/small}}', {
							components: {
								link: serviceLink,
								small: <small />,
							},
							args: {
								service: transaction.service,
								organization: transaction.org,
							},
							comment:
								'This string is "Service by Organization". ' +
								'The {{link}} and {{small}} add html styling and attributes. ' +
								'Screenshot: https://cloudup.com/isX-WEFYlOs',
						} ) }
						<small className="billing-history__organization-address">{ transaction.address }</small>
					</h2>
					<span className="billing-history__transaction-date">
						{ moment( transaction.date ).format( 'll' ) }
					</span>
				</div>
				<ul className="billing-history__receipt-details group">
					<li>
						<strong>{ translate( 'Receipt ID' ) }</strong>
						<span>{ transaction.id }</span>
					</li>
					<ReceiptTransactionId transaction={ transaction } />
					<ReceiptPaymentMethod transaction={ transaction } />
					{ transaction.cc_num !== 'XXXX' ? (
						<ReceiptDetails transaction={ transaction } />
					) : (
						<EmptyReceiptDetails />
					) }
				</ul>
				<ReceiptLineItems transaction={ transaction } />

				<div className="billing-history__receipt-links">
					<Button primary onClick={ handlePrintLinkClick }>
						{ translate( 'Print Receipt' ) }
					</Button>
				</div>
			</Card>
		</div>
	);
}

function ReceiptTransactionId( { transaction } ) {
	const translate = useTranslate();
	if ( ! transaction.pay_ref ) {
		return null;
	}

	return (
		<li>
			<strong>{ translate( 'Transaction ID' ) }</strong>
			<span>{ transaction.pay_ref }</span>
		</li>
	);
}

function ReceiptPaymentMethod( { transaction } ) {
	const translate = useTranslate();
	let text;

	if ( transaction.pay_part === PARTNER_PAYPAL_EXPRESS ) {
		text = translate( 'PayPal' );
	} else if ( 'XXXX' !== transaction.cc_num ) {
		text = translate( '%(cardType)s ending in %(cardNum)s', {
			args: {
				cardType: transaction.cc_type.toUpperCase(),
				cardNum: transaction.cc_num,
			},
		} );
	} else {
		return null;
	}

	return (
		<li>
			<strong>{ translate( 'Payment Method' ) }</strong>
			<span>{ text }</span>
		</li>
	);
}

function ReceiptLineItems( { transaction } ) {
	const translate = useTranslate();
	const groupedTransactionItems = groupDomainProducts( transaction.items, translate );

	const items = groupedTransactionItems.map( ( item ) => {
		const termLabel = getTransactionTermLabel( item, translate );
		return (
			<tr key={ item.id }>
				<td className="billing-history__receipt-item-name">
					<span>{ item.variation }</span>
					<small>({ item.type_localized })</small>
					{ termLabel ? <em>{ termLabel }</em> : null }
					<br />
					<em>{ item.domain }</em>
					{ item.licensed_quantity && (
						<em>{ renderTransactionQuantitySummary( item, translate ) }</em>
					) }
				</td>
				<td className={ 'billing-history__receipt-amount ' + transaction.credit }>
					{ item.amount }
					{ transaction.credit && (
						<span className="billing-history__credit-badge">{ translate( 'Refund' ) }</span>
					) }
				</td>
			</tr>
		);
	} );

	return (
		<div className="billing-history__receipt">
			<h4>{ translate( 'Order summary' ) }</h4>
			<table className="billing-history__receipt-line-items">
				<thead>
					<tr>
						<th className="billing-history__receipt-desc">{ translate( 'Description' ) }</th>
						<th className="billing-history__receipt-amount">{ translate( 'Amount' ) }</th>
					</tr>
				</thead>
				<tfoot>
					<tr>
						<td className="billing-history__receipt-desc">
							<strong>{ translate( 'Total' ) }:</strong>
						</td>
						<td
							className={
								'billing-history__receipt-amount billing-history__total-amount ' +
								transaction.credit
							}
						>
							{ renderTransactionAmount( transaction, { translate } ) }
						</td>
					</tr>
				</tfoot>
				<tbody>{ items }</tbody>
			</table>
		</div>
	);
}

function ReceiptDetails( { transaction } ) {
	if ( ! transaction.cc_name && ! transaction.cc_email ) {
		return null;
	}

	return (
		<li className="billing-history__billing-details">
			<ReceiptLabels />
			<TextareaAutosize
				className="billing-history__billing-details-editable"
				aria-labelledby="billing-history__billing-details-description"
				id="billing-history__billing-details-textarea"
				rows="1"
				defaultValue={ transaction.cc_name + '\n' + transaction.cc_email }
			/>
		</li>
	);
}

function EmptyReceiptDetails() {
	return (
		<li className="billing-history__billing-details">
			<ReceiptLabels />
			<TextareaAutosize
				className="billing-history__billing-details-editable"
				aria-labelledby="billing-history__billing-details-description"
				id="billing-history__billing-details-textarea"
				rows="1"
			/>
		</li>
	);
}

export function ReceiptPlaceholder() {
	return (
		<Card compact className="billing-history__receipt-card is-placeholder">
			<div className="billing-history__app-overview">
				<div className="billing-history__placeholder-image" />
				<div className="billing-history__placeholder-title" />
			</div>

			<div className="billing-history__receipt-links">
				<div className="billing-history__placeholder-link" />
				<div className="billing-history__placeholder-link" />
			</div>
		</Card>
	);
}

function ReceiptLabels() {
	const translate = useTranslate();
	return (
		<div>
			<FormLabel htmlFor="billing-history__billing-details-textarea">
				{ translate( 'Billing Details' ) }
			</FormLabel>
			<div
				className="billing-history__billing-details-description"
				id="billing-history__billing-details-description"
			>
				{ translate(
					'Use this field to add your billing information (eg. VAT number, business address) before printing.'
				) }
			</div>
		</div>
	);
}

export function ReceiptTitle( { backHref } ) {
	const translate = useTranslate();
	return <HeaderCake backHref={ backHref }>{ translate( 'Receipt' ) }</HeaderCake>;
}

export default connect(
	( state, { transactionId } ) => ( {
		transaction: getPastBillingTransaction( state, transactionId ),
		transactionFetchError: isPastBillingTransactionError( state, transactionId ),
	} ),
	{
		clearBillingTransactionError,
		recordGoogleEvent,
		requestBillingTransaction,
	}
)( localize( withLocalizedMoment( BillingReceipt ) ) );
