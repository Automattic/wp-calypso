/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import { addHandlers } from 'state/data-layer/extensions-middleware';
import actionList from './action-list';
import products from './products';
import productVariations from './product-variations';
import productCategories from './product-categories';
import request from './request';
import shippingZones from './shipping-zones';
import ui from './ui';
import debugFactory from 'debug';

const debug = debugFactory( 'woocommerce:errors' );

const handlers = mergeHandlers(
	actionList,
	productCategories,
	products,
	productVariations,
	request,
	shippingZones,
	ui,
);

export default function installActionHandlers() {
	const added = addHandlers( 'woocommerce', handlers );
	if ( ! added ) {
		debug( 'Failed to add action handlers for "woocommerce"' );
	}
}

