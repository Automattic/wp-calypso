/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import { addHandlers } from 'state/data-layer/extensions-middleware';
import actionList from './action-list';
import coupons from '../sites/coupons/handlers';
import paymentMethods from './payment-methods';
import products from './products';
import productVariations from './product-variations';
import productCategories from './product-categories';
import promotions from '../sites/promotions/handlers';
import request from './request';
import reviews from '../sites/reviews/handlers';
import reviewReplies from '../sites/review-replies/handlers';
import settingsGeneral from '../sites/settings/general/handlers';
import shippingZoneLocations from './shipping-zone-locations';
import shippingZoneMethods from './shipping-zone-methods';
import shippingZones from './shipping-zones';
import stripeConnectAccount from '../sites/settings/stripe-connect-account/handlers';
import ui from './ui';
import debugFactory from 'debug';

const debug = debugFactory( 'woocommerce:errors' );

const handlers = mergeHandlers(
	actionList,
	coupons,
	paymentMethods,
	productCategories,
	products,
	productVariations,
	promotions,
	request,
	reviews,
	reviewReplies,
	settingsGeneral,
	shippingZoneLocations,
	shippingZoneMethods,
	shippingZones,
	stripeConnectAccount,
	ui,
);

export default function installActionHandlers() {
	const added = addHandlers( 'woocommerce', handlers );
	if ( ! added ) {
		debug( 'Failed to add action handlers for "woocommerce"' );
	}
}
