/**
 * External dependencies
 */
import { assign, flow, flowRight, partialRight } from 'lodash';

/**
 * Internal dependencies
 */
import cartAnalytics from './cart-analytics';
import cartSynchronizer from './cart-synchronizer';
import Dispatcher from 'dispatcher';
import cartValues from 'lib/cart-values';
import PollerPool from 'lib/data-poller';
import emitter from 'lib/mixins/emitter';
import productsListFactory from 'lib/products-list';
import { action as UpgradesActionTypes } from 'lib/upgrades/constants';

const productsList = productsListFactory();

/**
 * Internal dependencies
 */
let wpcom = require( 'lib/wp' ).undocumented(), applyCoupon = cartValues.applyCoupon, cartItems = cartValues.cartItems;

let _cartKey = null,
	_synchronizer = null,
	_poller = null;

const CartStore = {
	get: function() {
		const value = hasLoadedFromServer() ? _synchronizer.getLatestValue() : {};

		return assign( {}, value, {
			hasLoadedFromServer: hasLoadedFromServer(),
			hasPendingServerUpdates: hasPendingServerUpdates()
		} );
	},
	setSelectedSiteId( selectedSiteId ) {
		if ( selectedSiteId && _cartKey === selectedSiteId ) {
			return;
		}

		if ( ! selectedSiteId ) {
			_cartKey = 'no-site';
		} else {
			_cartKey = selectedSiteId;
		}

		if ( _synchronizer && _poller ) {
			PollerPool.remove( _poller );
			_synchronizer.off( 'change', emitChange );
		}

		_synchronizer = cartSynchronizer( _cartKey, wpcom );
		_synchronizer.on( 'change', emitChange );

		_poller = PollerPool.add( CartStore, _synchronizer._poll.bind( _synchronizer ) );
	}
};

emitter( CartStore );

function hasLoadedFromServer() {
	return ( _synchronizer && _synchronizer.hasLoadedFromServer() );
}

function hasPendingServerUpdates() {
	return ( _synchronizer && _synchronizer.hasPendingServerUpdates() );
}

function emitChange() {
	CartStore.emit( 'change' );
}

function update( changeFunction ) {
	let wrappedFunction,
		previousCart,
		nextCart;

	wrappedFunction = flowRight(
		partialRight( cartValues.fillInAllCartItemAttributes, productsList.get() ),
		changeFunction
	);

	previousCart = CartStore.get();
	nextCart = wrappedFunction( previousCart );

	_synchronizer.update( wrappedFunction );
	cartAnalytics.recordEvents( previousCart, nextCart );
}

function disable() {
	if ( _synchronizer && _poller ) {
		PollerPool.remove( _poller );
		_synchronizer.off( 'change', emitChange );
	}

	_synchronizer = null;
	_poller = null;
	_cartKey = null;
}

CartStore.dispatchToken = Dispatcher.register( ( payload ) => {
	const { action } = payload;

	switch ( action.type ) {
		case UpgradesActionTypes.CART_DISABLE:
			disable();
			break;

		case UpgradesActionTypes.CART_PRIVACY_PROTECTION_ADD:
			update( cartItems.addPrivacyToAllDomains( CartStore.get() ) );
			break;

		case UpgradesActionTypes.CART_PRIVACY_PROTECTION_REMOVE:
			update( cartItems.removePrivacyFromAllDomains( CartStore.get() ) );
			break;

		case UpgradesActionTypes.GOOGLE_APPS_REGISTRATION_DATA_ADD:
			update( cartItems.fillGoogleAppsRegistrationData( CartStore.get(), action.registrationData ) );
			break;

		case UpgradesActionTypes.CART_ITEMS_ADD:
			update( flow( ...action.cartItems.map( cartItem => cartItems.add( cartItem ) ) ) );
			break;

		case UpgradesActionTypes.CART_COUPON_APPLY:
			update( applyCoupon( action.coupon ) );
			break;

		case UpgradesActionTypes.CART_ITEM_REMOVE:
			update( cartItems.removeItemAndDependencies( action.cartItem, CartStore.get(), action.domainsWithPlansOnly ) );
			break;
	}
} );

export default CartStore;
