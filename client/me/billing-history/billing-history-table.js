/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import TransactionsTable from './transactions-table';
import eventRecorder from 'me/event-recorder';
import purchasesPaths from 'me/purchases/paths';
import { isSendingBillingReceiptEmail } from 'state/selectors';
import { sendBillingReceiptEmail } from 'state/billing-transactions/actions';

const BillingHistoryTable = React.createClass( {
	mixins: [ eventRecorder ],

	emailReceipt( receiptId, event ) {
		event.preventDefault();
		this.props.sendBillingReceiptEmail( receiptId );
	},

	renderEmailAction( receiptId ) {
		const { translate } = this.props;

		if ( this.props.sendingBillingReceiptEmail( receiptId ) ) {
			return translate( 'Emailing Receipt…' );
		}

		return (
			<a href="#" onClick={ this.recordClickEvent( 'Email Receipt in Billing History', this.emailReceipt.bind( this, receiptId ) ) }>
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
					onClick={ this.recordClickEvent( 'View Receipt in Billing History' ) }
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
			'To see what upgrades we offer visit our {{link}}Plans page{{/link}}.', {
				components: { link: <a href="/plans" /> }
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
				transactionRenderer={ this.renderTransaction } />
		);
	},
} );

export default connect(
	( state ) => {
		const sendingBillingReceiptEmail = ( receiptId ) => {
			return isSendingBillingReceiptEmail( state, receiptId );
		};

		return {
			sendingBillingReceiptEmail
		};
	},
	{ sendBillingReceiptEmail }
)( localize( BillingHistoryTable ) );
