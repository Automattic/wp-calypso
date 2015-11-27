/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal Dependencies
 */
var	TransactionsTable = require( './transactions-table' );

module.exports = React.createClass( {

	displayName: 'UpcomingChargesTable',

	render: function() {
		return (
			<TransactionsTable
				{ ...this.props }
				initialFilter={ { date: { newest: 20 } } }
				description={ function( { domain, id } = transaction ) {
					const link = '/purchases/' + domain + '/' + id
					return (
						<div className="transaction-links">
							<a href={ link }>
								{ this.translate( 'Manage Purchase' ) }
							</a>
						</div>
					);
				} }
			/>
		);
	}
} );
