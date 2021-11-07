import { useLocale } from '@automattic/i18n-utils';
import { useDispatch, useSelect } from '@wordpress/data';
import { useContext, useState, useEffect } from 'react';
import LaunchContext from '../context';
import { PLANS_STORE, SITE_STORE } from '../stores';
import { isPlanProduct } from '../utils';
import type { PlanProductForFlow } from '../utils';
import type { Plans } from '@automattic/data-stores';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

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
	const { siteId } = useContext( LaunchContext );
	const { getCart } = useDispatch( SITE_STORE );

	const [ planProductFromCart, setPlanProductFromCart ] = useState<
		PlanProductForFlow | undefined
	>( undefined );

	useEffect( () => {
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
