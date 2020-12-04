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
	CART_RELOAD,
} from './action-types';
import Dispatcher from 'calypso/dispatcher';
import { MARKETING_COUPONS_KEY } from 'calypso/lib/analytics/utils';
import { TRUENAME_COUPONS } from 'calypso/lib/domains';

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
	let coupons = null;
	try {
		const couponsJson = window.localStorage.getItem( MARKETING_COUPONS_KEY );
		coupons = JSON.parse( couponsJson );
	} catch ( err ) {}
	if ( ! coupons ) {
		debug( 'No coupons found in localStorage: ', coupons );
		return null;
	}
	const ALLOWED_COUPON_CODE_LIST = [
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
		...TRUENAME_COUPONS,
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
	try {
		debug( 'Storing coupons in localStorage: ', coupons );
		window.localStorage.setItem( MARKETING_COUPONS_KEY, JSON.stringify( coupons ) );
	} catch ( err ) {}

	if (
		ALLOWED_COUPON_CODE_LIST.includes(
			mostRecentCouponCode?.includes( '_' )
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

export function reloadCart() {
	Dispatcher.handleViewAction( { type: CART_RELOAD } );
}
