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
import StoreConnection from 'components/data/store-connection';
import StoredCardsStore from 'lib/purchases/stored-cards/store';

/**
 * Module variables
 */
const stores = [
	PurchasesStore,
	StoredCardsStore
];

function getStateFromStores( props ) {
	return {
		card: StoredCardsStore.getByCardId( parseInt( props.cardId, 10 ) ),
		countriesList: CountriesList.forPayments(),
		selectedPurchase: PurchasesStore.getByPurchaseId( parseInt( props.purchaseId, 10 ) ),
		selectedSite: props.selectedSite
	};
}

const EditCardDetailsData = React.createClass( {
	propTypes: {
		cardId: React.PropTypes.string.isRequired,
		component: React.PropTypes.func.isRequired,
		purchaseId: React.PropTypes.string.isRequired,
		sites: React.PropTypes.object.isRequired
	},

	mixins: [ observe( 'sites' ) ],

	componentWillMount() {
		fetchStoredCards();
		fetchUserPurchases();
	},

	render() {
		return (
			<StoreConnection
				cardId={ this.props.cardId }
				component={ this.props.component }
				getStateFromStores={ getStateFromStores }
				purchaseId={ this.props.purchaseId }
				selectedSite={ this.props.sites.getSelectedSite() }
				stores={ stores } />
		);
	}
} );

export default EditCardDetailsData;
