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
import { shouldFetchPurchases } from 'lib/purchases';
import StoreConnection from 'components/data/store-connection';
import userFactory from 'lib/user';

/**
 * Module variables
 */
const user = userFactory(),
	stores = [
		CartStore,
		PurchasesStore,
		user
	];

function getStateFromStores( props ) {
	return {
		cart: CartStore.get(),
		purchaseId: props.purchaseId,
		selectedPurchase: PurchasesStore.getByPurchaseId( parseInt( props.purchaseId, 10 ) ),
		selectedSite: props.selectedSite,
		destinationType: props.destinationType,
		user: user.get()
	};
}

const ManagePurchaseData = React.createClass( {
	propTypes: {
		component: React.PropTypes.func.isRequired,
		purchaseId: React.PropTypes.string.isRequired,
		sites: React.PropTypes.object.isRequired,
		destinationType: React.PropTypes.string,
		loadingPlaceholder: React.PropTypes.func,
		isDataLoading: React.PropTypes.func
	},

	mixins: [ observe( 'sites' ) ],

	componentWillMount() {
		if ( shouldFetchPurchases( PurchasesStore.get() ) ) {
			fetchUserPurchases( user.get().ID );
		}
	},

	render() {
		return (
			<StoreConnection
				component={ this.props.component }
				isDataLoading={ this.props.isDataLoading }
				loadingPlaceholder={ this.props.loadingPlaceholder }
				stores={ stores }
				getStateFromStores={ getStateFromStores }
				purchaseId={ this.props.purchaseId }
				destinationType={ this.props.destinationType }
				selectedSite={ this.props.sites.getSelectedSite() } />
		);
	}
} );

export default ManagePurchaseData;
