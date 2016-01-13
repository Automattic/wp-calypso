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

	componentDidMount: function() {
		if ( this.props.planName ) {
			this.updateCart();
		}
	},

	componentWillMount: function() {
		// reset the transaction store
		resetTransaction();

		// FIXME: The endpoint doesn't currently support transactions with no
		//   payment info, so for now we rely on the credits payment method for
		//   free carts.
		setPayment( storeTransactions.fullCreditsPayment() );
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( nextProps.planName !== this.props.planName ) {
			this.updateCart();
		}
	},

	updateCart: function() {
		const planSlug = this.props.plans.getSlugFromPath( this.props.planName ),
			planItem = cartItems.getItemForPlan( { product_slug: planSlug }, { isFreeTrial: true } );

		this.addItem( planItem );
	},

	addItem: function( item ) {
		if ( this.isLoading() ) {
			return;
		}

		const selectedSite = this.props.sites.getSelectedSite(),
			emptyCart = cartValues.emptyCart( selectedSite.ID );

		const newCart = cartValues.fillInAllCartItemAttributes(
			cartItems.add( item )( emptyCart ),
			this.props.products.get()
		);

		this.setState( { cart: newCart } );
	},

	isLoading: function() {
		return ! this.props.products.hasLoadedFromServer();
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
