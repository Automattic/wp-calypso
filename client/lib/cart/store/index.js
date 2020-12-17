/**
 * External dependencies
 */
import { assign, flow } from 'lodash';

/**
 * Internal dependencies
 */
import {
	CART_COUPON_APPLY,
	CART_COUPON_REMOVE,
	CART_DISABLE,
	CART_GOOGLE_APPS_REGISTRATION_DATA_ADD,
	CART_ITEM_REMOVE,
	CART_ITEM_REPLACE,
	CART_ITEMS_ADD,
	CART_ITEMS_REPLACE_ALL,
	CART_PRIVACY_PROTECTION_ADD,
	CART_PRIVACY_PROTECTION_REMOVE,
	CART_TAX_COUNTRY_CODE_SET,
	CART_TAX_POSTAL_CODE_SET,
	CART_RELOAD,
} from 'calypso/lib/cart/action-types';
import emitter from 'calypso/lib/mixins/emitter';
import cartSynchronizer from './cart-synchronizer';
import PollerPool from 'calypso/lib/data-poller';
import { recordEvents } from 'calypso/lib/analytics/cart';
import productsListFactory from 'calypso/lib/products-list';
const productsList = productsListFactory();
import Dispatcher from 'calypso/dispatcher';
import {
	applyCoupon,
	removeCoupon,
	fillInAllCartItemAttributes,
	setTaxCountryCode,
	setTaxPostalCode,
} from 'calypso/lib/cart-values';
import {
	addPrivacyToAllDomains,
	removePrivacyFromAllDomains,
	fillGoogleAppsRegistrationData,
	addCartItem,
	addCartItemWithoutReplace,
	removeItemAndDependencies,
	clearCart,
	replaceItem as replaceCartItem,
} from 'calypso/lib/cart-values/cart-items';
import wp from 'calypso/lib/wp';
import { getReduxStore } from 'calypso/lib/redux-bridge';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

const wpcom = wp.undocumented();

let _cartKey = null;
let _synchronizer = null;
let _poller = null;
let _userLoggedIn = true;

const CartStore = {
	get() {
		const value = hasLoadedFromServer() ? _synchronizer.getLatestValue() : {};

		return assign( {}, value, {
			hasLoadedFromServer: hasLoadedFromServer(),
			hasPendingServerUpdates: hasPendingServerUpdates(),
		} );
	},
	setSelectedSiteId( selectedSiteId, userLoggedIn = true ) {
		let newCartKey = selectedSiteId;
		_userLoggedIn = userLoggedIn;
		const urlParams = new URLSearchParams( window.location.search );

		if ( ! newCartKey && window.location.pathname.includes( '/checkout/no-site' ) ) {
			newCartKey = 'no-user';

			if ( _userLoggedIn ) {
				newCartKey = 'no-user' === urlParams.get( 'cart' ) ? 'no-user' : 'no-site';
			}
		}

		if ( _cartKey === newCartKey ) {
			return;
		}

		_cartKey = newCartKey;

		if ( _synchronizer && _poller ) {
			PollerPool.remove( _poller );
			_synchronizer.off( 'change', emitChange );
		}

		_synchronizer = cartSynchronizer( _cartKey, wpcom );
		_synchronizer.on( 'change', emitChange );

		const shouldPollFromLocalStorage =
			'no-user' === newCartKey || 'no-user' === urlParams.get( 'cart' );

		_poller = shouldPollFromLocalStorage
			? PollerPool.add( CartStore, _synchronizer._pollFromLocalStorage.bind( _synchronizer ) )
			: PollerPool.add( CartStore, _synchronizer._poll.bind( _synchronizer ) );
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
	const wrappedFunction = ( cart ) =>
		fillInAllCartItemAttributes( changeFunction( cart ), productsList.get() );

	const previousCart = CartStore.get();
	const nextCart = wrappedFunction( previousCart );

	_synchronizer && _synchronizer.update( wrappedFunction );
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

function fetch() {
	if ( _synchronizer ) {
		_synchronizer.fetch();
	}
}

CartStore.dispatchToken = Dispatcher.register( ( payload ) => {
	const { action } = payload;

	switch ( action.type ) {
		case CART_DISABLE:
			disable();
			break;

		case CART_PRIVACY_PROTECTION_ADD:
			update( addPrivacyToAllDomains( CartStore.get() ) );
			break;

		case CART_PRIVACY_PROTECTION_REMOVE:
			update( removePrivacyFromAllDomains( CartStore.get() ) );
			break;

		case CART_GOOGLE_APPS_REGISTRATION_DATA_ADD:
			update( fillGoogleAppsRegistrationData( CartStore.get(), action.registrationData ) );
			break;

		case CART_ITEMS_ADD:
			update( flow( ...action.cartItems.map( ( cartItem ) => addCartItem( cartItem ) ) ) );
			break;

		case CART_ITEMS_REPLACE_ALL:
			update(
				flow(
					clearCart(),
					...action.cartItems.map( ( cartItem ) => addCartItemWithoutReplace( cartItem ) )
				)
			);
			break;

		case CART_COUPON_APPLY:
			update( applyCoupon( action.coupon ) );
			break;

		case CART_COUPON_REMOVE:
			update( removeCoupon() );
			break;

		case CART_ITEM_REMOVE:
			update(
				removeItemAndDependencies( action.cartItem, CartStore.get(), action.domainsWithPlansOnly )
			);
			break;

		case CART_ITEM_REPLACE:
			update( replaceCartItem( action.oldItem, action.newItem ) );
			break;

		case CART_TAX_COUNTRY_CODE_SET:
			update( setTaxCountryCode( action.countryCode ) );
			break;

		case CART_TAX_POSTAL_CODE_SET:
			update( setTaxPostalCode( action.postalCode ) );
			break;

		case CART_RELOAD:
			fetch();
			break;
	}
} );

export default CartStore;

function createListener( store, selector, callback ) {
	let prevValue = selector( store.getState() );
	return () => {
		const nextValue = selector( store.getState() );

		if ( nextValue !== prevValue ) {
			prevValue = nextValue;
			callback( nextValue );
		}
	};
}

// Subscribe to the Redux store to get updates about the selected site
getReduxStore().then( ( store ) => {
	const userLoggedIn = isUserLoggedIn( store.getState() );
	const selectedSiteId = getSelectedSiteId( store.getState() );
	CartStore.setSelectedSiteId( selectedSiteId, userLoggedIn );
	store.subscribe( createListener( store, getSelectedSiteId, CartStore.setSelectedSiteId ) );
} );
