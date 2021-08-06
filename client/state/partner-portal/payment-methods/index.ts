/**
 * External dependencies
 */
import { registerStore } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import reducer from 'calypso/state/partner-portal/payment-methods/reducer';
import * as actions from 'calypso/state/partner-portal/payment-methods/actions';
import * as selectors from 'calypso/state/partner-portal/payment-methods/selectors';

export function createStoredCreditCardPaymentMethodStore(): Record< string, unknown > {
	const store = registerStore( 'credit-card', {
		reducer,
		actions,
		selectors,
	} );

	return { ...store, actions, selectors };
}
