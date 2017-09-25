/**
 * Internal dependencies
 */
import coupons from './coupons/reducer';
import currencies from './currencies/reducer';
import locations from './locations/reducer';
import meta from './meta/reducer';
import orders from './orders/reducer';
import paymentMethods from './payment-methods/reducer';
import productCategories from './product-categories/reducer';
import productVariations from './product-variations/reducer';
import products from './products/reducer';
import reviewReplies from './review-replies/reducer';
import reviews from './reviews/reducer';
import settings from './settings/reducer';
import setupChoices from './setup-choices/reducer';
import shippingMethods from './shipping-methods/reducer';
import shippingZoneLocations from './shipping-zone-locations/reducer';
import shippingZoneMethods from './shipping-zone-methods/reducer';
import shippingZones from './shipping-zones/reducer';
import status from './status/reducer';
import { combineReducers, keyedReducer } from 'state/utils';

const reducer = combineReducers( {
	coupons,
	currencies,
	locations,
	meta,
	orders,
	paymentMethods,
	productCategories,
	products,
	productVariations,
	reviews,
	reviewReplies,
	setupChoices,
	settings,
	shippingMethods,
	shippingZoneLocations,
	shippingZoneMethods,
	shippingZones,
	status,
} );

export default keyedReducer( 'siteId', reducer );
