
/**
 * External dependencies
 */
import extend from 'lodash/object/assign';
import forEach from 'lodash/collection/forEach';
import partialRight from 'lodash/function/partialRight';
import compose from 'lodash/function/compose';
import { EventEmitter } from 'events';

/**
 * Internal dependencies
 */
import sitesList from 'lib/sites-list';
import wp from 'lib/wp';
import cartValues from 'lib/cart-values';
import cartSynchronizer from 'lib/cart/store/cart-synchronizer';
import cartAnalytics from 'lib/cart/store/cart-analytics';
import productsList from 'lib/products-list';

const sites = sitesList(),
	wpcom = wp.undocumented(),
	cartItems = cartValues.cartItems;

class CartStore extends EventEmitter {

	constructor( siteID, initialValue ) {
		super();
		this.initialValue = initialValue;
		this.synchronizer = cartSynchronizer( siteID, wpcom );
	}

	get() {
		var value = this.hasLoadedFromServer() ? this.synchronizer.getLatestValue() : this.initialValue;
		return extend( {}, value, {
			hasLoadedFromServer: this.hasLoadedFromServer(),
			hasPendingServerUpdates: this.hasPendingServerUpdates(),
			temporary: true
		} );
	}

	hasLoadedFromServer() {
		return ( this.synchronizer && this.synchronizer.hasLoadedFromServer() );
	}

	hasPendingServerUpdates() {
		return ( this.synchronizer && this.synchronizer.hasPendingServerUpdates() );
	}

	addToCart( newItems ) {
		if ( ! Array.isArray( newItems ) ) {
			newItems = [ newItems ];
		}

		let cartStore = this;
		forEach( newItems, function( cartItem ) {
			cartStore.update( cartItems.add( cartItem ) );
		} );
	}

	update( changeFunction ) {
		const wrappedFunction = compose(
				partialRight( cartValues.fillInAllCartItemAttributes, productsList.get() ),
				changeFunction
			),
			previousCart = this.get(),
			nextCart = wrappedFunction( previousCart );

		this.synchronizer.update( wrappedFunction );
		cartAnalytics.recordEvents( previousCart, nextCart );
	}
}

export default function createCartStore( cartData ) {
	return new CartStore( sites.selectedSite.ID, cartData );
};
