/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CountriesList from 'lib/countries-list';
import { fetchStoredCards } from 'lib/upgrades/actions';
import observe from 'lib/mixins/data-observe';
import StoreConnection from 'components/data/store-connection';
import StoredCardsStore from 'lib/purchases/stored-cards/store';

/**
 * Module variables
 */
const stores = [
	StoredCardsStore
];

function getStateFromStores( props ) {
	return {
		card: StoredCardsStore.getByCardId( parseInt( props.cardId, 10 ) ),
		countriesList: CountriesList.forPayments(),
		purchaseId: props.purchaseId
	};
}

const isDataLoading = state => state.card.isFetching;

const EditCardDetailsData = React.createClass( {
	propTypes: {
		cardId: React.PropTypes.string,
		component: React.PropTypes.func.isRequired,
		purchaseId: React.PropTypes.number.isRequired,
		loadingPlaceholder: React.PropTypes.func.isRequired,
		sites: React.PropTypes.object.isRequired
	},

	mixins: [ observe( 'sites' ) ],

	componentWillMount() {
		fetchStoredCards();
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
