/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CountriesList from 'lib/countries-list';
import { fetchStoredCards, fetchUserPurchases } from 'lib/upgrades/actions';
import observe from 'lib/mixins/data-observe';
import PurchasesStore from 'lib/purchases/store';
import { shouldFetchUserPurchases } from 'lib/purchases';
import StoreConnection from 'components/data/store-connection';
import StoredCardsStore from 'lib/purchases/stored-cards/store';
import userFactory from 'lib/user';

/**
 * Module variables
 */
const stores = [
		PurchasesStore,
		StoredCardsStore
	],
	user = userFactory();

function getStateFromStores( props ) {
	return {
		card: StoredCardsStore.getByCardId( parseInt( props.cardId, 10 ) ),
		isEditingSpecificCard: Boolean( props.cardId ),
		countriesList: CountriesList.forPayments(),
		hasLoadedSites: props.hasLoadedSites,
		selectedPurchase: PurchasesStore.getByPurchaseId( parseInt( props.purchaseId, 10 ) ),
		selectedSite: props.selectedSite
	};
}

function isDataLoading( state ) {
	return (
		state.card.isFetching ||
		! state.selectedPurchase.hasLoadedUserPurchasesFromServer ||
		! state.hasLoadedSites
	);
}

const EditCardDetailsData = React.createClass( {
	propTypes: {
		cardId: React.PropTypes.string,
		component: React.PropTypes.func.isRequired,
		purchaseId: React.PropTypes.string.isRequired,
		loadingPlaceholder: React.PropTypes.func.isRequired,
		sites: React.PropTypes.object.isRequired
	},

	mixins: [ observe( 'sites' ) ],

	componentWillMount() {
		fetchStoredCards();
		if ( shouldFetchUserPurchases( PurchasesStore.get() ) ) {
			fetchUserPurchases( user.get().ID );
		}
	},

	render() {
		return (
			<StoreConnection
				cardId={ this.props.cardId }
				component={ this.props.component }
				getStateFromStores={ getStateFromStores }
				hasLoadedSites={ this.props.sites.fetched }
				isDataLoading={ isDataLoading }
				loadingPlaceholder={ this.props.loadingPlaceholder }
				purchaseId={ this.props.purchaseId }
				selectedSite={ this.props.sites.getSelectedSite() }
				stores={ stores } />
		);
	}
} );

export default EditCardDetailsData;
