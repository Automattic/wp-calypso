/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import StoreConnection from 'components/data/store-connection';
import CartStore from 'lib/cart/store';

const stores = [ CartStore ];

function getStateFromStores() {
	return {
		cart: CartStore.get(),
	};
}

class CartData extends React.Component {
	render() {
		console.log(this.props.children);
		return (
			<StoreConnection stores={ stores } getStateFromStores={ getStateFromStores }>
				{ this.props.children }
			</StoreConnection>
		);
	}
}

export default CartData;
