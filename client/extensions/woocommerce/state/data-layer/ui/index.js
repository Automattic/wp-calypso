/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import products from './products';
import shippingZones from './shipping-zones';

export default mergeHandlers( products, shippingZones );

