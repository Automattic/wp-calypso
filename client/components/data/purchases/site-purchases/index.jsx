/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { fetchSitePurchases } from 'lib/upgrades/actions';
import PurchasesStore from 'lib/purchases/store';
import StoreConnection from 'components/data/store-connection';
import sitesFactory from 'lib/sites-list';

/**
 * Module variables
 */
const sites = sitesFactory(),
	stores = [
		PurchasesStore,
		sites
	];

function getStateFromStores() {
	return {
		purchases: PurchasesStore.getBySite( sites.getSelectedSite().ID ),
		selectedSite: sites.getSelectedSite().ID
	};
}

const SitePurchasesData = React.createClass( {
	shouldFetchPurchases() {
		const purchases = PurchasesStore.get(),
			selectedSite = sites.getSelectedSite();

		return selectedSite && ! purchases.isFetchingSitePurchases && ! purchases.hasLoadedSitePurchasesFromServer;
	},

	componentWillMount() {
		if ( this.shouldFetchPurchases() ) {
			fetchSitePurchases( sites.getSelectedSite().ID );
		}

		this.previousSelectedSite = sites.getSelectedSite();
	},

	componentWillReceiveProps() {
		if ( this.shouldFetchPurchases() || sites.getSelectedSite() !== this.previousSelectedSite ) {
			fetchSitePurchases( sites.getSelectedSite().ID );

			this.previousSelectedSite = sites.getSelectedSite();
		}
	},

	render() {
		return (
			<StoreConnection
				stores={ stores }
				getStateFromStores={ getStateFromStores }>
				{ this.props.children }
			</StoreConnection>
		);
	}
} );

export default SitePurchasesData;
