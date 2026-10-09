import {
	isDotComPlan,
	isFreeHostingTrial,
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
} from '@automattic/calypso-products';
import { useViewportMatch } from '@wordpress/compose';
import { getCurrentQueryParams } from 'calypso/landing/stepper/utils/get-current-query-params';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

export function hasPurchaseStepsParameter( query: URLSearchParams ): boolean {
	return query.get( 'showPurchaseSteps' ) === 'true';
}

export function hasPreselectedPurchasePlan(
	query: URLSearchParams,
	planCartItem: MinimalRequestCartProduct | null | undefined
): boolean {
	const plan = query.get( 'plan' );
	return (
		hasPurchaseStepsParameter( query ) &&
		!! plan &&
		isDotComPlan( { product_slug: plan } ) &&
		! isFreeHostingTrial( plan ) &&
		plan !== PLAN_ECOMMERCE_TRIAL_MONTHLY &&
		planCartItem?.product_slug === plan
	);
}

// Desktop uses the progress overview; mobile keeps the top-bar step counter.
export function useShowOnboardingProgress( isOnboardingFlow: boolean ): boolean {
	const isDesktop = useViewportMatch( 'large' );
	return ( isOnboardingFlow || hasPurchaseStepsParameter( getCurrentQueryParams() ) ) && isDesktop;
}
