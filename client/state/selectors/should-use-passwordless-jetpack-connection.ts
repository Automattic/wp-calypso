import { isWooCommerceCoreProfilerFlow } from './is-woocommerce-core-profiler-flow';
import type { AppState } from 'calypso/types';
/**
 * Returns true if the user should see the new passwordless Jetpack connection flow.
 * Users should see this flow if they are:
 *
 * - Reached the page via the WooCommerce Core Profiler flow.
 * - Reached the page via the Woo Payments onboarding flow.
 * @param  {Object}   state  Global state tree
 * @returns {?boolean}        Whether the user should see the new passwordless Jetpack connection or not
 */
export const shouldUsePasswordlessJetpackConnection = ( state: AppState ): boolean => {
	return isWooCommerceCoreProfilerFlow( state );
};

export default shouldUsePasswordlessJetpackConnection;
