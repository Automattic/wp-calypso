/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import general from './general/reducer';
import products from './products/reducer';
import stripeConnectAccount from './StripeConnectAccount/reducer';
import tax from './tax/reducer';

export default combineReducers( {
	general,
	products,
	stripeConnectAccount,
	tax,
} );
