/**
 * Internal dependencies
 */

import { combineReducers } from 'calypso/state/utils';
import general from './general/reducer';
import products from './products/reducer';
import stripeConnectAccount from './stripe-connect-account/reducer';
import tax from './tax/reducer';
import mailchimp from './mailchimp/reducer';
import email from './email/reducer';

export default combineReducers( {
	general,
	products,
	stripeConnectAccount,
	tax,
	mailchimp,
	email,
} );
