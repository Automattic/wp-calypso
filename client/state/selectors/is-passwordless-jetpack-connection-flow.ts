import { get } from 'lodash';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import { isWooCommerceCoreProfilerFlow } from './is-woocommerce-core-profiler-flow';
import type { AppState } from 'calypso/types';

const isWooCommercePaymentsOnboardingFlow = ( state: AppState ): boolean => {
	return (
		( get( getInitialQueryArguments( state ), 'from' ) === 'woocommerce-payments' ||
			get( getCurrentQueryArguments( state ), 'from' ) === 'woocommerce-payments' ) &&
		( get( getInitialQueryArguments( state ), 'plugin_name' ) === 'woocommerce-payments' ||
			get( getCurrentQueryArguments( state ), 'plugin_name' ) === 'woocommerce-payments' )
	);
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
export const isPasswordlessJetpackConnectionFlow = ( state: AppState ): boolean => {
	return isWooCommerceCoreProfilerFlow( state ) || isWooCommercePaymentsOnboardingFlow( state );
};

export default isPasswordlessJetpackConnectionFlow;
