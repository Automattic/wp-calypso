/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import StoreConnection from 'calypso/components/data/store-connection';
import CartStore from 'calypso/lib/cart/store';
import TransactionStore from 'calypso/lib/transaction/store';

const stores = [ TransactionStore, CartStore ];

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
