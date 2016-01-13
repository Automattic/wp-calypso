/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var StoreConnection = require( 'components/data/store-connection' ),
	TransactionStore = require( 'lib/transaction/store' );

var stores = [ TransactionStore ];

function getStateFromStores() {
	return {
		transaction: TransactionStore.get()
	};
}

var TransactionData = React.createClass( {
	render: function() {
		return (
			<StoreConnection stores={ stores } getStateFromStores={ getStateFromStores }>
				{ this.props.children }
			</StoreConnection>
		);
	}
} );

module.exports = TransactionData;
