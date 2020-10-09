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
import isSendingBillingReceiptEmail from 'calypso/state/selectors/is-sending-billing-receipt-email';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { sendBillingReceiptEmail as sendBillingReceiptEmailAction } from 'calypso/state/billing-transactions/actions';

class BillingHistoryTable extends React.Component {
	recordClickEvent = ( eventAction ) => {
		this.props.recordGoogleEvent( 'Me', eventAction );
	};

	handleReceiptLinkClick = () => {
		return this.recordClickEvent( 'View Receipt in Billing History' );
	};

	getEmailReceiptLinkClickHandler = ( receiptId ) => {
		const { sendBillingReceiptEmail } = this.props;

		return ( event ) => {
			event.preventDefault();
			this.recordClickEvent( 'Email Receipt in Billing History' );
			sendBillingReceiptEmail( receiptId );
		};
	};

	renderEmailAction = ( receiptId ) => {
		const { translate } = this.props;

		if ( this.props.sendingBillingReceiptEmail( receiptId ) ) {
			return translate( 'Emailing receipt…' );
		}

		return (
			<button
				className="billing-history__email-button"
				onClick={ this.getEmailReceiptLinkClickHandler( receiptId ) }
			>
				{ translate( 'Email receipt' ) }
			</button>
		);
	};

	renderTransaction = ( transaction ) => {
		const { translate, getReceiptUrlFor } = this.props;

		return (
			<div className="billing-history__transaction-links">
				<a
					className="billing-history__view-receipt"
					href={ getReceiptUrlFor( transaction.id ) }
					onClick={ this.handleReceiptLinkClick }
				>
					{ translate( 'View receipt' ) }
				</a>
				{ this.renderEmailAction( transaction.id ) }
			</div>
		);
	};

	render() {
		const { translate } = this.props;
		const emptyTableText = translate(
			'You do not currently have any upgrades. ' +
				'To see what upgrades we offer visit our {{link}}Plans page{{/link}}.',
			{
				components: { link: <a href="/plans" /> },
			}
		);
		const noFilterResultsText = this.props.siteId
			? translate( 'You have made no purchases for this site.' )
			: translate( 'No receipts found.' );

		return (
			<TransactionsTable
				siteId={ this.props.siteId }
				transactionType="past"
				header
				emptyTableText={ emptyTableText }
				noFilterResultsText={ noFilterResultsText }
				transactionRenderer={ this.renderTransaction }
			/>
		);
	}
}

function getIsSendingReceiptEmail( state ) {
	return function isSendingBillingReceiptEmailForReceiptId( receiptId ) {
		return isSendingBillingReceiptEmail( state, receiptId );
	};
}

export default connect(
	( state ) => {
		return {
			sendingBillingReceiptEmail: getIsSendingReceiptEmail( state ),
		};
	},
	{
		recordGoogleEvent,
		sendBillingReceiptEmail: sendBillingReceiptEmailAction,
	}
)( localize( BillingHistoryTable ) );
