import config from '@automattic/calypso-config';
import { get } from 'lodash';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import type { AppState } from 'calypso/types';

/**
 * Returns true if the user reached Calypso via the WooPayments onboarding flow.
 * This is indicated by the `from` query argument being set to `woocommerce-payments`.
 * @param  {Object}   state  Global state tree
 * @returns {?boolean}        Whether the user reached Calypso via the WooCommerce Payments flow
 */
export const isWooPaymentsFlow = ( state: AppState ): boolean => {
	const allowedFrom = [ 'woocommerce-payments' ];

	return (
		allowedFrom.includes( get( getInitialQueryArguments( state ), 'from' ) as string ) ||
		allowedFrom.includes( get( getCurrentQueryArguments( state ), 'from' ) as string ) ||
		( config.isEnabled( 'jetpack/magic-link-signup' ) &&
			new URLSearchParams( state.login?.redirectTo?.original ).get( 'from' ) ===
				'woocommerce-payments' )
	);
};

export default isWooPaymentsFlow;
