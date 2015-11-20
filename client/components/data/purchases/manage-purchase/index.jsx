/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CartStore from 'lib/cart/store';
import { fetchUserPurchases } from 'lib/upgrades/actions';
import observe from 'lib/mixins/data-observe';
import PurchasesStore from 'lib/purchases/store';
import StoreConnection from 'components/data/store-connection';

/**
 * Module variables
 */
const stores = [
	CartStore,
	PurchasesStore
];

function getStateFromStores( props ) {
	return {
		cart: CartStore.get(),
		purchaseId: props.purchaseId,
		selectedPurchase: PurchasesStore.getByPurchaseId( parseInt( props.purchaseId, 10 ) ),
		selectedSite: props.selectedSite,
		destinationType: props.destinationType
	};
}

const ManagePurchaseData = React.createClass( {
	propTypes: {
		component: React.PropTypes.func.isRequired,
		purchaseId: React.PropTypes.string.isRequired,
		sites: React.PropTypes.object.isRequired,
		destinationType: React.PropTypes.string
	},

	mixins: [ observe( 'sites' ) ],

	componentWillMount() {
		fetchUserPurchases();
	},

	render() {
		return (
			<StoreConnection
				component={ this.props.component }
				stores={ stores }
				getStateFromStores={ getStateFromStores }
				purchaseId={ this.props.purchaseId }
				destinationType={ this.props.destinationType }
				selectedSite={ this.props.sites.getSelectedSite() } />
		);
	}
} );

export default ManagePurchaseData;
