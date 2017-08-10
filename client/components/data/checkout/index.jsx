/** @format */
/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var StoreConnection = require( 'components/data/store-connection' ),
	CartStore = require( 'lib/cart/store' ),
	TransactionStore = require( 'lib/transaction/store' );

var stores = [ TransactionStore, CartStore ];

function getStateFromStores() {
	return {
		transaction: TransactionStore.get(),
		cart: CartStore.get(),
	};
}

var CheckoutData = React.createClass( {
	render: function() {
		return (
			<StoreConnection stores={ stores } getStateFromStores={ getStateFromStores }>
				{ this.props.children }
			</StoreConnection>
		);
	},
} );

module.exports = CheckoutData;
