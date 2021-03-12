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
	CART_PRIVACY_PROTECTION_ADD,
	CART_PRIVACY_PROTECTION_REMOVE,
	CART_TAX_COUNTRY_CODE_SET,
	CART_TAX_POSTAL_CODE_SET,
	CART_RELOAD,
} from './action-types';
import Dispatcher from 'calypso/dispatcher';

// We need to load the CartStore to make sure the store is registered with the
// dispatcher even though it's not used directly here
import './store';

/**
 * Constants
 */
export function disableCart() {
	Dispatcher.handleViewAction( { type: CART_DISABLE } );
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
	const extendedItems = items.map( ( item ) => {
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
	const extendedItems = items.map( ( item ) => {
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

export function reloadCart() {
	Dispatcher.handleViewAction( { type: CART_RELOAD } );
}
