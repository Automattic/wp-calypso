/** @format */
/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import payments from './payments';
import products from './products';
import shippingZones from './shipping-zones';

export default mergeHandlers( payments, products, shippingZones );
