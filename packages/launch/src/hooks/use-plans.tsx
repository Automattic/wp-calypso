/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { PLANS_STORE } from '../stores';

export const usePlans = function usePlans() {
	const defaultPaidPlan = useSelect( ( select ) => select( PLANS_STORE ).getDefaultPaidPlan() );
	const defaultFreePlan = useSelect( ( select ) => select( PLANS_STORE ).getDefaultFreePlan() );
	const planPrices = useSelect( ( select ) => select( PLANS_STORE ).getPrices( '' ) );

	return { defaultPaidPlan, defaultFreePlan, planPrices };
};
