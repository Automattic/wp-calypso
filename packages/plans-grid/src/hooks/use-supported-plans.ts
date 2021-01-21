/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';
import type { Plans } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import { PLANS_STORE } from '../constants';

export const useSupportedPlans = (
	locale: string,
	billingPeriod: Plans.PlanBillingPeriod
): { supportedPlans: Plans.Plan[]; maxAnnualDiscount: number } => {
	const { supportedPlans, annualDiscounts } = useSelect( ( select ) => {
		const supportedPlans = select( PLANS_STORE ).getSupportedPlans( locale );
		const annualDiscounts = supportedPlans
			.map( ( plan ) =>
				select( PLANS_STORE ).getPlanProduct( plan.periodAgnosticSlug, billingPeriod )
			)
			.map( ( planProduct ) => planProduct?.annualDiscount )
			// ensure that no `undefiend` values are passed on
			.filter( ( value ) => !! value ) as number[];
		return { supportedPlans, annualDiscounts };
	} );

	// Compute the highest annualDiscount value amongst all supported plans
	const maxAnnualDiscount = annualDiscounts.reduce(
		( acc, current ) => Math.max( acc, current ),
		0
	);

	return { supportedPlans, maxAnnualDiscount };
};
