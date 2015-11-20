/**
 * External dependencies
 */
var React = require( 'react' ),
	includes = require( 'lodash/collection/includes' ),
	without = require( 'lodash/array/without' );

/**
 * Internal Dependencies
 */
var TransactionsTable = require( './transactions-table' ),
	eventRecorder = require( 'me/event-recorder' ),
	notices = require( 'notices' ),
	wpcom = require( 'lib/wp' ).undocumented();

module.exports = React.createClass( {
	displayName: 'BillingHistoryTable',

	mixins: [ eventRecorder ],

	getInitialState: function() {
		return {
			receiptsEmailing: []
		};
	},

	emailReceipt: function( receiptId, event ) {
		event.preventDefault();

		this.setState( { receiptsEmailing: this.state.receiptsEmailing.concat( receiptId ) } );

		wpcom.me().billingHistoryEmailReceipt( receiptId, function( error, data ) {
			if ( data && data.success ) {
				notices.success( this.translate( 'Your receipt was sent by email successfully.' ) );
			} else {
				notices.error( this.translate( 'There was a problem sending your receipt. Please try again later or contact support.' ) );
			}

			this.setState( { receiptsEmailing: without( this.state.receiptsEmailing, receiptId ) } );
		}.bind( this ) );
	},

	render: function() {
		return (
			<TransactionsTable
				{ ...this.props }
				initialFilter={ { date: { newest: 5 } } }
				header
				description={ function( transaction ) {
					return (
						<div className="transaction-links">
							<a className="view-receipt" href={ '/me/billing/' + transaction.id } onClick={ this.recordClickEvent( 'View Receipt in Billing History' ) } >
								{ this.translate( 'View Receipt' ) }
							</a>
							{ this.renderEmailAction( transaction.id ) }
						</div>
					);
				}.bind( this ) }
				/>
		);
	},

	renderEmailAction: function( receiptId ) {
		var action;
		if ( includes( this.state.receiptsEmailing, receiptId ) ) {
			action = this.translate( 'Emailing Receipt.…' );
		} else {
			action = (
				<a href="#" onClick={ this.recordClickEvent( 'Email Receipt in Billing History', this.emailReceipt.bind( this, receiptId ) ) }>
					{ this.translate( 'Email Receipt' ) }
				</a>
			);
		}

		return action;
	}
} );
