/**
 * Internal dependencies
 */
import general from './general/reducer';
import products from './products/reducer';
import stripeConnectAccount from './stripe-connect-account/reducer';
import tax from './tax/reducer';
import { combineReducers } from 'state/utils';

export default combineReducers( {
	general,
	products,
	stripeConnectAccount,
	tax,
} );
