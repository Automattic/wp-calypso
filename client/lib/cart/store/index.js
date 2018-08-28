/** @format */
/**
 * External dependencies
 */
import { assign, flow, flowRight, partialRight } from 'lodash';

/**
 * Internal dependencies
 */
import {
	CART_COUPON_APPLY,
	CART_COUPON_REMOVE,
	CART_DISABLE,
	CART_ITEM_REMOVE,
	CART_ITEM_REPLACE,
	CART_ITEMS_ADD,
	CART_PRIVACY_PROTECTION_ADD,
	CART_PRIVACY_PROTECTION_REMOVE,
	GOOGLE_APPS_REGISTRATION_DATA_ADD,
} from 'lib/upgrades/action-types';
import emitter from 'lib/mixins/emitter';
import cartSynchronizer from './cart-synchronizer';
import PollerPool from 'lib/data-poller';
import { recordEvents } from './cart-analytics';
import productsListFactory from 'lib/products-list';
const productsList = productsListFactory();
import Dispatcher from 'dispatcher';
import { applyCoupon, removeCoupon, cartItems, fillInAllCartItemAttributes } from 'lib/cart-values';
import wp from 'lib/wp';

const wpcom = wp.undocumented();

let _cartKey = null;
let _synchronizer = null;
let _poller = null;

const CartStore = {
	get: function() {
		const value = hasLoadedFromServer() ? _synchronizer.getLatestValue() : {};

		return assign( {}, value, {
			hasLoadedFromServer: hasLoadedFromServer(),
			hasPendingServerUpdates: hasPendingServerUpdates(),
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
	},
};

emitter( CartStore );

function hasLoadedFromServer() {
	return _synchronizer && _synchronizer.hasLoadedFromServer();
}

function hasPendingServerUpdates() {
	return _synchronizer && _synchronizer.hasPendingServerUpdates();
}

function emitChange() {
	CartStore.emit( 'change' );
}

function update( changeFunction ) {
	const wrappedFunction = flowRight(
		partialRight( fillInAllCartItemAttributes, productsList.get() ),
		changeFunction
	);

	const previousCart = CartStore.get();
	const nextCart = wrappedFunction( previousCart );

	_synchronizer.update( wrappedFunction );
	recordEvents( previousCart, nextCart );
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

CartStore.dispatchToken = Dispatcher.register( payload => {
	const { action } = payload;

	switch ( action.type ) {
		case CART_DISABLE:
			disable();
			break;

		case CART_PRIVACY_PROTECTION_ADD:
			update( cartItems.addPrivacyToAllDomains( CartStore.get() ) );
			break;

		case CART_PRIVACY_PROTECTION_REMOVE:
			update( cartItems.removePrivacyFromAllDomains( CartStore.get() ) );
			break;

		case GOOGLE_APPS_REGISTRATION_DATA_ADD:
			update(
				cartItems.fillGoogleAppsRegistrationData( CartStore.get(), action.registrationData )
			);
			break;

		case CART_ITEMS_ADD:
			update( flow( ...action.cartItems.map( cartItem => cartItems.add( cartItem ) ) ) );
			break;

		case CART_COUPON_APPLY:
			update( applyCoupon( action.coupon ) );
			break;

		case CART_COUPON_REMOVE:
			update( removeCoupon() );
			break;

		case CART_ITEM_REMOVE:
			update(
				cartItems.removeItemAndDependencies(
					action.cartItem,
					CartStore.get(),
					action.domainsWithPlansOnly
				)
			);
			break;

		case CART_ITEM_REPLACE:
			update( cartItems.replaceItem( action.oldItem, action.newItem ) );
			break;
	}
} );

export default CartStore;
