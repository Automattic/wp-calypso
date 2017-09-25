/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import coupons from '../sites/coupons/handlers';
import reviewReplies from '../sites/review-replies/handlers';
import reviews from '../sites/reviews/handlers';
import settingsGeneral from '../sites/settings/general/handlers';
import stripeConnectAccount from '../sites/settings/stripe-connect-account/handlers';
import actionList from './action-list';
import paymentMethods from './payment-methods';
import productCategories from './product-categories';
import productVariations from './product-variations';
import products from './products';
import request from './request';
import shippingZoneLocations from './shipping-zone-locations';
import shippingZoneMethods from './shipping-zone-methods';
import shippingZones from './shipping-zones';
import ui from './ui';
import { mergeHandlers } from 'state/action-watchers/utils';
import { addHandlers } from 'state/data-layer/extensions-middleware';

const debug = debugFactory( 'woocommerce:errors' );

const handlers = mergeHandlers(
	actionList,
	coupons,
	paymentMethods,
	productCategories,
	products,
	productVariations,
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
