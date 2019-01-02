/** @format */
/**
 * External dependencies
 */
import { assign } from 'lodash';

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
	CART_ITEMS_REPLACE_ALL,
	CART_ON_MOBILE_SHOW,
	CART_POPUP_CLOSE,
	CART_POPUP_OPEN,
	CART_PRIVACY_PROTECTION_ADD,
	CART_PRIVACY_PROTECTION_REMOVE,
	GOOGLE_APPS_REGISTRATION_DATA_ADD,
	CART_TAX_COUNTRY_CODE_SET,
	CART_TAX_POSTAL_CODE_SET,
} from 'lib/upgrades/action-types';
import Dispatcher from 'dispatcher';
import { cartItems } from 'lib/cart-values';

// We need to load the CartStore to make sure the store is registered with the
// dispatcher even though it's not used directly here
import 'lib/cart/store';

export function disableCart() {
	Dispatcher.handleViewAction( { type: CART_DISABLE } );
}

export function openCartPopup( options ) {
	Dispatcher.handleViewAction( {
		type: CART_POPUP_OPEN,
		options: options || {},
	} );
}

export function closeCartPopup() {
	Dispatcher.handleViewAction( {
		type: CART_POPUP_CLOSE,
	} );
}

export function showCartOnMobile( show ) {
	Dispatcher.handleViewAction( {
		type: CART_ON_MOBILE_SHOW,
		show,
	} );
}

export function addPrivacyToAllDomains() {
	Dispatcher.handleViewAction( {
		type: CART_PRIVACY_PROTECTION_ADD,
	} );
}

export function removePrivacyFromAllDomains() {
	Dispatcher.handleViewAction( {
		type: CART_PRIVACY_PROTECTION_REMOVE,
	} );
}

export function addItem( item ) {
	addItems( [ item ] );
}

export function addItems( items ) {
	const extendedItems = items.map( item => {
		const extra = assign( {}, item.extra, {
			context: 'calypstore',
		} );
		return assign( {}, item, { extra } );
	} );

	Dispatcher.handleViewAction( {
		type: CART_ITEMS_ADD,
		cartItems: extendedItems,
	} );
}

export function replaceCartWithItems( items ) {
	const extendedItems = items.map( item => {
		const extra = assign( {}, item.extra, {
			context: 'calypstore',
		} );
		return assign( {}, item, { extra } );
	} );

	Dispatcher.handleViewAction( {
		type: CART_ITEMS_REPLACE_ALL,
		cartItems: extendedItems,
	} );
}

export function removeItem( item, domainsWithPlansOnly ) {
	Dispatcher.handleViewAction( {
		type: CART_ITEM_REMOVE,
		cartItem: item,
		domainsWithPlansOnly,
	} );
}

export function replaceItem( oldItem, newItem ) {
	Dispatcher.handleViewAction( {
		type: CART_ITEM_REPLACE,
		oldItem,
		newItem,
	} );
}

export function addDomainToCart( domainSuggestion ) {
	addItem(
		cartItems.domainRegistration( {
			domain: domainSuggestion.domain_name,
			productSlug: domainSuggestion.product_slug,
		} )
	);
}

export function addGoogleAppsRegistrationData( registrationData ) {
	Dispatcher.handleViewAction( {
		type: GOOGLE_APPS_REGISTRATION_DATA_ADD,
		registrationData: registrationData,
	} );
}

export function removeDomainFromCart( domainSuggestion ) {
	removeItem(
		cartItems.domainRegistration( {
			domain: domainSuggestion.domain_name,
			productSlug: domainSuggestion.product_slug,
		} )
	);
}

export function applyCoupon( coupon ) {
	Dispatcher.handleViewAction( {
		type: CART_COUPON_APPLY,
		coupon,
	} );
}

export function removeCoupon() {
	Dispatcher.handleViewAction( {
		type: CART_COUPON_REMOVE,
	} );
}

export function setTaxCountryCode( countryCode ) {
	Dispatcher.handleViewAction( {
		type: CART_TAX_COUNTRY_CODE_SET,
		countryCode,
	} );
}

export function setTaxPostalCode( postalCode ) {
	Dispatcher.handleViewAction( {
		type: CART_TAX_POSTAL_CODE_SET,
		postalCode,
	} );
}
