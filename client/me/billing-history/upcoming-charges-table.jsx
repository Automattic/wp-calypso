/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal Dependencies
 */
var	purchasesPaths = require( 'me/purchases/paths' ),
	TransactionsTable = require( './transactions-table' );

module.exports = React.createClass( {

	displayName: 'UpcomingChargesTable',

	render: function() {
		return (
			<TransactionsTable
				{ ...this.props }
				initialFilter={ { date: { newest: 20 } } }
				description={ function( { domain, id } = transaction ) {
					return (
						<div className="transaction-links">
							<a href={ purchasesPaths.managePurchase( domain, id ) }>
								{ this.translate( 'Manage Purchase' ) }
							</a>
						</div>
					);
				} }
			/>
		);
	}
} );
