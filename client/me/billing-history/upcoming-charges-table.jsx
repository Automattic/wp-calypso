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
		var transactions = null;

		if ( this.props.sites.initialized ) {
			// `TransactionsTable` will render a loading state until the transactions are present
			transactions = this.props.transactions;
		}

		return (
			<TransactionsTable
				transactions={ transactions }
				initialFilter={ { date: { newest: 20 } } }
				description={ function( transaction ) {
					var site = this.props.sites.getSite( Number( transaction.blog_id ) );

					if ( site ) {
						return (
							<div className="transaction-links">
								<a href={ purchasesPaths.managePurchase( site.slug, transaction.id ) }>
									{ this.translate( 'Manage Purchase' ) }
								</a>
							</div>
						);
					}
				}.bind( this ) }
			/>
		);
	}
} );
