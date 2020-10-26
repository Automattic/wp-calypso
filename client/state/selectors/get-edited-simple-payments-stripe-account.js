/**
 * External dependencies
 */
import { get } from 'lodash';

import 'calypso/state/form/init';

export default function getEditedSimplePaymentsStripeAccount( state, formName ) {
	return get( state, [ 'form', formName, 'values', 'stripe_account' ], '' );
}
