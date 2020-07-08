/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { LAUNCH_STORE, PLANS_STORE } from '../stores';

export function useSelectedPlan() {
	const { domain, plan } = useSelect( ( select ) => select( LAUNCH_STORE ).getState() );

	const defaultPaidPlan = useSelect( ( select ) => {
		return select( PLANS_STORE ).getDefaultPaidPlan();
	} );

	if ( domain && ! domain?.is_free && ! plan ) {
		return defaultPaidPlan;
	}

	// TODO: Switch to paid plan when use switch to paid domain.

	return plan;
}
