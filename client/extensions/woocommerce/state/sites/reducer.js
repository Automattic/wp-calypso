/**
 * Internal dependencies
 */
import { combineReducers, keyedReducer } from 'state/utils';
import paymentMethods from './payment-methods/reducer';
import productCategories from './product-categories/reducer';
import products from './products/reducer';
import setupChoices from './setup-choices/reducer';
import shippingMethods from './shipping-methods/reducer';
import shippingZoneMethods from './shipping-zone-methods/reducer';
import shippingZones from './shipping-zones/reducer';
import settings from './settings/reducer';
import status from './status/reducer';

const reducer = combineReducers( {
	paymentMethods,
	productCategories,
	products,
	setupChoices,
	settings,
	shippingMethods,
	shippingZoneMethods,
	shippingZones,
	status,
} );

export default keyedReducer( 'siteId', reducer );
