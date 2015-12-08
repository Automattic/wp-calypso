/**
 * External dependencies
 */
import assign from 'lodash/object/assign';

/**
 * Internal dependencies
 */
import { action as ActionTypes } from '../constants';
import Dispatcher from 'dispatcher';
import { cartItems } from 'lib/cart-values';

// We need to load the CartStore to make sure the store is registered with the
// dispatcher even though it's not used directly here
import 'lib/cart/store';

function openCartPopup( options ) {
	Dispatcher.handleViewAction( {
		type: ActionTypes.CART_POPUP_OPEN,
		options: options || {}
	} );
}

function closeCartPopup() {
	Dispatcher.handleViewAction( {
		type: ActionTypes.CART_POPUP_CLOSE
	} );
}

function addPrivacyToAllDomains() {
	Dispatcher.handleViewAction( {
		type: ActionTypes.CART_PRIVACY_PROTECTION_ADD
	} );
}

function removePrivacyFromAllDomains() {
	Dispatcher.handleViewAction( {
		type: ActionTypes.CART_PRIVACY_PROTECTION_REMOVE
	} );
}

function addItem( cartItem ) {
	const extra = assign( {}, cartItem.extra, {
			context: 'calypstore'
		} ),
		newCartItem = assign( {}, cartItem, { extra } );

	Dispatcher.handleViewAction( {
		type: ActionTypes.CART_ITEM_ADD,
		cartItem: newCartItem
	} );
}

function removeItem( cartItem ) {
	Dispatcher.handleViewAction( {
		type: ActionTypes.CART_ITEM_REMOVE,
		cartItem
	} );
}

function addDomainToCart( domainSuggestion ) {
	addItem( cartItems.domainRegistration( {
		domain: domainSuggestion.domain_name,
		productSlug: domainSuggestion.product_slug
	} ) );
}

function removeDomainFromCart( domainSuggestion ) {
	removeItem( cartItems.domainRegistration( {
		domain: domainSuggestion.domain_name,
		productSlug: domainSuggestion.product_slug
	} ) );
}

function applyCoupon( coupon ) {
	Dispatcher.handleViewAction( {
		type: ActionTypes.CART_COUPON_APPLY,
		coupon
	} );
}

export {
	addDomainToCart,
	addItem,
	addPrivacyToAllDomains,
	applyCoupon,
	closeCartPopup,
	openCartPopup,
	removeDomainFromCart,
	removeItem,
	removePrivacyFromAllDomains
};
