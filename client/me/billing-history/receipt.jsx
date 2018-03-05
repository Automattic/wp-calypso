/** @format */
/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import DocumentHead from 'components/data/document-head';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { billingHistory } from 'me/purchases/paths';
import QueryBillingTransactions from 'components/data/query-billing-transactions';
import tableRows from './table-rows';
import { getPastBillingTransaction, getPastBillingTransactions } from 'state/selectors';
import { recordGoogleEvent } from 'state/analytics/actions';

class BillingReceipt extends React.Component {
	componentDidMount() {
		this.redirectIfInvalidTransaction();
	}

	componentDidUpdate() {
		this.redirectIfInvalidTransaction();
	}

	recordClickEvent = action => {
		this.props.recordGoogleEvent( 'Me', 'Clicked on ' + action );
	};

	handleSupportLinkClick = () => {
		this.recordClickEvent( 'Contact {appName} Support in Billing History Receipt' );
	};

	handlePrintLinkClick = () => {
		this.recordClickEvent( 'Print Receipt Button in Billing History Receipt' );
		window.print();
	};

	redirectIfInvalidTransaction() {
		const { totalTransactions, transaction } = this.props;

		if ( ! transaction && totalTransactions !== null ) {
			page.redirect( billingHistory );
		}
	}

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
	}

	paymentMethod() {
		const { transaction, translate } = this.props;
		let text;

		if ( transaction.pay_part === 'paypal_express' ) {
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

	renderTitle() {
		const { translate } = this.props;

		return <HeaderCake backHref={ billingHistory }>{ translate( 'Billing History' ) }</HeaderCake>;
	}

	renderPlaceholder() {
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
	}

	renderEmptyBillingDetails() {
		const { translate } = this.props;

		return (
			<li className="billing-history__billing-details">
				<strong>{ translate( 'Billing Details' ) }</strong>
				<div contentEditable="true" />
			</li>
		);
	}

	renderLineItems() {
		const { transaction, translate } = this.props;
		const items = transaction.items.map( item => {
			return (
				<tr key={ item.id }>
					<td className="billing-history__receipt-item-name">
						<span>{ item.variation }</span>
						<small>({ item.type_localized })</small>
						<br />
						<em>{ item.domain }</em>
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
							<td
								className={
									'billing-history__receipt-amount billing-history__total-amount ' +
									transaction.credit
								}
							>
								{ transaction.amount }
							</td>
						</tr>
					</tfoot>
					<tbody>{ items }</tbody>
				</table>
			</div>
		);
	}

	renderBillingHistory() {
		const { transaction, translate } = this.props;
		const title = translate( 'Visit %(url)s', { args: { url: transaction.url } } );
		const serviceLink = <a href={ transaction.url } title={ title } />;

		return (
			<div>
				<Card compact className="billing-history__receipt-card">
					<div className="billing-history__app-overview">
						<img src={ transaction.icon } title={ transaction.service } />
						<h2>
							{' '}
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
							<div className="billing-history__transaction-date">
								{ tableRows.formatDate( transaction.date ) }
							</div>
						</h2>
					</div>
					<ul className="billing-history__receipt-details group">
						<li>
							<strong>{ translate( 'Receipt ID' ) }</strong>
							<span>{ transaction.id }</span>
						</li>
						{ this.ref() }
						{ this.paymentMethod() }
						{ transaction.cc_num !== 'XXXX'
							? this.renderBillingDetails()
							: this.renderEmptyBillingDetails() }
					</ul>
					{ this.renderLineItems() }
				</Card>

				<Card compact className="billing-history__receipt-links">
					<a
						href={ transaction.support }
						className="button is-primary"
						onClick={ this.handleSupportLinkClick }
					>
						{ translate( 'Contact %(transactionService)s Support', {
							args: {
								transactionService: transaction.service,
							},
							context: 'transactionService is a website, such as WordPress.com.',
						} ) }
					</a>
					<Button onClick={ this.handlePrintLinkClick }>{ translate( 'Print Receipt' ) }</Button>
				</Card>
			</div>
		);
	}

	render() {
		const { transaction, translate } = this.props;

		return (
			<Main>
				<DocumentHead title={ translate( 'Billing History' ) } />
				<PageViewTracker
					path="/me/purchases/billing/receipt"
					title="Me > Billing History > Receipt"
				/>
				<QueryBillingTransactions />

				{ this.renderTitle() }

				{ transaction ? this.renderBillingHistory() : this.renderPlaceholder() }
			</Main>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const transactions = getPastBillingTransactions( state );

		return {
			transaction: getPastBillingTransaction( state, ownProps.transactionId ),
			totalTransactions: transactions ? transactions.length : null,
		};
	},
	{
		recordGoogleEvent,
	}
)( localize( BillingReceipt ) );
