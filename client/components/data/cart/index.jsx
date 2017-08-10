/** @format */
/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var StoreConnection = require( 'components/data/store-connection' ),
	CartStore = require( 'lib/cart/store' );

var stores = [ CartStore ];

function getStateFromStores() {
	return {
		cart: CartStore.get(),
	};
}

var CartData = React.createClass( {
	render: function() {
		return (
			<StoreConnection stores={ stores } getStateFromStores={ getStateFromStores }>
				{ this.props.children }
			</StoreConnection>
		);
	},
} );

module.exports = CartData;
