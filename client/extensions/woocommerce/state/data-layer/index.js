/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import { addHandlers } from 'state/data-layer/extensions-middleware';
import actionList from './action-list';
import paymentMethods from './payment-methods';
import products from './products';
import productVariations from './product-variations';
import productCategories from './product-categories';
import request from './request';
import reviews from '../sites/reviews/handlers';
import settingsGeneral from '../sites/settings/general/handlers';
import shippingZoneLocations from './shipping-zone-locations';
import shippingZoneMethods from './shipping-zone-methods';
import shippingZones from './shipping-zones';
import stripeConnect from '../sites/stripeConnect/handlers';
import ui from './ui';
import debugFactory from 'debug';

const debug = debugFactory( 'woocommerce:errors' );

const handlers = mergeHandlers(
	actionList,
	paymentMethods,
	productCategories,
	products,
	productVariations,
	request,
	reviews,
	settingsGeneral,
	shippingZoneLocations,
	shippingZoneMethods,
	shippingZones,
	stripeConnect,
	ui,
);

export default function installActionHandlers() {
	const added = addHandlers( 'woocommerce', handlers );
	if ( ! added ) {
		debug( 'Failed to add action handlers for "woocommerce"' );
	}
}
