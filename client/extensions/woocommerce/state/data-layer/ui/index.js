/**
 * Internal dependencies
 */
import payments from './payments';
import products from './products';
import shippingZones from './shipping-zones';
import woocommerceServices from './woocommerce-services';
import { mergeHandlers } from 'state/action-watchers/utils';

export default mergeHandlers( payments, products, shippingZones, woocommerceServices );

