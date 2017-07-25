/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import { addHandlers } from 'state/data-layer/extensions-middleware';
import actionList from './action-list';
import paymentMethods from './payment-methods';
import products from './products';
import productVariations from './product-variations';
// TODO Combine these under /sites/product-categories/handlers, since we want to move to handlers.js files
import productCategories from './product-categories';
import sitesProductCategories from 'woocommerce/state/sites/product-categories/handlers';
import request from './request';
// TODO Combine these under /settings/general/handlers, since we want to move to handlers.js files
import settingsGeneral from './settings-general';
import settingsGeneralHandler from '../sites/settings/general/handlers';
import shippingZoneLocations from './shipping-zone-locations';
import shippingZoneMethods from './shipping-zone-methods';
import shippingZones from './shipping-zones';
import ui from './ui';

const debug = debugFactory( 'woocommerce:errors' );

const handlers = mergeHandlers(
	actionList,
	paymentMethods,
	productCategories,
	sitesProductCategories,
	products,
	productVariations,
	request,
	settingsGeneral,
	settingsGeneralHandler,
	shippingZoneLocations,
	shippingZoneMethods,
	shippingZones,
	ui,
);

export default function installActionHandlers() {
	const added = addHandlers( 'woocommerce', handlers );
	if ( ! added ) {
		debug( 'Failed to add action handlers for "woocommerce"' );
	}
}
