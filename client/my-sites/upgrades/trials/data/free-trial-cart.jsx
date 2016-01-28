/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import cartValues, { cartItems } from 'lib/cart-values';
import observe from 'lib/mixins/data-observe';
import TransactionStore from 'lib/transaction/store';
import StoreConnection from 'components/data/store-connection';
import { resetTransaction, setPayment } from 'lib/upgrades/actions';
import storeTransactions from 'lib/store-transactions';

const FreeTrialCartData = React.createClass( {
	mixins: [ observe( 'sites', 'products' ) ],

	getInitialState: function() {
		return { cart: {} };
	},

	componentWillMount: function() {
		// reset the transaction store
		resetTransaction();

		// FIXME: The endpoint doesn't currently support transactions with no
		//   payment info, so for now we rely on the credits payment method for
		//   free carts.
		setPayment( storeTransactions.fullCreditsPayment() );

		this.updateCart();
	},

	componentDidMount: function() {
		this.props.sites.on( 'change', this.updateCart );
	},

	componentWillUnmount: function() {
		this.props.sites.off( 'change', this.updateCart );
	},

	updateCart: function() {
		if ( this.isDataLoading() ) {
			return;
		}

		const planSlug = this.props.plans.getSlugFromPath( this.props.planName ),
			planItem = cartItems.getItemForPlan( { product_slug: planSlug }, { isFreeTrial: true } );

		this.replaceCartWithItem( planItem );
	},

	replaceCartWithItem: function( item ) {
		const selectedSite = this.props.sites.getSelectedSite(),
			emptyCart = cartValues.emptyTemporaryCart( selectedSite.ID );

		const newCart = cartValues.fillInAllCartItemAttributes(
			cartItems.add( item )( emptyCart ),
			this.props.products.get()
		);

		this.setState( { cart: newCart } );
	},

	isDataLoading: function() {
		const isLoadingPlan = ! this.props.planName,
			isLoadingSites = ! this.props.sites.getSelectedSite(),
			isLoadingProducts = ! this.props.products.hasLoadedFromServer();

		return isLoadingPlan || isLoadingSites || isLoadingProducts;
	},

	getStateFromStores: function() {
		return {
			cart: this.state.cart,
			transaction: TransactionStore.get()
		};
	},

	render: function() {
		return (
			<StoreConnection
				cart={ this.state.cart } // passing down cart as props so StoreConnection update on cart change
				stores={ [ TransactionStore ] }
				getStateFromStores={ this.getStateFromStores } >
				{ this.props.children }
			</StoreConnection>
		);
	}
} );

export default FreeTrialCartData;
