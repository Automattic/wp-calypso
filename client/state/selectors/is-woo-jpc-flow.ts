import { get } from 'lodash';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import { isWooCommerceCoreProfilerFlow } from './is-woocommerce-core-profiler-flow';
import type { AppState } from 'calypso/types';

const isWooCommercePaymentsOnboardingFlow = ( state: AppState ): boolean => {
	const from =
		get( getInitialQueryArguments( state ), 'from' ) === 'woocommerce-payments' ||
		get( getCurrentQueryArguments( state ), 'from' ) === 'woocommerce-payments';

	const redirectTo =
		get( getInitialQueryArguments( state ), 'redirect_to' ) ||
		get( getCurrentQueryArguments( state ), 'redirect_to' );

	// Unlike WooCommerce Core Profiler flow, we use both `from` and `plugin_name` to determine if the user is in the Woo Payments onboarding flow.
	// `plugin_name` might not present in the query arguments, so we need to check the `redirect_to` query argument as well.
	const redirectToHasWooCommercePayments =
		typeof redirectTo === 'string' &&
		( () => {
			try {
				return new URLSearchParams( redirectTo ).get( 'plugin_name' ) === 'woocommerce-payments';
			} catch {
				return false;
			}
		} )();

	const plugin =
		get( getInitialQueryArguments( state ), 'plugin_name' ) === 'woocommerce-payments' ||
		get( getCurrentQueryArguments( state ), 'plugin_name' ) === 'woocommerce-payments' ||
		redirectToHasWooCommercePayments;

	return from && plugin;
};
/**
 * Returns true if the user should see the new passwordless Jetpack connection flow.
 * Users should see this flow if they are:
 *
 * - Reached the page via the WooCommerce Core Profiler flow.
 * - Reached the page via the Woo Payments onboarding flow.
 * @param  {Object}   state  Global state tree
 * @returns {?boolean}        Whether the user should see the new passwordless Jetpack connection or not
 */
export const isWooJPCFlow = ( state: AppState ): boolean => {
	return isWooCommerceCoreProfilerFlow( state ) || isWooCommercePaymentsOnboardingFlow( state );
};

export default isWooJPCFlow;
