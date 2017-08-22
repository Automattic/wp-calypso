/**
 * External dependencies
 */
import { assign } from 'lodash';

/**
 * Internal dependencies
 */
import { action as ActionTypes } from '../constants';
import Dispatcher from 'dispatcher';
import { cartItems } from 'lib/cart-values';

// We need to load the CartStore to make sure the store is registered with the
// dispatcher even though it's not used directly here
import 'lib/cart/store';

function disableCart() {
	Dispatcher.handleViewAction( { type: ActionTypes.CART_DISABLE } );
}

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

function showCartOnMobile( show ) {
	Dispatcher.handleViewAction( {
		type: ActionTypes.CART_ON_MOBILE_SHOW,
		show,
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

function addItem( item ) {
	addItems( [ item ] );
}

function addItems( items ) {
	const extendedItems = items.map( ( item ) => {
		const extra = assign( {}, item.extra, {
			context: 'calypstore'
		} );
		return assign( {}, item, { extra } );
	} );

	Dispatcher.handleViewAction( {
		type: ActionTypes.CART_ITEMS_ADD,
		cartItems: extendedItems
	} );
}

function removeItem( item, domainsWithPlansOnly ) {
	Dispatcher.handleViewAction( {
		type: ActionTypes.CART_ITEM_REMOVE,
		cartItem: item,
		domainsWithPlansOnly
	} );
}

function addDomainToCart( domainSuggestion ) {
	addItem( cartItems.domainRegistration( {
		domain: domainSuggestion.domain_name,
		productSlug: domainSuggestion.product_slug
	} ) );
}

function addGoogleAppsRegistrationData( registrationData ) {
	Dispatcher.handleViewAction( {
		type: ActionTypes.GOOGLE_APPS_REGISTRATION_DATA_ADD,
		registrationData: registrationData
	} );
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
	addGoogleAppsRegistrationData,
	addItem,
	addItems,
	addPrivacyToAllDomains,
	applyCoupon,
	closeCartPopup,
	disableCart,
	openCartPopup,
	removeDomainFromCart,
	removeItem,
	removePrivacyFromAllDomains,
	showCartOnMobile,
};
