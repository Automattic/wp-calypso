/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import StoreConnection from 'calypso/components/data/store-connection';
import CartStore from 'calypso/lib/cart/store';

const stores = [ CartStore ];

function getStateFromStores() {
	return {
		cart: CartStore.get(),
	};
}

class CartData extends React.Component {
	render() {
		return (
			<StoreConnection stores={ stores } getStateFromStores={ getStateFromStores }>
				{ this.props.children }
			</StoreConnection>
		);
	}
}

export default CartData;
