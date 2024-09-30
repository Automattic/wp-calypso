import config from '@automattic/calypso-config';
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
	const isCoreProfiler =
		get( getInitialQueryArguments( state ), 'from' ) === 'woocommerce-core-profiler' ||
		get( getCurrentQueryArguments( state ), 'from' ) === 'woocommerce-core-profiler';

	const allowedPluginNames = [ 'woocommerce-payment' ];
	const isPluginNameAllowed =
		allowedPluginNames.includes(
			get( getInitialQueryArguments( state ), 'plugin_name' ) as string
		) ||
		allowedPluginNames.includes(
			get( getCurrentQueryArguments( state ), 'plugin_name' ) as string
		);

	return (
		isCoreProfiler ||
		isPluginNameAllowed ||
		( config.isEnabled( 'woocommerce/core-profiler-passwordless-auth' ) &&
			new URLSearchParams( state.login?.redirectTo?.original ).get( 'from' ) ===
				'woocommerce-core-profiler' )
	);
};

export default isWooCommerceCoreProfilerFlow;
