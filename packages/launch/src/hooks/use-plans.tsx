/**
 * External dependencies
 */
import { useSelect } from '@wordpress/data';
import { useLocale } from '@automattic/i18n-utils';
import type { Plans } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import { PLANS_STORE } from '../stores';
import { usePlanProductFromCart } from './use-cart';

export function usePlans(): {
	defaultPaidPlan: Plans.Plan;
	defaultFreePlan: Plans.Plan;
	planPrices: Record< string, string >;
} {
	const locale = useLocale();

	const defaultPaidPlan = useSelect( ( select ) =>
		select( PLANS_STORE ).getDefaultPaidPlan( locale )
	);
	const defaultFreePlan = useSelect( ( select ) =>
		select( PLANS_STORE ).getDefaultFreePlan( locale )
	);
	const planPrices = useSelect( ( select ) => select( PLANS_STORE ).getPrices( '' ) );

	return { defaultPaidPlan, defaultFreePlan, planPrices };
}

export function usePlanFromCart(): Plans.Plan | undefined {
	const planProductFromCart = usePlanProductFromCart();

	const planSlug = planProductFromCart?.product_slug;

	const plan = useSelect( ( select ) =>
		planSlug ? select( PLANS_STORE ).getPlanBySlug( planSlug ) : undefined
	);

	return plan;
}
