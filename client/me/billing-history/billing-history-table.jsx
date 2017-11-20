/** @format */

/**
 * External dependencies
 */

import React from 'react';
import createReactClass from 'create-react-class';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import TransactionsTable from './transactions-table';
import purchasesPaths from 'me/purchases/paths';
import { isSendingBillingReceiptEmail } from 'state/selectors';
import { recordGoogleEvent } from 'state/analytics/actions';
import { sendBillingReceiptEmail as sendBillingReceiptEmailAction } from 'state/billing-transactions/actions';

const BillingHistoryTable = createReactClass( {
	displayName: 'BillingHistoryTable',

	emailReceipt( receiptId, event ) {
		event.preventDefault();
		this.props.sendBillingReceiptEmail( receiptId );
	},

	recordClickEvent( eventAction ) {
		this.props.recordGoogleEvent( 'Me', eventAction );
	},

	handleReceiptLinkClick() {
		return this.recordClickEvent( 'View Receipt in Billing History' );
	},

	getEmailReceiptLinkClickHandler( receiptId ) {
		const { sendBillingReceiptEmail } = this.props;

		return event => {
			event.preventDefault();
			this.recordClickEvent( 'Email Receipt in Billing History' );
			sendBillingReceiptEmail( receiptId );
		};
	},

	renderEmailAction( receiptId ) {
		const { translate } = this.props;

		if ( this.props.sendingBillingReceiptEmail( receiptId ) ) {
			return translate( 'Emailing Receipt…' );
		}

		return (
			<a href="#" onClick={ this.getEmailReceiptLinkClickHandler( receiptId ) }>
				{ translate( 'Email Receipt' ) }
			</a>
		);
	},

	renderTransaction( transaction ) {
		const { translate } = this.props;

		return (
			<div className="billing-history__transaction-links">
				<a
					className="billing-history__view-receipt"
					href={ purchasesPaths.billingHistoryReceipt( transaction.id ) }
					onClick={ this.handleReceiptLinkClick }
				>
					{ translate( 'View Receipt' ) }
				</a>
				{ this.renderEmailAction( transaction.id ) }
			</div>
		);
	},

	render() {
		const { translate } = this.props;
		const emptyTableText = translate(
			'You do not currently have any upgrades. ' +
				'To see what upgrades we offer visit our {{link}}Plans page{{/link}}.',
			{
				components: { link: <a href="/plans" /> },
			}
		);
		const noFilterResultsText = translate( 'No receipts found.' );

		return (
			<TransactionsTable
				{ ...this.props }
				initialFilter={ { date: { newest: 5 } } }
				header
				emptyTableText={ emptyTableText }
				noFilterResultsText={ noFilterResultsText }
				transactionRenderer={ this.renderTransaction }
			/>
		);
	},
} );

export default connect(
	state => {
		const sendingBillingReceiptEmail = receiptId => {
			return isSendingBillingReceiptEmail( state, receiptId );
		};

		return {
			sendingBillingReceiptEmail,
		};
	},
	{
		recordGoogleEvent,
		sendBillingReceiptEmail: sendBillingReceiptEmailAction,
	}
)( localize( BillingHistoryTable ) );
