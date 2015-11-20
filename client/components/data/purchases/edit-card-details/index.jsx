/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CountriesList from 'lib/countries-list';
import { fetchUserPurchases } from 'lib/upgrades/actions';
import observe from 'lib/mixins/data-observe';
import PurchasesStore from 'lib/purchases/store';
import StoreConnection from 'components/data/store-connection';

/**
 * Module variables
 */
const stores = [
	PurchasesStore
];

function getStateFromStores( props ) {
	return {
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
