/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import tableRows from './table-rows';
import observe from 'lib/mixins/data-observe';
import eventRecorder from 'me/event-recorder';
import Card from 'components/card';
import Main from 'components/main';
import HeaderCake from 'components/header-cake';
import DocumentHead from 'components/data/document-head';
import purchasesPaths from 'me/purchases/paths';

const BillingReceipt = React.createClass( {
	mixins: [ observe( 'billingData' ), eventRecorder ],

	render() {
		const { transaction, translate } = this.props;
		const title = translate( 'Visit %(url)s', { args: { url: transaction.url } } );
		const serviceLink = <a href={ transaction.url } title={ title } />;

		return (
			<Main>
				<DocumentHead title={ translate( 'Billing History' ) } />
				<HeaderCake backHref={ purchasesPaths.billingHistory() }>
					{ translate( 'Billing History' ) }
				</HeaderCake>
				<Card compact className="billing-history__receipt-card">
					<div className="billing-history__app-overview">
						<img src={ transaction.icon } title={ transaction.service } />
						<h2> {
							translate( '{{link}}%(service)s{{/link}} {{small}}by %(organization)s{{/small}}',
								{
									components: {
										link: serviceLink,
										small: <small />
									},
									args: {
										service: transaction.service,
										organization: transaction.org,
									},
									comment: 'This string is "Service by Organization". ' +
										'The {{link}} and {{small}} add html styling and attributes. ' +
										'Screenshot: https://cloudup.com/isX-WEFYlOs'
								} )
							}
							<div className="billing-history__transaction-date">{ tableRows.formatDate( transaction.date ) }</div>
						</h2>
					</div>
					<ul className="billing-history__receipt-details group">
						<li>
							<strong>{ translate( 'Receipt ID' ) }</strong>
							<span>{ transaction.id }</span>
						</li>
						{ this.ref() }
						{ this.paymentMethod() }
						{ transaction.cc_num !== 'XXXX' ? this.renderBillingDetails() : null }
					</ul>
					{ this.renderLineItems() }
				</Card>
				<Card compact className="billing-history__receipt-links">
					<a
						href={ transaction.support }
						className="button is-primary"
						onClick={ this.recordClickEvent( 'Contact {appName} Support in Billing History Receipt' ) }
					>
						{ translate( 'Contact %(transactionService)s Support', {
							args: {
								transactionService: transaction.service
							},
							context: 'transactionService is a website, such as WordPress.com.'
						} ) }
					</a>
					<a
						href="#"
						onClick={ this.recordClickEvent( 'Print Receipt Button in Billing History Receipt', this.printReceipt ) }
						className="button is-secondary"
					>
						{ translate( 'Print Receipt' ) }
					</a>
				</Card>
			</Main>
		);
	},

	printReceipt( event ) {
		event.preventDefault();
		window.print();
	},

	ref() {
		const { transaction, translate } = this.props;

		if ( ! transaction.pay_ref ) {
			return null;
		}

		return (
			<li>
				<strong>{ translate( 'Transaction ID' ) }</strong>
				<span>{ transaction.pay_ref }</span>
			</li>
		);
	},

	paymentMethod() {
		const { transaction, translate } = this.props;
		let text;

		if ( transaction.pay_part === 'paypal_express' ) {
			text = translate( 'PayPal' );
		} else if ( 'NOT STORED' === transaction.cc_type.toUpperCase() ) {
			text = translate( 'Credit Card' );
		} else {
			text = transaction.cc_type.toUpperCase() + translate( ' ending in ' ) + transaction.cc_num;
		}

		return (
			<li>
				<strong>{ translate( 'Payment Method' ) }</strong>
				<span>{ text }</span>
			</li>
		);
	},

	renderBillingDetails() {
		const { transaction, translate } = this.props;
		if ( ! transaction.cc_name && ! transaction.cc_email ) {
			return null;
		}

		return (
			<li className="billing-history__billing-details">
				<strong>{ translate( 'Billing Details' ) }</strong>
				<div contentEditable="true">{ transaction.cc_name }</div>
				<div contentEditable="true">{ transaction.cc_email }</div>
			</li>
		);
	},

	renderLineItems() {
		const { transaction, translate } = this.props;
		const items = transaction.items.map( ( item ) => {
			return (
				<tr key={ item.id }>
					<td className="billing-history__receipt-item-name">
						<span>{ item.variation }</span>
						<small>({ item.type })</small><br />
						<em>{ item.domain }</em>
					</td>
					<td className={ 'billing-history__receipt-amount ' + transaction.credit }>
						{ item.amount }
						{ transaction.credit && <span className="billing-history__credit-badge">{ translate( 'Refund' ) }</span> }
					</td>
				</tr>
			);
		} );

		return (
			<div className="billing-history__receipt">
				<h4>{ translate( 'Order Summary' ) }</h4>
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
							<td className={ 'billing-history__receipt-amount billing-history__total-amount ' + transaction.credit }>
								{ transaction.amount }
							</td>
						</tr>
					</tfoot>
					<tbody>
						{ items }
					</tbody>
				</table>
			</div>
		);
	}
} );

export default localize( BillingReceipt );
