/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import StoreConnection from 'client/components/data/store-connection';
import CartStore from 'client/lib/cart/store';
import TransactionStore from 'client/lib/transaction/store';

var stores = [ TransactionStore, CartStore ];

function getStateFromStores() {
	return {
		transaction: TransactionStore.get(),
		cart: CartStore.get(),
	};
}

class CheckoutData extends React.Component {
	render() {
		return (
			<StoreConnection stores={ stores } getStateFromStores={ getStateFromStores }>
				{ this.props.children }
			</StoreConnection>
		);
	}
}

export default CheckoutData;
