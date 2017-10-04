/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import StoreConnection from 'components/data/store-connection';

import CartStore from 'lib/cart/store';

var stores = [ CartStore ];

function getStateFromStores() {
	return {
		cart: CartStore.get()
	};
}

var CartData = React.createClass( {
	render: function() {
		return (
			<StoreConnection stores={ stores } getStateFromStores={ getStateFromStores }>
				{ this.props.children }
			</StoreConnection>
		);
	}
} );

module.exports = CartData;
