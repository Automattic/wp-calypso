/** @foramt */

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import sourcePayment from './source-payment/reducer';

export default combineReducers( {
	sourcePayment,
} );

