/**
 * External dependencies
 */
import * as React from 'react';
import { useDispatch, useSelect } from '@wordpress/data';
import { useLocale } from '@automattic/i18n-utils';
import type { Plans } from '@automattic/data-stores';

/**
 * Internal dependencies
 */
import { PLANS_STORE, SITE_STORE } from '../stores';
import LaunchContext from '../context';
import { isPlanProduct } from '../utils';
import type { Product, PlanProduct } from '../utils';

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

export function usePlanProductFromCart(): PlanProduct | undefined {
	const { siteId } = React.useContext( LaunchContext );
	const { getCart } = useDispatch( SITE_STORE );

	const [ planProductFromCart, setPlanProductFromCart ] = React.useState< PlanProduct | undefined >(
		undefined
	);

	React.useEffect( () => {
		( async function () {
			const cart = await getCart( siteId );
			const planProduct = cart.products?.find( ( item: Product ) => isPlanProduct( item ) );
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
