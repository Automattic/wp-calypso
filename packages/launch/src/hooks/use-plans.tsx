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
import type { PlanProduct } from '../utils';

export function usePlans(
	billingPeriod: Plans.Plan[ 'billPeriod' ] = 'ANNUALLY'
): {
	defaultPaidPlan: Plans.Plan;
	defaultFreePlan: Plans.Plan;
} {
	const locale = useLocale();

	const defaultPaidPlan = useSelect( ( select ) =>
		select( PLANS_STORE ).getDefaultPaidPlan( locale, billingPeriod )
	);
	const defaultFreePlan = useSelect( ( select ) =>
		select( PLANS_STORE ).getDefaultFreePlan( locale )
	);

	debugger

	return { defaultPaidPlan, defaultFreePlan };
}

export function usePlanProductFromCart(): PlanProduct | undefined {
	const { siteId } = React.useContext( LaunchContext );
	const { getCart } = useDispatch( SITE_STORE );

	const [ planProductFromCart, setPlanProductFromCart ] = React.useState< PlanProduct | undefined >(
		undefined
	);

	React.useEffect( () => {
		( async function () {
			const cart = await getCart( siteId );
			const planProduct = cart.products?.find( ( item: ResponseCartProduct ) =>
				isPlanProduct( item )
			);
			setPlanProductFromCart( planProduct );
		} )();
	}, [ siteId, getCart, setPlanProductFromCart ] );

	return planProductFromCart;
}

export function usePlanFromCart(): Plans.Plan | undefined {
	const planProductFromCart = usePlanProductFromCart();

	const planSlug = planProductFromCart?.product_slug;

	const plan = useSelect( ( select ) =>
		planSlug ? select( PLANS_STORE ).getPlanBySlug( planSlug ) : undefined
	);

	return plan;
}
