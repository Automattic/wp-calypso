/**
 * External dependencies
 */
import { assign } from 'lodash';
import debugModule from 'debug';

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
	CART_GOOGLE_APPS_REGISTRATION_DATA_ADD,
	CART_TAX_COUNTRY_CODE_SET,
	CART_TAX_POSTAL_CODE_SET,
} from './action-types';
import Dispatcher from 'dispatcher';
import { MARKETING_COUPONS_KEY } from 'lib/analytics/utils';

// We need to load the CartStore to make sure the store is registered with the
// dispatcher even though it's not used directly here
import './store';

/**
 * Constants
 */
const debug = debugModule( 'calypso:signup:cart' );

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

export function addGoogleAppsRegistrationData( registrationData ) {
	Dispatcher.handleViewAction( {
		type: CART_GOOGLE_APPS_REGISTRATION_DATA_ADD,
		registrationData: registrationData,
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

export function getRememberedCoupon() {
	// read coupon list from localStorage, return early if it's not there
	const couponsJson = localStorage.getItem( MARKETING_COUPONS_KEY );
	const coupons = JSON.parse( couponsJson );
	if ( ! coupons ) {
		debug( 'No coupons found in localStorage: ', coupons );
		return null;
	}
	const COUPON_CODE_WHITELIST = [
		'ALT',
		'FBSAVE15',
		'FIVERR',
		'GENEA',
		'KITVISA',
		'LINKEDIN',
		'PATREON',
		'ROCKETLAWYER',
		'RBC',
		'SAFE',
		'SBDC',
		'TXAM',
	];
	const THIRTY_DAYS_MILLISECONDS = 30 * 24 * 60 * 60 * 1000;
	const now = Date.now();
	debug( 'Found coupons in localStorage: ', coupons );

	// delete coupons if they're older than thirty days; find the most recent one
	let mostRecentTimestamp = 0;
	let mostRecentCouponCode = null;
	Object.keys( coupons ).forEach( ( key ) => {
		if ( now > coupons[ key ] + THIRTY_DAYS_MILLISECONDS ) {
			delete coupons[ key ];
		} else if ( coupons[ key ] > mostRecentTimestamp ) {
			mostRecentCouponCode = key;
			mostRecentTimestamp = coupons[ key ];
		}
	} );

	// write remembered coupons back to localStorage
	debug( 'Storing coupons in localStorage: ', coupons );
	localStorage.setItem( MARKETING_COUPONS_KEY, JSON.stringify( coupons ) );
	if (
		COUPON_CODE_WHITELIST.includes(
			-1 !== mostRecentCouponCode.indexOf( '_' )
				? mostRecentCouponCode.substring( 0, mostRecentCouponCode.indexOf( '_' ) )
				: mostRecentCouponCode
		)
	) {
		debug( 'returning coupon code:', mostRecentCouponCode );
		return mostRecentCouponCode;
	}
	debug( 'not returning any coupon code.' );
	return null;
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
