/** @format */

/**
 * Internal dependencies
 */

import { mergeHandlers } from 'state/action-watchers/utils';
import payments from './payments';
import products from './products';
import shippingZones from './shipping-zones';
import shippingClasses from './shipping-classes';
import woocommerceServices from './woocommerce-services';

export default mergeHandlers(
	payments,
	products,
	shippingZones,
	woocommerceServices,
	shippingClasses
);
