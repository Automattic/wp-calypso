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
				description={ function() {
					return (
						<div className="transaction-links">
							<a href="/my-upgrades">
								{ this.translate( 'Manage Upgrade' ) }
							</a>
						</div>
					);
				} }
			/>
		);
	}
} );
