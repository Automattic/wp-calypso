/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

export default function getEditedSimplePaymentsStripeAccount( state, formName ) {
	return get( state, [ 'form', formName, 'values', 'stripe_account' ], '' );
}
