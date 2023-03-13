import { registerStore } from '@wordpress/data';
import * as actions from 'calypso/state/partner-portal/credit-card-form/actions';
import reducer from 'calypso/state/partner-portal/credit-card-form/reducer';
import * as selectors from 'calypso/state/partner-portal/credit-card-form/selectors';

export function createStoredCreditCardPaymentMethodStore(): Record< string, unknown > {
	const store = registerStore( 'credit-card', {
		reducer,
		actions,
		selectors,
	} );

	return { ...store, actions, selectors };
}
