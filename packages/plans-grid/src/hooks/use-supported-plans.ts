import { useSelect } from '@wordpress/data';
import { PLANS_STORE } from '../stores';
import type { Plans, PlansSelect } from '@automattic/data-stores';

export const useSupportedPlans = (
	locale: string,
	billingPeriod: Plans.PlanBillingPeriod
): { supportedPlans: Plans.Plan[]; maxAnnualDiscount: number } => {
	const { supportedPlans, annualDiscounts } = useSelect(
		( select ) => {
			const supportedPlans = ( select( PLANS_STORE ) as PlansSelect ).getSupportedPlans( locale );
			const annualDiscounts = supportedPlans
				.map( ( plan ) =>
					( select( PLANS_STORE ) as PlansSelect ).getPlanProduct(
						plan.periodAgnosticSlug,
						billingPeriod
					)
				)
				.map( ( planProduct ) => planProduct?.annualDiscount )
				// ensure that no `undefined` values are passed on
				.filter( ( value ) => !! value ) as number[];
			return { supportedPlans, annualDiscounts };
		},
		[ locale, billingPeriod ]
	);

	// Compute the highest annualDiscount value amongst all supported plans
	const maxAnnualDiscount = annualDiscounts.reduce(
		( acc, current ) => Math.max( acc, current ),
		0
	);

	return { supportedPlans, maxAnnualDiscount };
};
