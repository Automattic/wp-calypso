/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';
import { useLocale } from '@automattic/i18n-utils';

/**
 * Internal dependencies
 */
import { PLANS_STORE } from '../stores';

export const usePlans = function usePlans() {
	const locale = useLocale();

	const defaultPaidPlan = useSelect( ( select ) =>
		select( PLANS_STORE ).getDefaultPaidPlan( locale )
	);
	const defaultFreePlan = useSelect( ( select ) =>
		select( PLANS_STORE ).getDefaultFreePlan( locale )
	);
	const planPrices = useSelect( ( select ) => select( PLANS_STORE ).getPrices( '' ) );

	return { defaultPaidPlan, defaultFreePlan, planPrices };
};
