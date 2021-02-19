/**
 * Internal dependencies
 */

import { combineReducers, keyedReducer } from 'calypso/state/utils';
import coupons from './coupons/reducer';
import customers from './customers/reducer';
import data from './data/reducer';
import meta from './meta/reducer';
import orders from './orders/reducer';
import paymentMethods from './payment-methods/reducer';
import productCategories from './product-categories/reducer';
import products from './products/reducer';
import productVariations from './product-variations/reducer';
import promotions from './promotions/reducer';
import reviews from './reviews/reducer';
import reviewReplies from './review-replies/reducer';
import setupChoices from './setup-choices/reducer';
import shippingMethods from './shipping-methods/reducer';
import shippingZoneLocations from './shipping-zone-locations/reducer';
import shippingZoneMethods from './shipping-zone-methods/reducer';
import shippingZones from './shipping-zones/reducer';
import settings from './settings/reducer';
import status from './status/reducer';
import shippingClasses from './shipping-classes/reducers';

const reducer = combineReducers( {
	coupons,
	customers,
	data,
	meta,
	orders,
	paymentMethods,
	productCategories,
	products,
	productVariations,
	promotions,
	reviews,
	reviewReplies,
	setupChoices,
	settings,
	shippingClasses,
	shippingMethods,
	shippingZoneLocations,
	shippingZoneMethods,
	shippingZones,
	status,
} );

export default keyedReducer( 'siteId', reducer );
