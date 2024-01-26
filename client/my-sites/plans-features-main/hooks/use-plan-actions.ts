import {
	PLAN_FREE,
	PRODUCT_1GB_SPACE,
	type PlanSlug,
	isWpcomEnterpriseGridPlan,
	isFreePlan,
	getPlanPath,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { useMemo } from '@wordpress/element';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks'; //TODO: move this out
import { getPlanCartItem } from 'calypso/lib/cart-values/cart-items';
import { addQueryArgs } from 'calypso/lib/url';
import type { GridPlan, PlanActions } from '@automattic/plans-grid-next';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

function usePlanActions(
	gridPlans: GridPlan[],
	flowName?: string | null,
	siteSlug?: string | null,
	withDiscount?: string,
	planActionCallback?: ( planSlug: PlanSlug ) => void,
	cartHandler?: ( cartItems?: MinimalRequestCartProduct[] | null ) => void
): PlanActions {
	const handleUpgradeClick = useCallback(
		( cartItems?: MinimalRequestCartProduct[] | null, clickedPlanSlug?: PlanSlug ) => {
			if ( isWpcomEnterpriseGridPlan( clickedPlanSlug ?? '' ) ) {
				recordTracksEvent( 'calypso_plan_step_enterprise_click', { flow: flowName } );
				window.open( 'https://wpvip.com/wordpress-vip-agile-content-platform', '_blank' );
				return;
			}
			const cartItemForPlan = getPlanCartItem( cartItems );
			const planSlug = clickedPlanSlug ?? PLAN_FREE;

			if ( isFreePlan( planSlug ) ) {
				recordTracksEvent( 'calypso_signup_free_plan_click' );
			}

			const earlyReturn = planActionCallback?.( planSlug );

			if ( earlyReturn ) {
				return;
			}

			const cartItemForStorageAddOn = cartItems?.find(
				( items ) => items.product_slug === PRODUCT_1GB_SPACE
			);

			if ( cartItemForStorageAddOn?.extra ) {
				recordTracksEvent( 'calypso_signup_storage_add_on_upgrade_click', {
					add_on_slug: cartItemForStorageAddOn.extra.feature_slug,
				} );
			}

			if ( cartHandler ) {
				cartHandler( cartItems );
				return;
			}

			const planPath = cartItemForPlan?.product_slug
				? getPlanPath( cartItemForPlan.product_slug )
				: '';

			const checkoutUrl = cartItemForStorageAddOn
				? `/checkout/${ siteSlug }/${ planPath },${ cartItemForStorageAddOn.product_slug }:-q-${ cartItemForStorageAddOn.quantity }`
				: `/checkout/${ siteSlug }/${ planPath }`;

			const checkoutUrlWithArgs = addQueryArgs(
				{ ...( withDiscount && { coupon: withDiscount } ) },
				checkoutUrl
			);

			page( checkoutUrlWithArgs );
		},
		[ flowName, siteSlug, withDiscount, planActionCallback, cartHandler ]
	);
	return useMemo( () => {
		return gridPlans.reduce( ( acc, gridPlan ) => {
			return {
				...acc,
				[ gridPlan.planSlug ]: ( isFreeTrialPlan?: boolean ) => {
					console.log( '----aaaaaa', isFreeTrialPlan );
				},
			};
		}, {} );
	}, [ gridPlans ] );
}

export default usePlanActions;
