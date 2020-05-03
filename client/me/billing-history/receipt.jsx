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
import { Button, Card } from '@automattic/components';
import TextareaAutosize from 'components/textarea-autosize';
import DocumentHead from 'components/data/document-head';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import { withLocalizedMoment } from 'components/localized-moment';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { billingHistory } from 'me/purchases/paths';
import QueryBillingTransaction from 'components/data/query-billing-transaction';
import { groupDomainProducts, renderTransactionAmount } from './utils';
import getPastBillingTransaction from 'state/selectors/get-past-billing-transaction';
import isPastBillingTransactionError from 'state/selectors/is-past-billing-transaction-error';
import {
	clearBillingTransactionError,
	requestBillingTransaction,
} from 'state/billing-transactions/individual-transactions/actions';
import { recordGoogleEvent } from 'state/analytics/actions';
import { getPlanTermLabel } from 'lib/plans';
import { PARTNER_PAYPAL_EXPRESS } from 'lib/checkout/payment-methods';

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

	renderBillingDetailsLabels() {
		const { translate } = this.props;
		return (
			<div>
				<label htmlFor="billing-history__billing-details-textarea">
					<strong>{ translate( 'Billing Details' ) }</strong>
				</label>
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

	renderBillingDetails() {
		const { transaction } = this.props;
		if ( ! transaction.cc_name && ! transaction.cc_email ) {
			return null;
		}

		return (
			<li className="billing-history__billing-details">
				{ this.renderBillingDetailsLabels() }
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

	renderEmptyBillingDetails() {
		return (
			<li className="billing-history__billing-details">
				{ this.renderBillingDetailsLabels() }
				<TextareaAutosize
					className="billing-history__billing-details-editable"
					aria-labelledby="billing-history__billing-details-description"
					id="billing-history__billing-details-textarea"
					rows="1"
				/>
			</li>
		);
	}

	renderLineItems() {
		const { transaction, translate } = this.props;
		const groupedTransactionItems = groupDomainProducts( transaction.items, translate );

		const items = groupedTransactionItems.map( ( item ) => {
			const termLabel = getPlanTermLabel( item.wpcom_product_slug, translate );
			return (
				<tr key={ item.id }>
					<td className="billing-history__receipt-item-name">
						<span>{ item.variation }</span>
						<small>({ item.type_localized })</small>
						{ termLabel ? <em>{ termLabel }</em> : null }
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
								{ renderTransactionAmount( transaction, { translate } ) }
							</td>
						</tr>
					</tfoot>
					<tbody>{ items }</tbody>
				</table>
			</div>
		);
	}

	renderBillingHistory() {
		const { transaction, translate, moment } = this.props;
		const title = translate( 'Visit %(url)s', { args: { url: transaction.url } } );
		const serviceLink = <a href={ transaction.url } title={ title } />;

		return (
			<div>
				<Card compact className="billing-history__receipt-card">
					<div className="billing-history__app-overview">
						<img
							src={ transaction.icon }
							title={ transaction.service }
							alt={ transaction.service }
						/>
						<h2>
							{ ' ' }
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
								{ moment( transaction.date ).format( 'll' ) }
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
					<Button primary onClick={ this.handlePrintLinkClick }>
						{ translate( 'Print Receipt' ) }
					</Button>
				</Card>
			</div>
		);
	}

	render() {
		const { transaction, transactionId, translate } = this.props;

		return (
			<Main>
				<DocumentHead title={ translate( 'Billing History' ) } />
				<PageViewTracker
					path="/me/purchases/billing/:receipt"
					title="Me > Billing History > Receipt"
				/>
				<QueryBillingTransaction transactionId={ transactionId } />

				{ this.renderTitle() }

				{ transaction ? this.renderBillingHistory() : this.renderPlaceholder() }
			</Main>
		);
	}
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
