import { registerStore } from '@wordpress/data';
import * as actions from 'calypso/state/partner-portal/credit-card-form/actions';
import reducer from 'calypso/state/partner-portal/credit-card-form/reducer';
import * as selectors from 'calypso/state/partner-portal/credit-card-form/selectors';
import type { DispatchFromMap, SelectFromMap } from '@automattic/data-stores';

export function createStoredCreditCardPaymentMethodStore(): Record< string, unknown > {
	const store = registerStore( 'credit-card', {
		reducer,
		actions,
		selectors,
	} );

	return { ...store, actions, selectors };
}

declare module '@wordpress/data' {
	function dispatch( key: 'credit-card' ): DispatchFromMap< typeof actions >;
	function select( key: 'credit-card' ): SelectFromMap< typeof selectors >;
}
