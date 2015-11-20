/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { fetchUserPurchases } from 'lib/upgrades/actions';
import PurchasesStore from 'lib/purchases/store';
import StoreConnection from 'components/data/store-connection';
import userFactory from 'lib/user';

/**
 * Module variables
 */
const stores = [ PurchasesStore ],
	user = userFactory();

function getStateFromStores() {
	return { purchases: PurchasesStore.getByUser( user.get().ID ) };
}

const PurchasesData = React.createClass( {
	propTypes: {
		component: React.PropTypes.func.isRequired
	},

	componentDidMount() {
		fetchUserPurchases();
	},

	render() {
		return (
			<StoreConnection
				component={ this.props.component }
				stores={ stores }
				getStateFromStores={ getStateFromStores } />
		);
	}
} );

export default PurchasesData;
