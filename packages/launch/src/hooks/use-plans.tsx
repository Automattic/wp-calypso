/**
 * External dependencies
 */
import * as React from 'react';
import { useDispatch, useSelect } from '@wordpress/data';
import { useLocale } from '@automattic/i18n-utils';
import type { Plans } from '@automattic/data-stores';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import { PLANS_STORE, SITE_STORE } from '../stores';
import LaunchContext from '../context';
import { isPlanProduct } from '../utils';
import type { PlanProductForFlow } from '../utils';

export function usePlans(
	billingPeriod: Plans.PlanBillingPeriod = 'ANNUALLY'
): {
	defaultPaidPlan: Plans.Plan | undefined;
	defaultFreePlan: Plans.Plan | undefined;
	defaultFreePlanProduct: Plans.PlanProduct | undefined;
	defaultPaidPlanProduct: Plans.PlanProduct | undefined;
} {
	const locale = useLocale();

	return useSelect(
		( select ) => {
			const plansStore = select( PLANS_STORE );

			const defaultFreePlan = plansStore.getDefaultFreePlan( locale );
			const defaultPaidPlan = plansStore.getDefaultPaidPlan( locale );
			const defaultPaidPlanProduct = plansStore.getPlanProduct(
				defaultPaidPlan?.periodAgnosticSlug,
				billingPeriod
			);
			const defaultFreePlanProduct = plansStore.getPlanProduct(
				defaultFreePlan?.periodAgnosticSlug,
				billingPeriod
			);

			return {
				defaultFreePlan,
				defaultPaidPlan,
				defaultFreePlanProduct,
				defaultPaidPlanProduct,
			};
		},
		[ billingPeriod, locale ]
	);
}

export function usePlanProductFromCart(): PlanProductForFlow | undefined {
	const { siteId } = React.useContext( LaunchContext );
	const { getCart } = useDispatch( SITE_STORE );

	const [ planProductFromCart, setPlanProductFromCart ] = React.useState<
		PlanProductForFlow | undefined
	>( undefined );

	React.useEffect( () => {
		( async function () {
			const cart = await getCart( siteId );
			const planProduct = ( cart.products as ResponseCartProduct[] )?.find(
				( item: ResponseCartProduct ) => isPlanProduct( item )
			) as PlanProductForFlow | undefined;
			setPlanProductFromCart( planProduct );
		} )();
	}, [ siteId, getCart, setPlanProductFromCart ] );

	return planProductFromCart;
}

export function usePlanProductIdFromCart(): number | undefined {
	const planProductFromCart = usePlanProductFromCart();

	const planProductId = planProductFromCart?.product_id;

	return planProductId;
}
