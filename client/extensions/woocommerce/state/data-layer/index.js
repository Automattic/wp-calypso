/**
 * Internal dependencies
 */

import { mergeHandlers } from 'calypso/state/action-watchers/utils';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import actionList from './action-list';
import coupons from '../sites/coupons/handlers';
import customers from './customers';
import currencies from './data/currencies';
import locations from './data/locations';
import counts from './data/counts';
import orderNotes from './orders/notes';
import orderRefunds from './orders/refunds';
import orders from './orders';
import paymentMethods from './payment-methods';
import products from './products';
import productVariations from './product-variations';
import productCategories from './product-categories';
import promotions from '../sites/promotions/handlers';
import request from './request';
import reviews from '../sites/reviews/handlers';
import reviewReplies from '../sites/review-replies/handlers';
import sendInvoice from './orders/send-invoice';
import settingsGeneral from '../sites/settings/general/handlers';
import shippingZoneLocations from './shipping-zone-locations';
import shippingZoneMethods from './shipping-zone-methods';
import shippingClasses from './shipping-classes';
import shippingZones from './shipping-zones';
import ui from './ui';
import debugFactory from 'debug';

const debug = debugFactory( 'woocommerce:errors' );

const handlers = mergeHandlers(
	actionList,
	counts,
	coupons,
	customers,
	currencies,
	locations,
	orderNotes,
	orderRefunds,
	orders,
	paymentMethods,
	productCategories,
	products,
	productVariations,
	promotions,
	request,
	reviews,
	reviewReplies,
	sendInvoice,
	settingsGeneral,
	shippingZoneLocations,
	shippingZoneMethods,
	shippingZones,
	shippingClasses,
	ui
);

export default function installActionHandlers() {
	const added = registerHandlers( 'woocommerce', handlers );
	if ( ! added ) {
		debug( 'Failed to add action handlers for "woocommerce"' );
	}
}
