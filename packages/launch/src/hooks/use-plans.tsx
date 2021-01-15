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

export function usePlans(): {
	defaultPaidPlan: Plans.Plan | undefined;
	defaultFreePlan: Plans.Plan | undefined;
} {
	const locale = useLocale();

	const defaultPaidPlan = useSelect( ( select ) =>
		select( PLANS_STORE ).getDefaultPaidPlan( locale )
	);

	const defaultFreePlan = useSelect( ( select ) =>
		select( PLANS_STORE ).getDefaultFreePlan( locale )
	);

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

export function usePlanProductIdFromCart(): number | undefined {
	const planProductFromCart = usePlanProductFromCart();

	const planProductId = planProductFromCart?.product_id;

	return planProductId;
}
