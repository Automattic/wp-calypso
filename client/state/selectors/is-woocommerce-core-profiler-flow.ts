import { get } from 'lodash';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import type { AppState } from 'calypso/types';

/**
 * Returns true if the user reached Calypso via the WooCommerce Core Profiler flow.
 * This is indicated by the `from` query argument being set to `woocommerce-core-profiler`.
 * @param  {Object}   state  Global state tree
 * @returns {?boolean}        Whether the user reached Calypso via the WooCommerce Core Profiler flow
 */
export const isWooCommerceCoreProfilerFlow = ( state: AppState ): boolean => {
	const allowedFrom = [ 'woocommerce-core-profiler' ];
	return (
		allowedFrom.includes( get( getInitialQueryArguments( state ), 'from' ) as string ) ||
		allowedFrom.includes( get( getCurrentQueryArguments( state ), 'from' ) as string ) ||
		new URLSearchParams( state.login?.redirectTo?.original ).get( 'from' ) ===
			'woocommerce-core-profiler'
	);
};

export default isWooCommerceCoreProfilerFlow;
