/**
 * External dependencies
 */
import { assign, flow, get, has } from 'lodash';

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
} from 'lib/cart/action-types';
import {
	TRANSACTION_NEW_CREDIT_CARD_DETAILS_SET,
	TRANSACTION_PAYMENT_SET,
} from 'lib/transaction/action-types';
import emitter from 'lib/mixins/emitter';
import cartSynchronizer from './cart-synchronizer';
import PollerPool from 'lib/data-poller';
import { recordEvents, recordUnrecognizedPaymentMethod } from 'lib/analytics/cart';
import productsListFactory from 'lib/products-list';
const productsList = productsListFactory();
import Dispatcher from 'dispatcher';
import {
	applyCoupon,
	removeCoupon,
	fillInAllCartItemAttributes,
	setTaxCountryCode,
	setTaxPostalCode,
	setTaxLocation,
} from 'lib/cart-values';
import {
	addPrivacyToAllDomains,
	removePrivacyFromAllDomains,
	fillGoogleAppsRegistrationData,
	addCartItem,
	addCartItemWithoutReplace,
	removeItemAndDependencies,
	clearCart,
	replaceItem as replaceCartItem,
} from 'lib/cart-values/cart-items';
import wp from 'lib/wp';
import { getReduxStore } from 'lib/redux-bridge';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isUserLoggedIn } from 'state/current-user/selectors';
import { extractStoredCardMetaValue } from 'state/ui/payment/reducer';

const wpcom = wp.undocumented();

let _cartKey = null;
let _synchronizer = null;
let _poller = null;

const CartStore = {
	get() {
		const value = hasLoadedFromServer() ? _synchronizer.getLatestValue() : {};

		return assign( {}, value, {
			hasLoadedFromServer: hasLoadedFromServer(),
			hasPendingServerUpdates: hasPendingServerUpdates(),
		} );
	},
	setSelectedSiteId( selectedSiteId, userLoggedIn = true ) {
		if ( ! userLoggedIn ) {
			return;
		}

		const newCartKey = selectedSiteId || 'no-site';

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

		case TRANSACTION_NEW_CREDIT_CARD_DETAILS_SET:
			{
				// typically set one or the other (or neither)
				const { rawDetails } = action;
				has( rawDetails, 'country' ) && update( setTaxCountryCode( get( rawDetails, 'country' ) ) );
				has( rawDetails, 'postal-code' ) &&
					update( setTaxPostalCode( get( rawDetails, 'postal-code' ) ) );
			}
			break;

		case TRANSACTION_PAYMENT_SET:
			{
				let postalCode, countryCode;

				const paymentMethod = get( action, [ 'payment', 'paymentMethod' ] );
				switch ( paymentMethod ) {
					case 'WPCOM_Billing_MoneyPress_Stored':
						postalCode = extractStoredCardMetaValue( action, 'card_zip' );
						countryCode = extractStoredCardMetaValue( action, 'country_code' );
						break;
					case 'WPCOM_Billing_WPCOM':
						postalCode = null;
						countryCode = null;
						break;
					case 'WPCOM_Billing_Ebanx':
					case 'WPCOM_Billing_Web_Payment':
					case 'WPCOM_Billing_Stripe_Payment_Method': {
						const paymentDetails = get( action, 'payment.newCardDetails', {} );
						postalCode = paymentDetails[ 'postal-code' ];
						countryCode = paymentDetails.country;
						break;
					}
					default:
						recordUnrecognizedPaymentMethod( action );
						postalCode = null;
						countryCode = null;
				}
				update( setTaxLocation( { postalCode, countryCode } ) );
			}
			break;

		case CART_TAX_COUNTRY_CODE_SET:
			update( setTaxCountryCode( action.countryCode ) );
			break;

		case CART_TAX_POSTAL_CODE_SET:
			update( setTaxPostalCode( action.postalCode ) );
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
